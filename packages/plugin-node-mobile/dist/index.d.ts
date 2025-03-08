import { Service, ServiceType, IAgentRuntime } from '@elizaos/core';

declare class NodeMobileModelService extends Service {
    private runtime;
    private messageQueue;
    private isProcessing;
    static serviceType: ServiceType;
    private initPromise;
    private initPromiseResolve;
    private inited;
    private embeddingTimeoutTimer;
    private embeddingTimeoutDuration;
    constructor();
    private sendMessage;
    private once;
    private on;
    private off;
    private ensureInitialized;
    private handleModelCheck;
    stop(): void;
    initialize(runtime: IAgentRuntime): Promise<void>;
    initializeModel(): Promise<void>;
    queueMessageCompletion(context: string, temperature: number, stop: string[], frequency_penalty: number, presence_penalty: number, max_tokens: number): Promise<any>;
    queueTextCompletion(context: string, temperature: number, stop: string[], frequency_penalty: number, presence_penalty: number, max_tokens: number): Promise<string>;
    private processQueue;
    completion(prompt: string, runtime: IAgentRuntime): Promise<string>;
    embedding(text: string, runtime: IAgentRuntime): Promise<number[]>;
    private handleCompletionResp;
    private getCompletionResponse;
    getEmbeddingResponse(input: string): Promise<number[] | undefined>;
    private localCompletion;
    private localEmbedding;
}

declare function createNodeMobilePlugin(): {
    readonly name: "node_mobile";
    readonly description: "plugin for node mobile runtime";
    readonly services: [NodeMobileModelService];
    readonly actions: [];
};

export { createNodeMobilePlugin };
