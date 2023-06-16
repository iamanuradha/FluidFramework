/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import {
	ICreateCommitParams,
	ICreateTreeEntry,
	ITree,
	IBlob,
	IRef,
	ITreeEntry,
} from "@fluidframework/gitresources";
import { getGitMode, getGitType } from "@fluidframework/protocol-base";
import { SummaryObject, SummaryType } from "@fluidframework/protocol-definitions";
import {
	IWholeFlatSummary,
	IWholeFlatSummaryBlob,
	IWholeFlatSummaryTreeEntry,
	IWholeSummaryBlob,
	IWholeSummaryPayload,
	IWholeSummaryTree,
	IWholeSummaryTreeHandleEntry,
	IWholeSummaryTreeValueEntry,
	IWriteSummaryResponse,
	NetworkError,
	WholeSummaryTreeEntry,
} from "@fluidframework/server-services-client";
import { Lumberjack } from "@fluidframework/server-services-telemetry";
import { NullExternalStorageManager } from "../externalStorageManager";
import { IRepositoryManager } from "./definitions";
import { MemFsManagerFactory } from "./filesystems";
import { GitRestLumberEventName } from "./gitrestTelemetryDefinitions";
import { IsomorphicGitManagerFactory } from "./isomorphicgitManager";

interface ISummaryVersion {
	/**
	 * Commit sha.
	 */
	id: string;
	/**
	 * Tree sha.
	 */
	treeId: string;
}

/**
 * A representation of a recursive Git Tree containing a map
 * with all of the referenced blobs. This can be stored as an
 * individual git blob using the `.fullTree` path.
 */
interface IFullGitTree {
	/**
	 * Original git tree object containing all tree entries.
	 */
	tree: ITree;
	/**
	 * Sha-Blob map of all blobs in this git tree.
	 */
	blobs: Record<string, IBlob>;
	/**
	 * Inform consumer that this tree contained "FullGitTree" blobs.
	 */
	parsedFullTreeBlobs: boolean;
}

/**
 * A representation of an IFullGitTree in summary format that
 * can be understood by Fluid.
 */
interface IFullSummaryTree {
	treeEntries: IWholeFlatSummaryTreeEntry[];
	blobs: IWholeFlatSummaryBlob[];
}

interface IWriteSummaryInfo {
	/**
	 * True if this is an initial summary for a new document.
	 */
	isNew: boolean;
	/**
	 * Response containing commit sha for "container" write or tree sha for "channel" write.
	 */
	writeSummaryResponse: IWriteSummaryResponse | IWholeFlatSummary;
}

interface ISummaryWriteOptions {
	/**
	 * WARNING: this option is highly optimized for read/write performance when using a storage solution
	 * with high overhead on individual read/writes, and it has a serious impact on storage space
	 * efficiency when maintaining all versions (summaries) of a document because Git cannot share blobs between
	 * summarie versions this way. For optimal results, it is recommended to only use this flag when writing an initial
	 * document summary, which is in the critical path for performance. Then future summaries will efficiently
	 * share unchanged blobs across versions as the summary size grows.
	 *
	 * Purpose: Uploading/downloading summaries from external filesystems using "Shredded Summary"
	 * format can be very slow due to I/O overhead. Enabling low I/O summary writing moves the majority
	 * of storage read/writes into memory and stores the resulting summary tree as a single blob in storage.
	 *
	 * Caveats: Low-io mode will likely use more memory than high-io when using a local FS,
	 * and as summary sizes grow, read/write speed worsens faster than in high-io mode. Low-io mode is not
	 * recommended when using a storage solution with low-overhead on individual read/writes.
	 *
	 * true: All summary writes will use low I/O mode
	 * false (default): No summary writes will use low I/O mode
	 * "initial": First summary write for a document will use low I/O mode
	 */
	enableLowIoWrite: "initial" | boolean;
	/**
	 * When writing a summary, we can skip or alter certain aspects of the summary write process
	 * to avoid unnecessary storage operations. This can improve performance when creating a new document.
	 */
	optimizeForInitialSummary: boolean;
}

const DefaultSummaryWriteOptions: ISummaryWriteOptions = {
	enableLowIoWrite: false,
	optimizeForInitialSummary: false,
};

