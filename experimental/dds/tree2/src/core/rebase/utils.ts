/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { assert } from "@fluidframework/common-utils";
import { ChangeRebaser, TaggedChange, tagRollbackInverse } from "./changeRebaser";
import { GraphCommit, mintRevisionTag, mintCommit } from "./types";

/**
 * Contains information about how the commit graph changed as the result of rebasing a source branch onto another target branch.
 */
export interface RebasedCommits<TChange> {
	/**
	 * The new common ancestor of the two branches, i.e. the commit where the rebased source branch now branches from the target branch.
	 * This is not always the same as the target commit of a rebase operation; sometimes the rebase will rebase past the target commit
	 * (see remarks in {@link rebaseBranch}).
	 */
	newBase: GraphCommit<TChange>;
	/**
	 * All commits that belonged to the source branch before the rebase, but no longer do after the rebase
	 */
	deletedSourceCommits: GraphCommit<TChange>[];
	/**
	 * All commits which were not part of the source branch before the rebase, but are after the rebase
	 */
	newSourceCommits: GraphCommit<TChange>[];
}

/**
 * Rebases a source branch onto another commit in a target branch.
 *
 * A "branch" is defined as a "head" commit and all ancestors of that commit, i.e. one linked list in a graph of commits.
 *
 * The source and target branch must share an ancestor.
 * @param changeRebaser - the change rebaser responsible for rebasing the changes in the commits of each branch
 * @param sourceHead - the head of the source branch, which will be rebased onto `targetHead`
 * @param targetHead - the commit to rebase the source branch onto
 * @returns the head of a rebased source branch, the cumulative change to the source branch (undefined if no change occurred),
 * and details about how the commits on the source branch changed
 * @remarks While a single branch must not have multiple commits with the same revision tag (that will result in undefined
 * behavior), there may be a commit on the source branch with the same revision tag as a commit on the target branch. If such
 * a pair is encountered while rebasing, it will be "cancelled out" in the new branch. For example:
 * ```
 * // (A)-(B)-(C) <- Branch X
 * //   \
 * //   (B')-(D) <- Branch Y
 * //
 * // As Branch Y is rebased onto Branch X, commits B and B' cancel out so there is no version of B on the new rebased source branch
 * //
 * // (A)-(B)-(C) <- Branch X
 * //           \
 * //           (D') <- Branch Y'
 * //
 * ```
 */
export function rebaseBranch<TChange>(
	changeRebaser: ChangeRebaser<TChange>,
	sourceHead: GraphCommit<TChange>,
	targetHead: GraphCommit<TChange>,
): [
	newSourceHead: GraphCommit<TChange>,
	sourceChange: TChange | undefined,
	commits: Omit<RebasedCommits<TChange>, "newBase">,
];

/**
 * Rebases a source branch onto another commit in a target branch.
 *
 * A "branch" is defined as a "head" commit and all ancestors of that commit, i.e. one linked list in a graph of commits.
 *
 * The source and target branch must share an ancestor.
 * @param changeRebaser - the change rebaser responsible for rebasing the changes in the commits of each branch
 * @param sourceHead - the head of the source branch, which will be rebased onto `newBase`
 * @param targetCommit - the commit on the target branch to rebase the source branch onto.
 * @param targetHead - the head of the branch that `newBase` belongs to. Must be `newBase` or a descendent of `newBase`.
 * @returns the head of a rebased source branch, the cumulative change to the source branch (undefined if no change occurred),
 * and details about how the commits on the source branch changed
 * @remarks While a single branch must not have multiple commits with the same revision tag (that will result in undefined
 * behavior), there may be a commit on the source branch with the same revision tag as a commit on the target branch. If such
 * a pair is encountered while rebasing, it will be "cancelled out" in the new branch. Additionally, this function will rebase
 * the source branch _farther_ than `newBase` if the source branch's next commits after `newBase` match those on the target branch.
 * For example:
 * ```
 * // (A)-(B)-(C)-(D)-(E) <- Branch X
 * //   \
 * //   (B')-(D')-(F) <- Branch Y
 * //
 * // If Branch Y is rebased onto commit C of Branch X, the branches must at least look like this afterwards (B was cancelled out):
 * //
 * // (A)-(B)-(C)-(D)-(E) <- Branch X
 * //           \
 * //           (D'')-(F') <- Branch Y'
 * //
 * // But this function will recognize that B is equivalent to B' and D is equivalent to D', and instead produce:
 * //
 * // (A)-(B)-(C)-(D)-(E) <- Branch X
 * //               \
 * //               (F') <- Branch Y'
 * ```
 */
