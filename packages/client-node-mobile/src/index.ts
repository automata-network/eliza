import {
    type AgentRuntime,
    elizaLogger,
    messageCompletionFooter,
    type Media,
    getEmbeddingZeroVector,
    composeContext,
    generateMessageResponse,
    type Content,
    type Memory,
    ModelClass,
    stringToUuid,
} from "@elizaos/core";
import rn_bridge from "rn-bridge";

export const messageHandlerTemplate =
    // {{goals}}
    // "# Action Examples" is already included
    `{{actionExamples}}
(Action examples are for reference only. Do not use the information from them in your response.)

# Knowledge
{{knowledge}}

# Task: Generate dialog and actions for the character {{agentName}}.
About {{agentName}}:
{{bio}}
{{lore}}

{{providers}}

{{attachments}}

# Capabilities
Note that {{agentName}} is capable of reading/seeing/hearing various forms of media, including images, videos, audio, plaintext and PDFs. Recent attachments have been included above under the "Attachments" section.

{{messageDirections}}

{{recentMessages}}

{{actions}}

# Instructions: Write the next message for {{agentName}}.
` + messageCompletionFooter;

interface MessageType {
    nodeMobileError: { message: string };
    nodeMobileClientMessageResp: Content[];
    nodeMobileClientStart: undefined;
    nodeMobileClientStop: undefined;
}

export interface NodeMobileMessage {
    roomId?: string;
    userId?: string;
    userName?: string;
    name?: string;
    text: string;
    file?: { path: string; originalname: string; mimetype: string };
}

interface MessageListenerType {
    nodeMobileClientMessage: (msg: NodeMobileMessage) => void;
}

export class NodeMobileClient {
    runtime: AgentRuntime;

    constructor() {}

    private on<T extends keyof MessageListenerType>(
        type: T,
        listener: MessageListenerType[T]
    ) {
        rn_bridge.channel.on(type, listener);
    }

    private off<T extends keyof MessageListenerType>(
        type: T,
        listener: MessageListenerType[T]
    ) {
        rn_bridge.channel.off(type, listener);
    }

    sendMessage<T extends keyof MessageType>(type: T, data: MessageType[T]) {
        rn_bridge.channel.post(type, data);
    }

    start() {
        elizaLogger.log("NodeMobileClient start");

        this.sendMessage("nodeMobileClientStart", undefined);

        this.on("nodeMobileClientMessage", this.handleMessage);
    }

    stop() {
        elizaLogger.log("NodeMobileClient stop");

        this.sendMessage("nodeMobileClientStop", undefined);

        this.off("nodeMobileClientMessage", this.handleMessage);
    }

    handleMessage = async (msg: NodeMobileMessage) => {
        elizaLogger.log("NodeMobileClient listenOnMessage", msg);
        const runtime = this.runtime;

        if (!runtime) {
            this.sendMessage("nodeMobileError", { message: "Agent not found" });
            return;
        }

        const agentId = this.runtime.agentId;
        const roomId = stringToUuid(msg.roomId ?? "default-room-" + agentId);
        const userId = stringToUuid(msg.userId ?? "user");

        await runtime.ensureConnection(
            userId,
            roomId,
            msg.userName,
            msg.name,
            "node-mobile"
        );

        const text = msg.text;
        // if empty text, directly return
        if (!text) {
            this.sendMessage("nodeMobileClientMessageResp", []);
            return;
        }

        const messageId = stringToUuid(Date.now().toString());

        const attachments: Media[] = [];
        if (msg.file) {
            attachments.push({
                id: Date.now().toString(),
                url: msg.file.path,
                title: msg.file.originalname,
                source: "direct",
                description: `Uploaded file: ${msg.file.originalname}`,
                text: "",
                contentType: msg.file.mimetype,
            });
        }

        const content: Content = {
            text,
            attachments,
            source: "node-mobile",
            inReplyTo: undefined,
        };

        const userMessage = {
            content,
            userId,
            roomId,
            agentId: runtime.agentId,
        };

        const memory: Memory = {
            id: stringToUuid(messageId + "-" + userId),
            ...userMessage,
            agentId: runtime.agentId,
            userId,
            roomId,
            content,
            createdAt: Date.now(),
        };

        await runtime.messageManager.addEmbeddingToMemory(memory);
        await runtime.messageManager.createMemory(memory);

        let state = await runtime.composeState(userMessage, {
            agentName: runtime.character.name,
        });

        const context = composeContext({
            state,
            template: messageHandlerTemplate,
        });

        const response = await generateMessageResponse({
            runtime: runtime,
            context,
            modelClass: ModelClass.EMBEDDING,
        });

        if (!response) {
            this.sendMessage("nodeMobileError", {
                message: "No response from generateMessageResponse",
            });
            return;
        }

        // save response to memory
        const responseMessage: Memory = {
            id: stringToUuid(messageId + "-" + runtime.agentId),
            ...userMessage,
            userId: runtime.agentId,
            content: response,
            embedding: await getEmbeddingZeroVector(),
            createdAt: Date.now(),
        };

        await runtime.messageManager.createMemory(responseMessage);

        state = await runtime.updateRecentMessageState(state);

        let message = null as Content | null;

        await runtime.processActions(
            memory,
            [responseMessage],
            state,
            async (newMessages) => {
                message = newMessages;
                return [memory];
            }
        );

        await runtime.evaluate(memory, state);

        // Check if we should suppress the initial message
        const action = runtime.actions.find((a) => a.name === response.action);
        const shouldSuppressInitialMessage = action?.suppressInitialMessage;

        if (!shouldSuppressInitialMessage) {
            if (message) {
                this.sendMessage("nodeMobileClientMessageResp", [
                    response,
                    message,
                ]);
            } else {
                this.sendMessage("nodeMobileClientMessageResp", [response]);
            }
        } else {
            if (message) {
                this.sendMessage("nodeMobileClientMessageResp", [message]);
            } else {
                this.sendMessage("nodeMobileClientMessageResp", []);
            }
        }
    };

    // agent/src/index.ts:startAgent calls this
    public registerAgent(runtime: AgentRuntime) {
        // register any plugin endpoints?
        // but once and only once
        this.runtime = runtime;
    }

    public unregisterAgent(runtime: AgentRuntime) {
        this.runtime = undefined;
    }
}