/**
 * Convert a Summary Tree Entry into a SummaryObject for type reference.
 */
function getSummaryObjectFromWholeSummaryTreeEntry(entry: WholeSummaryTreeEntry): SummaryObject {
	if ((entry as IWholeSummaryTreeHandleEntry).id !== undefined) {
		return {
			type: SummaryType.Handle,
			handleType: entry.type === "tree" ? SummaryType.Tree : SummaryType.Blob,
			handle: (entry as IWholeSummaryTreeHandleEntry).id,
		};
	}
	if (entry.type === "blob") {
		return {
			type: SummaryType.Blob,
			// We don't use this in the code below. We mostly just care about summaryObject for type inference.
			content: "",
		};
	}
	if (entry.type === "tree") {
		return {
			type: SummaryType.Tree,
			// We don't use this in the code below. We mostly just care about summaryObject for type inference.
			tree: {},
			unreferenced: (entry as IWholeSummaryTreeValueEntry).unreferenced,
		};
	}
	throw new NetworkError(400, `Unknown entry type: ${entry.type}`);
}

/**
 * Package a Git tree into a Full Git Tree object by (optionally) parsing and unpacking
 * inner full git tree blobs and (optionally) retrieving all referenced blobs from storage.
 *
 * @param gitTree - Git tree object containing tree entries
 * @param repoManager - Repository manager to use for retrieving referenced blobs
 * @param parseInnerFullGitTrees - Whether to parse and unpack inner full git tree blobs
 * @param retrieveBlobs - Whether to retrieve blobs (other than full git trees) from storage
 * @param depth - internally tracks recursion depth for potential future logging or protection
 */
async function buildFullGitTreeFromGitTree(
	gitTree: ITree,
	repoManager: IRepositoryManager,
	blobCache: Record<string, IBlob> = {},
	parseInnerFullGitTrees = true,
	retrieveBlobs = true,
	depth = 0,
): Promise<IFullGitTree> {
	let parsedFullTreeBlobs = false;
	const blobPs: Promise<IBlob>[] = [];
	const treeEntries: ITreeEntry[] = [];
	const getBlob = async (sha: string): Promise<IBlob> =>
		blobCache[sha] ?? repoManager.getBlob(sha);
	for (const treeEntry of gitTree.tree) {
		if (treeEntry.type === "blob") {
			if (treeEntry.path.endsWith(fullTreePath) && parseInnerFullGitTrees) {
				parsedFullTreeBlobs = true;
				const fullTreeBlob = await getBlob(treeEntry.sha);
				const fullTree = JSON.parse(
					fullTreeBlob.encoding === "base64"
						? // Convert base64 to utf-8 for JSON parsing
						  Buffer.from(fullTreeBlob.content, fullTreeBlob.encoding).toString("utf-8")
						: fullTreeBlob.content,
				) as IFullGitTree;
				const builtFullGitTree = await buildFullGitTreeFromGitTree(
					fullTree.tree,
					repoManager,
					blobCache,
					true /* parseInnerFullGitTrees */,
					// All blobs associated with full git tree are included in the full git tree blob, and
					// will not exists in storage individually.
					false /* retrieveBlobs */,
					depth + 1,
				);
				const baseTreeEntryPath = treeEntry.path.replace(fullTreePath, "");
				treeEntries.push(
					...builtFullGitTree.tree.tree.map((fullTreeEntry) => ({
						...fullTreeEntry,
						path: `${baseTreeEntryPath}${fullTreeEntry.path}`,
					})),
				);
				const fullTreeBlobs = {
					...fullTree.blobs,
					...builtFullGitTree.blobs,
				};
				blobPs.push(...Object.values(fullTreeBlobs).map(async (blob) => blob));
				continue;
			} else if (retrieveBlobs) {
				blobPs.push(getBlob(treeEntry.sha));
			}
		}
		treeEntries.push(treeEntry);
	}
	const blobs = await Promise.all(blobPs);
	const blobMap = {};
	blobs.forEach((blob) => (blobMap[blob.sha] = blob));
	return {
		tree: {
			sha: gitTree.sha,
			url: gitTree.url,
			tree: treeEntries,
		},
		blobs: blobMap,
		parsedFullTreeBlobs,
	};
}

