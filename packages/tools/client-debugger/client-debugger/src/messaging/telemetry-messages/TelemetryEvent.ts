/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { ITimestampedTelemetryEvent } from "../../TelemetryMetadata";
import { IDebuggerMessage } from "../Messages";

/**
 * Encapsulates types and logic related to {@link TelemetryEvent.Message}.
 *
 * @public
 */
export namespace TelemetryEvent {
	/**
	 * {@link TelemetryEvent.Message} {@link IDebuggerMessage."type"}.
	 *
	 * @public
	 */
	export const MessageType = "TELEMETRY_EVENT";

	/**
	 * Message data format used by {@link TelemetryEvent.Message}.
	 *
	 * @public
	 */
	export interface MessageData {
		/**
		 * The telemetry event that was logged.
		 */
		event: ITimestampedTelemetryEvent;
	}

	/**
	 * Outbound event indicating that a telemetry event has been generated by the application.
	 * Includes the contents of the telemetry event.
	 *
	 * @public
	 */
	export interface Message extends IDebuggerMessage<MessageData> {
		/**
		 * {@inheritDoc IDebuggerMessage."type"}
		 */
		type: typeof MessageType;
	}

	/**
	 * Creates a {@link TelemetryEvent.Message} from the provided {@link TelemetryEvent.MessageData}.
	 *
	 * @public
	 */
	export function createMessage(data: MessageData): Message {
		return {
			data,
			type: MessageType,
		};
	}
}