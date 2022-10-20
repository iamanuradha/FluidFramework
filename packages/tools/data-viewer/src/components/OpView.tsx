import { Stack } from "@fluentui/react";
import React from "react";

import { ISequencedDocumentMessage } from "@fluidframework/protocol-definitions";

import { Accordion } from "./Accordion";

/**
 * {@link OpView} input props.
 */
export interface OpViewProps {
    /**
     * The op (message) to render.
     */
    message: ISequencedDocumentMessage;

    /**
     * The client ID for the session.
     */
    clientId: string | undefined;
}

/**
 * Simple view for a single op (message).
 */
export function OpView(props: OpViewProps): React.ReactElement {
    const { message, clientId } = props;

    const opTimeStamp = new Date(message.timestamp);
    const nowTimeStamp = new Date();

    const wasOpToday = nowTimeStamp.getDate() === opTimeStamp.getDate();
    const doesOpBelongToMe = message.clientId === clientId;

    const header = (
        <Stack>
            <div>
                <b>Op #{message.sequenceNumber}</b>:{" "}
                {wasOpToday ? opTimeStamp.toTimeString() : opTimeStamp.toDateString()}
            </div>
        </Stack>
    );

    return (
        <Accordion
            header={header}
            headerStyles={{
                root: {
                    backgroundColor: doesOpBelongToMe ? "lightblue" : "lightyellow",
                },
            }}
        >
            <Stack>
                <div>
                    <b>Date: </b>
                    {opTimeStamp.toDateString()}
                </div>
                <div>
                    <b>Time: </b>
                    {opTimeStamp.toTimeString()}
                </div>
                <div>
                    <b>Client: </b>
                    {`${message.clientId}${doesOpBelongToMe ? " (me)" : ""}`}
                </div>
                <div>
                    <b>Type: </b>
                    {message.type}
                </div>
                <div>TODO: other op details</div>
            </Stack>
        </Accordion>
    );
}