/**
 * Convert a Git blob object into Summary blob format.
 *
 * @param blob - Git blob to convert to summary blob
 * @returns summary blob
 */
function convertGitBlobToSummaryBlob(blob: IBlob): IWholeFlatSummaryBlob {
	return {
		content: blob.content,
		encoding: blob.encoding === "base64" ? "base64" : "utf-8",
		id: blob.sha,
		size: blob.size,
	};
}

/**
 * Convert a Full Git tree into summary format for use in Fluid.
 *
 * @param fullGitTree - Full Git tree to convert
 * @returns summary tree
 */
function convertFullGitTreeToFullSummaryTree(fullGitTree: IFullGitTree): IFullSummaryTree {
	const wholeFlatSummaryTreeEntries: IWholeFlatSummaryTreeEntry[] = [];
	const wholeFlatSummaryBlobs: IWholeFlatSummaryBlob[] = [];
	fullGitTree.tree.tree.forEach((treeEntry) => {
		if (treeEntry.type === "blob") {
			wholeFlatSummaryTreeEntries.push({
				type: "blob",
				id: treeEntry.sha,
				path: treeEntry.path,
			});
			wholeFlatSummaryBlobs.push(
				convertGitBlobToSummaryBlob(fullGitTree.blobs[treeEntry.sha]),
			);
		} else {
			wholeFlatSummaryTreeEntries.push({
				type: "tree",
				path: treeEntry.path,
			});
		}
	});
	return {
		treeEntries: wholeFlatSummaryTreeEntries,
		blobs: wholeFlatSummaryBlobs,
	};
}
/**
 * Convert a Full Summary tree into a Full Summary payload, which can then be used to
 * write that full summary into an alternate storage repo (e.g. in-memory)
 *
 * @param fullSummaryTree - Full summary tree to parse into a full summary payload
 * @returns full summary as a write payload
 */
function convertFullSummaryToWholeSummaryEntries(
	fullSummaryTree: IFullSummaryTree,
): WholeSummaryTreeEntry[] {
	const fullSummaryBlobMap = new Map<string, IWholeSummaryBlob>();
	fullSummaryTree.blobs.forEach((fullSummaryBlob) => {
		fullSummaryBlobMap.set(fullSummaryBlob.id, {
			type: "blob",
			content: fullSummaryBlob.content,
			encoding: fullSummaryBlob.encoding,
		});
	});

	// Inspired by `buildSummaryTreeHeirarchy` from services-client
	const lookup: { [path: string]: IWholeSummaryTreeValueEntry & { value: IWholeSummaryTree } } =
		{};
	const rootPath = ""; // This would normally be parentHandle, but only important when there are handles
	const root: IWholeSummaryTreeValueEntry & { value: IWholeSummaryTree } = {
		type: "tree",
		path: rootPath,
		value: {
			type: "tree",
			entries: [],
		},
	};
	lookup[rootPath] = root;
	for (const entry of fullSummaryTree.treeEntries) {
		const entryPath = entry.path;
		const lastIndex = entryPath.lastIndexOf("/");
		const entryPathDir = entryPath.slice(0, Math.max(0, lastIndex));
		const entryPathBase = entryPath.slice(lastIndex + 1);

		// The flat output is breadth-first so we can assume we see tree nodes prior to their contents
		const node = lookup[entryPathDir];
		if (!node.value.entries) {
			node.value.entries = [];
		}
		// Add in either the blob or tree
		if (entry.type === "tree") {
			const newTree: IWholeSummaryTreeValueEntry & { value: IWholeSummaryTree } = {
				type: "tree",
				path: entryPathBase,
				value: {
					type: "tree",
					entries: [],
				},
			};
			node.value.entries.push(newTree);
			lookup[entryPath] = newTree;
		} else if (entry.type === "blob") {
			const fullSummaryBlob = fullSummaryBlobMap.get(entry.id);
			if (!fullSummaryBlob) {
				throw new Error(`Could not find blob ${entry.id} in full summary`);
			}
			const newBlob: IWholeSummaryTreeValueEntry & { value: IWholeSummaryBlob } = {
				type: "blob",
				path: entryPathBase,
				value: fullSummaryBlob,
			};
			node.value.entries.push(newBlob);
		} else {
			throw new Error(`Unknown entry type!!`);
		}
	}
	return root.value.entries ?? [];
}