export function rebaseBranch<TChange>(
	changeRebaser: ChangeRebaser<TChange>,
	sourceHead: GraphCommit<TChange>,
	targetCommit: GraphCommit<TChange>,
	targetHead: GraphCommit<TChange>,
): [
	newSourceHead: GraphCommit<TChange>,
	sourceChange: TChange | undefined,
	commits: RebasedCommits<TChange>,
];
export function rebaseBranch<TChange>(
	changeRebaser: ChangeRebaser<TChange>,
	sourceHead: GraphCommit<TChange>,
	targetCommit: GraphCommit<TChange>,
	targetHead = targetCommit,
): [
	newSourceHead: GraphCommit<TChange>,
	sourceChange: TChange | undefined,
	commits: RebasedCommits<TChange>,
] {
	// Get both source and target as path arrays
	const sourcePath: GraphCommit<TChange>[] = [];
	const targetPath: GraphCommit<TChange>[] = [];
	const ancestor = findCommonAncestor([sourceHead, sourcePath], [targetHead, targetPath]);
	assert(ancestor !== undefined, "branches must be related");

	// Find where `targetCommit` is in the target branch
	const targetCommitIndex = targetPath.findIndex((r) => r === targetCommit);
	if (targetCommitIndex === -1) {
		// If the targetCommit is not in the target path, then it is either disjoint from `target` or it is behind/at
		// the commit where source and target diverge (ancestor), in which case there is nothing more to rebase
		// TODO: Ideally, this would be an "assertExpensive"
		assert(
			findCommonAncestor(targetCommit, targetHead) !== undefined,
			"target commit is not in target branch",
		);
		return [
			sourceHead,
			undefined,
			{ newBase: ancestor, deletedSourceCommits: [], newSourceCommits: [] },
		];
	}

	// Iterate through the target path and look for commits that are also present on the source branch (i.e. they
	// have matching tags). Each commit found in the target branch can be skipped when processing the source branch
	// because it has already been rebased onto the target. In the case that one or more of these commits are present
	// directly after `targetCommit`, then the new base can be advanced further without having to do any work.
	const sourceSet = new Set(sourcePath.map((r) => r.revision));
	let newBaseIndex = targetCommitIndex;

	for (let i = 0; i < targetPath.length; i += 1) {
		const { revision } = targetPath[i];
		if (sourceSet.has(revision)) {
			sourceSet.delete(revision);
			newBaseIndex = Math.max(newBaseIndex, i);
		} else if (i >= targetCommitIndex) {
			break;
		}
	}

	/** The commit on the target branch that the new source branch branches off of (i.e. the new common ancestor) */
	const newBase = targetPath[newBaseIndex];
	// Figure out how much of the trunk to start rebasing over.
	const targetRebasePath = targetPath.slice(0, newBaseIndex + 1);
	const deletedSourceCommits = [...sourcePath];
	const newSourceCommits = [...targetRebasePath];

	// If the source and target rebase path begin with a range that has all the same revisions, remove it; it is
	// equivalent on both branches and doesn't need to be rebased.
	const minLength = Math.min(sourcePath.length, targetRebasePath.length);
	for (let i = 0; i < minLength; i++) {
		if (sourcePath[0].revision === targetRebasePath[0].revision) {
			sourcePath.shift();
			targetRebasePath.shift();
		}
	}

	// If all commits that are about to be rebased over on the target branch already comprise the start of the source branch,
	// are in the same order, and have no other commits interleaving them, then no rebasing needs to occur. Those commits can
	// simply be removed from the source branch, and the remaining commits on the source branch are reparented off of the new
	// base commit.
	if (targetRebasePath.length === 0) {
		for (const c of sourcePath) {
			newSourceCommits.push(
				mintCommit(newSourceCommits[newSourceCommits.length - 1] ?? newBase, c),
			);
		}
		return [
			newSourceCommits[newSourceCommits.length - 1],
			undefined,
			{
				newBase,
				deletedSourceCommits,
				newSourceCommits,
			},
		];
	}

	// For each source commit, rebase backwards over the inverses of any commits already rebased, and then
	// rebase forwards over the rest of the commits up to the new base before advancing the new base.
	let newHead = newBase;
	const inverses: TaggedChange<TChange>[] = [];
	for (const c of sourcePath) {
		if (sourceSet.has(c.revision)) {
			const change = rebaseChangeOverChanges(changeRebaser, c.change, [
				...inverses,
				...targetRebasePath,
			]);
			newHead = {
				revision: c.revision,
				sessionId: c.sessionId,
				change,
				parent: newHead,
			};
			newSourceCommits.push(newHead);
			targetRebasePath.push({ ...c, change });
		}
		inverses.unshift(
			tagRollbackInverse(changeRebaser.invert(c, true), mintRevisionTag(), c.revision),
		);
	}

	return [
		newHead,
		changeRebaser.compose([...inverses, ...targetRebasePath]),
		{
			newBase,
			deletedSourceCommits,
			newSourceCommits,
		},
	];
}

