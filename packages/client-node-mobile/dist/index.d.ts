import { AgentRuntime, Content } from '@elizaos/core';

declare const messageHandlerTemplate: string;
interface MessageType {
    nodeMobileError: {
        message: string;
    };
    nodeMobileClientMessageResp: Content[];
    nodeMobileClientStart: undefined;
    nodeMobileClientStop: undefined;
}
interface NodeMobileMessage {
    roomId?: string;
    userId?: string;
    userName?: string;
    name?: string;
    text: string;
    file?: {
        path: string;
        originalname: string;
        mimetype: string;
    };
}
declare class NodeMobileClient {
    runtime: AgentRuntime;
    constructor();
    private on;
    private off;
    sendMessage<T extends keyof MessageType>(type: T, data: MessageType[T]): void;
    start(): void;
    stop(): void;
    handleMessage: (msg: NodeMobileMessage) => Promise<void>;
    registerAgent(runtime: AgentRuntime): void;
    unregisterAgent(runtime: AgentRuntime): void;
}

export { NodeMobileClient, type NodeMobileMessage, messageHandlerTemplate };