export const latestSummarySha = "latest";
const fullTreePath = ".fullTree";

export const isContainerSummary = (payload: IWholeSummaryPayload) => payload.type === "container";
export const isChannelSummary = (payload: IWholeSummaryPayload) => payload.type === "channel";

/**
 * Handles reading/writing summaries from/to storage when the client expects or sends summary information in
 * the "Whole Summary" format. This can help save bandwidth by reducing the HTTP overhead associated
 * with "Shredded Summary" format communication between the client and service.
 *
 * Internally, GitWholeSummaryManager uploads and reads from storage in the same way as a client
 * using "Shredded Summary" format would, unless the enableLowIoWrite option is/was used.
 */
export class GitWholeSummaryManager {
	private readonly entryHandleToObjectShaCache: Map<string, string> = new Map();
	private readonly writeOptions: ISummaryWriteOptions;

	constructor(
		private readonly documentId: string,
		private readonly repoManager: IRepositoryManager,
		private readonly lumberjackProperties: Record<string, any>,
		private readonly externalStorageEnabled = true,
		writeOptions?: Partial<ISummaryWriteOptions>,
	) {
		this.writeOptions = {
			...DefaultSummaryWriteOptions,
			...writeOptions,
		};
	}

	public async readSummary(sha: string): Promise<IWholeFlatSummary> {
		const readSummaryMetric = Lumberjack.newLumberMetric(
			GitRestLumberEventName.WholeSummaryManagerReadSummary,
			this.lumberjackProperties,
		);

		try {
			let version: ISummaryVersion;
			if (sha === latestSummarySha) {
				version = await this.getLatestVersion();
			} else {
				const commit = await this.repoManager.getCommit(sha);
				version = { id: commit.sha, treeId: commit.tree.sha };
			}
			const { treeEntries, blobs } = await this.readSummaryTreeCore(
				version.treeId,
				this.repoManager,
			);
			readSummaryMetric.success("GitWholeSummaryManager succeeded in reading summary");
			return {
				id: version.id,
				trees: [
					{
						id: version.treeId,
						entries: treeEntries,
						// We don't store sequence numbers in git
						sequenceNumber: undefined,
					},
				],
				blobs,
			};
		} catch (error: any) {
			readSummaryMetric.error("GitWholeSummaryManager failed to read summary", error);
			throw error;
		}
	}

	private async readSummaryTreeCore(
		treeId: string,
		repoManager: IRepositoryManager,
	): Promise<IFullSummaryTree> {
		const rawTree = await repoManager.getTree(treeId, true /* recursive */);
		const fullGitTree = await buildFullGitTreeFromGitTree(
			rawTree,
			repoManager,
			{} /* blobCache */,
			true /* parseInnerFullGitTrees */,
			true /* retrieveBlobs */,
		);
		return convertFullGitTreeToFullSummaryTree(fullGitTree);
	}

	private async getLatestVersion(): Promise<ISummaryVersion> {
		const commitDetails = await this.repoManager.getCommits(this.documentId, 1, {
			enabled: this.externalStorageEnabled,
		});
		return {
			id: commitDetails[0].sha,
			treeId: commitDetails[0].commit.tree.sha,
		};
	}