/**
 * "Sandwich/Horseshoe Rebase" a change over the given source and target branches
 * @param changeRebaser - the change rebaser responsible for rebasing the change over the commits in each branch
 * @param change - the change to rebase
 * @param sourceHead - the head of the branch that `change` is based on
 * @param targetHead - the branch to rebase `change` onto
 * @returns the rebased change
 */
export function rebaseChange<TChange>(
	changeRebaser: ChangeRebaser<TChange>,
	change: TChange,
	sourceHead: GraphCommit<TChange>,
	targetHead: GraphCommit<TChange>,
): TChange {
	const sourcePath: GraphCommit<TChange>[] = [];
	const targetPath: GraphCommit<TChange>[] = [];
	assert(
		findCommonAncestor([sourceHead, sourcePath], [targetHead, targetPath]) !== undefined,
		0x576 /* branch A and branch B must be related */,
	);

	const changeRebasedToRef = sourcePath.reduceRight(
		(newChange, branchCommit) =>
			changeRebaser.rebase(newChange, inverseFromCommit(changeRebaser, branchCommit)),
		change,
	);

	return targetPath.reduce((a, b) => changeRebaser.rebase(a, b), changeRebasedToRef);
}

function rebaseChangeOverChanges<TChange>(
	changeRebaser: ChangeRebaser<TChange>,
	changeToRebase: TChange,
	changesToRebaseOver: TaggedChange<TChange>[],
) {
	return changesToRebaseOver.reduce((a, b) => changeRebaser.rebase(a, b), changeToRebase);
}

function inverseFromCommit<TChange>(
	changeRebaser: ChangeRebaser<TChange>,
	commit: GraphCommit<TChange>,
): TaggedChange<TChange> {
	return tagRollbackInverse(
		changeRebaser.invert(commit, true),
		mintRevisionTag(),
		commit.revision,
	);
}