	public async writeSummary(
		payload: IWholeSummaryPayload,
		isInitial?: boolean,
	): Promise<IWriteSummaryInfo> {
		const writeSummaryMetric = Lumberjack.newLumberMetric(
			GitRestLumberEventName.WholeSummaryManagerWriteSummary,
			this.lumberjackProperties,
		);
		writeSummaryMetric.setProperty("enableLowIoWrite", this.writeOptions.enableLowIoWrite);
		writeSummaryMetric.setProperty(
			"optimizeForInitialSummary",
			this.writeOptions.optimizeForInitialSummary,
		);
		writeSummaryMetric.setProperty("isInitial", isInitial);
		try {
			if (isChannelSummary(payload)) {
				writeSummaryMetric.setProperty("summaryType", "channel");
				const summaryTreeHandle = await this.writeChannelSummary(payload);
				writeSummaryMetric.setProperty("treeSha", summaryTreeHandle);
				writeSummaryMetric.success(
					"GitWholeSummaryManager succeeded in writing channel summary",
				);
				return {
					isNew: false,
					writeSummaryResponse: {
						id: summaryTreeHandle,
					},
				};
			}
			if (isContainerSummary(payload)) {
				writeSummaryMetric.setProperty("summaryType", "container");
				const writeSummaryInfo = await this.writeContainerSummary(payload, isInitial);
				writeSummaryMetric.setProperty("newDocument", writeSummaryInfo.isNew);
				writeSummaryMetric.setProperty(
					"commitSha",
					writeSummaryInfo.writeSummaryResponse.id,
				);
				writeSummaryMetric.success(
					"GitWholeSummaryManager succeeded in writing container summary",
				);
				return writeSummaryInfo;
			}
			throw new NetworkError(400, `Unknown Summary Type: ${payload.type}`);
		} catch (error: any) {
			writeSummaryMetric.error("GitWholeSummaryManager failed to write summary", error);
			throw error;
		}
	}

	private async getDocRef(): Promise<IRef | undefined> {
		const ref: IRef | undefined = await this.repoManager
			.getRef(`refs/heads/${this.documentId}`, { enabled: this.externalStorageEnabled })
			.catch(() => undefined);
		return ref;
	}

	private async writeChannelSummary(payload: IWholeSummaryPayload): Promise<string> {
		const useLowIoWrite = this.writeOptions.enableLowIoWrite === true;
		const existingRef: IRef | undefined = useLowIoWrite ? await this.getDocRef() : undefined;
		const fullGitTree = await this.writeSummaryTree(
			payload.entries,
			existingRef,
			useLowIoWrite,
			false /* precomputeFullTree */,
		);
		return fullGitTree.tree.sha;
	}

	private async writeContainerSummary(
		payload: IWholeSummaryPayload,
		isInitial?: boolean,
	): Promise<IWriteSummaryInfo> {
		// Ref will not exist for an initial summary, so do not bother checking.
		const existingRef =
			this.writeOptions.optimizeForInitialSummary && isInitial === true
				? undefined
				: await this.getDocRef();

		const isNewDocument = !existingRef && payload.sequenceNumber === 0;
		const useLowIoWrite =
			this.writeOptions.enableLowIoWrite === true ||
			(isNewDocument && this.writeOptions.enableLowIoWrite === "initial");

		const fullGitTree = await this.writeSummaryTree(
			payload.entries,
			existingRef,
			useLowIoWrite,
		);

		const commitMessage = isNewDocument
			? "New document"
			: // Checking client vs. service summary involves checking whether .protocol payload entry
			  // is a handle or value. At the moment, there is no real need for this message to distinguish the two.
			  `Summary @${payload.sequenceNumber}`;
		const commitParams: ICreateCommitParams = {
			author: {
				date: new Date().toISOString(),
				email: "dummy@microsoft.com",
				name: "GitRest Service",
			},
			message: commitMessage,
			parents: existingRef ? [existingRef.object.sha] : [],
			tree: fullGitTree.tree.sha,
		};
		const commit = await this.repoManager.createCommit(commitParams);

		// eslint-disable-next-line unicorn/prefer-ternary
		if (existingRef) {
			await this.repoManager.patchRef(
				`refs/heads/${this.documentId}`,
				{
					force: true,
					sha: commit.sha,
				},
				{ enabled: this.externalStorageEnabled },
			);
		} else {
			await this.repoManager.createRef(
				{
					ref: `refs/heads/${this.documentId}`,
					sha: commit.sha,
					// Bypass internal check for ref existance if possible, because we already know the ref does not exist.
					force: true,
				},
				{ enabled: this.externalStorageEnabled },
			);
		}

		const fullSummaryTree = convertFullGitTreeToFullSummaryTree(fullGitTree);
		const wholeFlatSummary: IWholeFlatSummary = {
			id: commit.sha,
			trees: [
				{
					id: fullGitTree.tree.sha,
					entries: fullSummaryTree.treeEntries,
					// We don't store sequence numbers in git
					sequenceNumber: undefined,
				},
			],
			blobs: fullSummaryTree.blobs,
		};

		return {
			isNew: isNewDocument,
			writeSummaryResponse: wholeFlatSummary,
		};
	}

	private async writeSummaryTree(
		wholeSummaryTreeEntries: WholeSummaryTreeEntry[],
		existingRef: IRef | undefined,
		useLowIoWrite: boolean = false,
		precomputeFullTree: boolean = true,
	): Promise<IFullGitTree> {
		if (!useLowIoWrite) {
			return this.writeSummaryTreeCore(
				wholeSummaryTreeEntries,
				this.repoManager,
				precomputeFullTree,
			);
		}

		const inMemoryFsManagerFactory = new MemFsManagerFactory();
		const inMemoryRepoManagerFactory = new IsomorphicGitManagerFactory(
			{
				baseDir: "/usr/gitrest",
				useRepoOwner: true,
			},
			inMemoryFsManagerFactory,
			inMemoryFsManagerFactory,
			new NullExternalStorageManager(),
			true /* repoPerDocEnabled */,
			false /* enableRepositoryManagerMetrics */,
		);
		const inMemoryRepoManager = await inMemoryRepoManagerFactory.create({
			repoOwner: "gitrest",
			repoName: this.documentId,
			storageRoutingId: {
				tenantId: "internal",
				documentId: this.documentId,
			},
		});
		try {
			const fullGitTree = await this.inMemorySummaryTreeComputationCore(
				wholeSummaryTreeEntries,
				existingRef,
				inMemoryRepoManager,
			);
			return this.writeSummaryTreeCore(
				[
					{
						path: fullTreePath,
						type: "blob",
						value: {
							type: "blob",
							content: JSON.stringify(fullGitTree),
							encoding: "utf-8",
						},
					},
				],
				this.repoManager,
			);
		} finally {
			// Ensure temporary in-memory volume is destroyed.
			inMemoryFsManagerFactory.volume.reset();
		}
	}

	private async inMemorySummaryTreeComputationCore(
		wholeSummaryTreeEntries: WholeSummaryTreeEntry[],
		existingRef: IRef | undefined,
		inMemoryRepoManager: IRepositoryManager,
	): Promise<IFullGitTree> {
		if (existingRef) {
			// Update in-memory repo manager with previous summary for handle references.
			const previousSummary = await this.readSummary(existingRef.object.sha);
			const fullSummaryPayload = convertFullSummaryToWholeSummaryEntries({
				treeEntries: previousSummary.trees[0].entries,
				blobs: previousSummary.blobs ?? [],
			});
			const previousSummaryMemoryFullGitTree = await this.writeSummaryTreeCore(
				fullSummaryPayload,
				inMemoryRepoManager,
			);
			for (const treeEntry of previousSummaryMemoryFullGitTree.tree.tree) {
				// Update entry handle to object sha map for reference when writing summary handles.
				this.entryHandleToObjectShaCache.set(
					`${existingRef.object.sha}/${treeEntry.path}`,
					treeEntry.sha,
				);
			}
		}

		const writeSummaryIntoMemory = async () =>
			this.writeSummaryTreeCore(wholeSummaryTreeEntries, inMemoryRepoManager);
		const inMemorySummaryFullGitTree = await writeSummaryIntoMemory().catch(async (error) => {
			if (
				error?.caller === "git.walk" &&
				error.code === "NotFoundError" &&
				typeof error.data?.what === "string"
			) {
				// This is caused by the previous channel summary tree being missing.
				// Fetch the missing tree, write it into the in-memory storage, then retry.
				const missingTreeSha = error.data.what;
				const missingTree = await this.repoManager.getTree(
					missingTreeSha,
					true /* recursive */,
				);
				const fullTree = await buildFullGitTreeFromGitTree(
					missingTree,
					this.repoManager,
					{} /* blobCache */,
					false /* parseInnerFullGitTrees */,
					true /* retrieveBlobs */,
				);
				const writtenTreeHandle = await this.writeFullGitTreeAsSummaryTree(
					fullTree,
					inMemoryRepoManager,
				);
				if (writtenTreeHandle !== missingTreeSha) {
					Lumberjack.error(
						`Attempted to recover from missing git object (${missingTreeSha}), but recovered data sha (${writtenTreeHandle}) did not match.`,
						this.lumberjackProperties,
					);
					throw new NetworkError(
						500,
						"Failed to compute new container summary.",
						false /* canRetry */,
					);
				}
				return writeSummaryIntoMemory();
			} else {
				throw error;
			}
		});
		return inMemorySummaryFullGitTree;
	}