/**
 * Find an ancestor of some descendant.
 * @param descendant - a descendant. If an empty `path` array is included, it will be populated
 * with the chain of ancestry for `descendant` from most distant to closest (including `descendant`,
 * but not including the ancestor found by `predicate`).
 * @param predicate - a function which will be evaluated on every ancestor of `descendant` until it returns true.
 * @returns the closest ancestor of `descendant` that satisfies `predicate`, or `undefined` if no such ancestor exists.
 * @example
 * ```ts
 * interface Parented {
 *   id: string;
 *   parent?: Parented;
 * }
 * const g = { id: "g" }; // Grandparent
 * const p = { parent: g, id: "p" }; // Parent
 * const c = { parent: p, id: "c" }; // Child
 * const path: Parented[] = [];
 * const ancestor = findAncestor<Parented>([c, path], (n) => n.id === "g");
 * // ancestor === g
 * // path === [p, c]
 * ```
 */
export function findAncestor<T extends { parent?: T }>(
	descendant: T | [descendant: T, path?: T[]] | undefined,
	predicate: (t: T) => boolean,
): T | undefined {
	let d: T | undefined;
	let path: T[] | undefined;
	if (Array.isArray(descendant)) {
		[d, path] = descendant;
	} else {
		d = descendant;
	}
	for (let cur = d; cur !== undefined; cur = cur.parent) {
		if (predicate(cur)) {
			return cur;
		}
		path?.unshift(cur);
	}

	if (path !== undefined) {
		path.length = 0;
	}
	return undefined;
}

/**
 * Find a common ancestor between two descendants that are linked by parent pointers.
 * @param descendantA - a descendant. If an empty `path` array is included, it will be populated
 * with the chain of commits from the ancestor to `descendantA` (not including the ancestor).
 * @param descendantB - another descendant. If an empty `path` array is included, it will be populated
 * with the chain of commits from the ancestor to `descendantB` (not including the ancestor).
 * @returns the common ancestor of `descendantA` and `descendantB`, or `undefined` if no such ancestor exists.
 * @example
 * ```ts
 * interface Parented {
 *   parent?: Parented;
 * }
 * const shared = {};
 * const a = { parent: shared };
 * const b1 = { parent: shared };
 * const b2 = { parent: b1 };
 * const pathB: Parented[] = []
 * const ancestor = findCommonAncestor<Parented>(a, [b2, pathB]);
 * // ancestor === shared
 * // pathB === [b1, b2]
 * ```
 */
export function findCommonAncestor<T extends { parent?: T }>(
	descendantA: T | [descendantA: T, path?: T[]] | undefined,
	descendantB: T | [descendantB: T, path?: T[]] | undefined,
): T | undefined {
	let a: T | undefined;
	let b: T | undefined;
	let pathA: T[] | undefined;
	let pathB: T[] | undefined;
	if (Array.isArray(descendantA)) {
		[a, pathA] = descendantA;
		assert(pathA === undefined || pathA.length === 0, 0x578 /* Path A must be empty */);
	} else {
		a = descendantA;
	}
	if (Array.isArray(descendantB)) {
		[b, pathB] = descendantB;
		assert(pathB === undefined || pathB.length === 0, 0x579 /* Path B must be empty */);
	} else {
		b = descendantB;
	}

	if (a === b) {
		return a;
	}

	const visited = new Set();
	while (a !== undefined || b !== undefined) {
		if (a !== undefined) {
			if (visited.has(a)) {
				if (pathB !== undefined) {
					const indexInPathB = pathB.findIndex((r) => Object.is(r, a));
					pathB.splice(0, indexInPathB + 1);
				}
				return a;
			}
			visited.add(a);
			pathA?.unshift(a);
			a = a.parent;
		}

		if (b !== undefined) {
			if (visited.has(b)) {
				if (pathA !== undefined) {
					const indexInPathA = pathA.findIndex((r) => Object.is(r, b));
					pathA.splice(0, indexInPathA + 1);
				}
				return b;
			}
			visited.add(b);
			pathB?.unshift(b);
			b = b.parent;
		}
	}

	if (pathA !== undefined) {
		pathA.length = 0;
	}
	if (pathB !== undefined) {
		pathB.length = 0;
	}
	return undefined;
}