	private async writeSummaryTreeCore(
		wholeSummaryTreeEntries: WholeSummaryTreeEntry[],
		repoManager: IRepositoryManager,
		precomputeFullTree: boolean = true,
		currentPath: string = "",
		treeCache: Record<string, ITree> = {},
		blobCache: Record<string, IBlob> = {},
	): Promise<IFullGitTree> {
		const entries: ICreateTreeEntry[] = await Promise.all(
			wholeSummaryTreeEntries.map(async (entry) => {
				return this.writeSummaryTreeObject(
					entry,
					repoManager,
					precomputeFullTree,
					currentPath,
					treeCache,
					blobCache,
				);
			}),
		);

		const createdTree = await repoManager.createTree({ tree: entries });
		if (!precomputeFullTree || currentPath !== "") {
			return {
				tree: createdTree,
				blobs: blobCache,
				parsedFullTreeBlobs: false,
			};
		}
		const retrieveEntries = async (tree: ITree, path: string = ""): Promise<ITreeEntry[]> => {
			const treeEntries: ITreeEntry[] = [];
			for (const treeEntry of tree.tree) {
				const entryPath = path ? `${path}/${treeEntry.path}` : treeEntry.path;
				treeEntries.push({
					...treeEntry,
					path: entryPath,
				});
				if (treeEntry.type === "tree") {
					const cachedTree: ITree | undefined = treeCache[treeEntry.sha];
					if (!cachedTree) {
						// This is likely caused by a Handle object in the written tree.
						// We must retrieve it to send a full summary back to historian.
						const missingTree = await repoManager.getTree(
							treeEntry.sha,
							true /* recursive */,
						);
						treeEntries.push(
							...missingTree.tree.map((entry) => ({
								...entry,
								path: `${entryPath}/${entry.path}`,
							})),
						);
					} else {
						treeEntries.push(...(await retrieveEntries(cachedTree, entryPath)));
					}
				}
			}
			return treeEntries;
		};
		const gitTreeEntries = await retrieveEntries(createdTree);
		const computedGitTree: ITree = {
			sha: createdTree.sha,
			url: createdTree.url,
			tree: gitTreeEntries,
		};
		return buildFullGitTreeFromGitTree(
			computedGitTree,
			repoManager,
			blobCache,
			true /* parseInnerFullGitTrees */,
			true /* retrieveBlobs */,
		);
	}

	private async writeSummaryTreeObject(
		wholeSummaryTreeEntry: WholeSummaryTreeEntry,
		repoManager: IRepositoryManager,
		precomputeFullTree: boolean,
		currentPath: string,
		treeCache: Record<string, ITree>,
		blobCache: Record<string, IBlob>,
	): Promise<ICreateTreeEntry> {
		const summaryObject = getSummaryObjectFromWholeSummaryTreeEntry(wholeSummaryTreeEntry);
		const type = getGitType(summaryObject);
		const path = wholeSummaryTreeEntry.path;
		const fullPath = currentPath
			? `${currentPath}/${wholeSummaryTreeEntry.path}`
			: wholeSummaryTreeEntry.path;
		const mode = getGitMode(summaryObject);
		let sha: string;
		let url: string;
		let size: number;
		// eslint-disable-next-line unicorn/prefer-switch
		if (summaryObject.type === SummaryType.Blob) {
			const blob = (wholeSummaryTreeEntry as IWholeSummaryTreeValueEntry)
				.value as IWholeSummaryBlob;
			const blobResponse = await repoManager.createBlob({
				content: blob.content,
				encoding: blob.encoding,
			});
			sha = blobResponse.sha;
			url = blobResponse.url;
			size = blob.content.length;
			// Store blob in cache for use upstream
			blobCache[sha] = {
				content: blob.content,
				encoding: blob.encoding,
				sha,
				url,
				size,
			};
		} else if (summaryObject.type === SummaryType.Tree) {
			const fullGitTree = await this.writeSummaryTreeCore(
				((wholeSummaryTreeEntry as IWholeSummaryTreeValueEntry).value as IWholeSummaryTree)
					.entries ?? [],
				repoManager,
				precomputeFullTree,
				fullPath,
				treeCache,
				blobCache,
			);
			sha = fullGitTree.tree.sha;
			url = fullGitTree.tree.url;
			size = fullGitTree.tree.tree.length;
			treeCache[sha] = {
				sha,
				url,
				tree: fullGitTree.tree.tree,
			};
		} else if (summaryObject.type === SummaryType.Handle) {
			sha = await this.getShaFromTreeHandleEntry(
				wholeSummaryTreeEntry as IWholeSummaryTreeHandleEntry,
			);
		} else {
			// Invalid/unimplemented summary object type
			throw new NetworkError(501, "Not Implemented");
		}
		const createEntry: ICreateTreeEntry = {
			mode,
			path,
			sha,
			type,
		};
		return createEntry;
	}

	private async writeFullGitTreeAsSummaryTree(
		fullGitTree: IFullGitTree,
		repoManager: IRepositoryManager,
	): Promise<string> {
		const fullSummaryTree = convertFullGitTreeToFullSummaryTree(fullGitTree);
		const wholeSummaryTreeEntries = convertFullSummaryToWholeSummaryEntries(fullSummaryTree);
		const tree = await this.writeSummaryTreeCore(wholeSummaryTreeEntries, repoManager);
		return tree.tree.sha;
	}

	private async getShaFromTreeHandleEntry(entry: IWholeSummaryTreeHandleEntry): Promise<string> {
		if (!entry.id) {
			throw new NetworkError(400, `Empty summary tree handle`);
		}
		if (entry.id.split("/").length === 1) {
			// The entry id is already a sha, so just return it
			return entry.id;
		}

		const cachedSha = this.entryHandleToObjectShaCache.get(entry.id);
		if (cachedSha) {
			return cachedSha;
		}

		// The entry is in the format { id: `<parent commit sha>/<tree path>`, path: `<tree path>` }
		const parentHandle = entry.id.split("/")[0];
		// Must use `this.repoManager` to ensure that we retrieve the shas from storage, not memory
		const parentCommit = await this.repoManager.getCommit(parentHandle);
		const parentTree = await this.repoManager.getTree(
			parentCommit.tree.sha,
			true /* recursive */,
		);
		const gitTree: IFullGitTree = await buildFullGitTreeFromGitTree(
			parentTree,
			this.repoManager,
			{} /* blobCache */,
			// Parse inner git tree blobs so that we can properly reference blob shas in new summary.
			true /* parseInnerFullGitTrees */,
			// We only need shas here, so don't waste resources retrieving blobs that are not included in fullGitTrees.
			false /* retrieveBlobs */,
		);
		if (gitTree.parsedFullTreeBlobs && this.writeOptions.enableLowIoWrite !== true) {
			// If the git tree/blob shas being referenced by a shredded summary write (high-io write) with handles
			// are hidden within a fullGitTree blob, we need to write those hidden blobs as individual trees/blobs
			// into storage so that they can be appropriately referenced by the uploaded summary tree.
			await this.writeFullGitTreeAsSummaryTree(gitTree, this.repoManager);
		}
		for (const treeEntry of gitTree.tree.tree) {
			this.entryHandleToObjectShaCache.set(
				`${parentHandle}/${treeEntry.path}`,
				treeEntry.sha,
			);
		}
		const sha = this.entryHandleToObjectShaCache.get(entry.id);
		if (!sha) {
			throw new NetworkError(
				404,
				`Summary tree handle object not found: id: ${entry.id}, path: ${entry.path}`,
			);
		}
		return sha;
	}
}
