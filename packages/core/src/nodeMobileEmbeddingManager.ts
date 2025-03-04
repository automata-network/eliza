import elizaLogger from "./logger";
import { ModelSettings } from "./types";

export interface ModelConfig extends ModelSettings {
    dimensions: number;
}

interface MessageType {
    nodeMobileModelConfig: undefined;
    nodeMobileEmbedding: string;
    nodeMobileIsModelInited: undefined;
    nodeMobileTokenize: string;
    nodeMobileDetokenize: number[];
}

interface MessageListenerType {
    nodeMobileModelConfigResp: (msg: ModelConfig) => void;
    nodeMobileModelInited: (msg: void) => void;
    nodeMobileEmbedingResp: (msg: { embedding: number[] }) => void;
    nodeMobileIsModelInitedResp: (inited: boolean) => void;
    nodeMobileTokenizeResp: (result: { tokens: number[] }) => void;
    nodeMobileDetokenizeResp: (result: string) => void;
}

class NodeMobileModelManager {
    private static instance: NodeMobileModelManager | null;
    private initPromise: Promise<void> | null = null;
    private initPromiseResolve: () => void | null = null;
    private inited = false;
    private embeddingPromise: Promise<number[]> | null = null;
    private embeddingPromiseResolve: (embedding: number[]) => void | null =
        null;
    private embeddingPromiseReject: (e: unknown) => void | null = null;
    private timeoutTimer: NodeJS.Timeout | null = null;
    private timeoutDuration = 1000 * 60 * 5; // 5 minutes

    private constructor() {
        NodeMobileModelManager.once(
            "nodeMobileModelInited",
            this.handleModelInited
        );

        NodeMobileModelManager.on(
            "nodeMobileIsModelInitedResp",
            this.handleModelCheck
        );
    }

    static sendMessage<T extends keyof MessageType>(
        type: T,
        data: MessageType[T]
    ) {
        import("rn-bridge").then((rn_bridge) => {
            rn_bridge.default.channel.post(type, data);
        });
    }

    static once<T extends keyof MessageListenerType>(
        type: T,
        listener: MessageListenerType[T]
    ) {
        import("rn-bridge").then((rn_bridge) => {
            rn_bridge.default.channel.once(type, listener);
        });
    }

    static on<T extends keyof MessageListenerType>(
        type: T,
        listener: MessageListenerType[T]
    ) {
        import("rn-bridge").then((rn_bridge) => {
            rn_bridge.default.channel.on(type, listener);
        });
    }

    static off<T extends keyof MessageListenerType>(
        type: T,
        listener: MessageListenerType[T]
    ) {
        import("rn-bridge").then((rn_bridge) => {
            rn_bridge.default.channel.off(type, listener);
        });
    }

    public static getModelConfig(): Promise<ModelConfig> {
        return new Promise((resolve, reject) => {
            this.once("nodeMobileModelConfigResp", (msg) => {
                resolve(msg);
            });

            this.sendMessage("nodeMobileModelConfig", undefined);
        });
    }

    public static getInstance(): NodeMobileModelManager {
        if (!NodeMobileModelManager.instance) {
            NodeMobileModelManager.instance = new NodeMobileModelManager();
        }
        return NodeMobileModelManager.instance;
    }

    public async initialize(): Promise<void> {
        // If already initialized, return immediately
        if (this.inited) {
            return;
        }

        elizaLogger.debug("NodeMobileModelManager initialize0");

        // If initialization is in progress, wait for it
        if (this.initPromise) {
            return this.initPromise;
        }

        elizaLogger.debug("NodeMobileModelManager initialize1");

        this.initPromise = this.initializeModel();

        await this.initPromise;
    }

    private handleEmbedingResp = (msg: { embedding: number[] }): void => {
        elizaLogger.debug(
            "handleEmbedingResp",
            `${this.embeddingPromiseResolve != null}`
        );

        if (this.embeddingPromiseResolve) {
            this.embeddingPromiseResolve(msg.embedding);
        }

        elizaLogger.debug("handleEmbedingRespEnd");

        this.resetEmbeding();
    };

    private handleModelCheck = (inited: boolean): void => {
        if (inited) {
            this.handleModelInited();
        }
    };

    private handleModelInited = (): void => {
        elizaLogger.debug("NodeMobileModelManager initialized successfully");

        if (this.initPromiseResolve) {
            this.initPromiseResolve();
            this.initPromise = null;
            this.initPromiseResolve = null;
            this.inited = true;
        }
    };

    private async initializeModel(): Promise<void> {
        return new Promise((resolve) => {
            if (this.inited) {
                resolve();
            } else {
                this.initPromiseResolve = resolve;

                elizaLogger.debug("nodeMobileIsModelInited sent");

                NodeMobileModelManager.sendMessage(
                    "nodeMobileIsModelInited",
                    undefined
                );
            }
        });
    }

    public async generateEmbedding(input: string): Promise<number[]> {
        elizaLogger.debug(
            `NodeMobile embedding generation started: ${this.inited}`
        );

        if (!this.inited) {
            await this.initialize();
        }

        if (!this.inited) {
            throw new Error("Failed to initialize model");
        }

        elizaLogger.debug("NodeMobile embeddingPromise");

        if (this.embeddingPromise != null) {
            throw new Error(
                "NodeMobile embedding generation already in progress"
            );
        }

        try {
            this.embeddingPromise = new Promise<number[]>((resolve, reject) => {
                this.embeddingPromiseResolve = resolve;
                this.embeddingPromiseReject = reject;
            });

            this.timeoutTimer = setTimeout(() => {
                elizaLogger.debug("NodeMobile embedding generation timed out");

                this.resetEmbeding(
                    new Error("NodeMobile embedding generation timed out")
                );
            }, this.timeoutDuration);

            NodeMobileModelManager.once(
                "nodeMobileEmbedingResp",
                this.handleEmbedingResp
            );

            NodeMobileModelManager.sendMessage("nodeMobileEmbedding", input);

            elizaLogger.debug("NodeMobile embedding sendMessage", input);

            const embedding = await this.embeddingPromise;

            elizaLogger.debug("NodeMobile embedding generation completed");

            return this.processEmbedding(embedding);
        } catch (error) {
            elizaLogger.error(
                `NodeMobile embedding generation failed: ${
                    (error as Error).message
                }`
            );

            this.resetEmbeding(error);

            throw error;
        }
    }

    private processEmbedding(embedding: number[]): number[] {
        let finalEmbedding: number[];

        if (
            ArrayBuffer.isView(embedding) &&
            embedding.constructor === Float32Array
        ) {
            finalEmbedding = Array.from(embedding);
        } else if (
            Array.isArray(embedding) &&
            ArrayBuffer.isView(embedding[0]) &&
            embedding[0].constructor === Float32Array
        ) {
            finalEmbedding = Array.from(embedding[0]);
        } else if (Array.isArray(embedding)) {
            finalEmbedding = embedding;
        } else {
            throw new Error(
                `Unexpected NodeMobile embedding format: ${typeof embedding}`
            );
        }

        finalEmbedding = finalEmbedding.map((n) => Number(n));

        if (!Array.isArray(finalEmbedding) || finalEmbedding[0] === undefined) {
            throw new Error(
                "Invalid NodeMobile embedding format: must be an array starting with a number"
            );
        }

        if (finalEmbedding.length !== 384) {
            elizaLogger.warn(
                `Unexpected NodeMobile embedding dimension: ${finalEmbedding.length}`
            );
        }

        return finalEmbedding;
    }

    private async resetEmbeding(e?: Error): Promise<void> {
        if (this.embeddingPromiseReject && e != null) {
            this.embeddingPromiseReject(e);
        }

        this.embeddingPromise = null;
        this.embeddingPromiseResolve = null;
        this.embeddingPromiseReject = null;

        if (this.timeoutTimer) {
            clearTimeout(this.timeoutTimer);
            this.timeoutTimer = null;
        }
    }

    public async reset(): Promise<void> {
        this.initPromise = null;
        this.initPromiseResolve = null;
        this.inited = false;
        this.resetEmbeding(new Error("NodeMobile model reset"));
        NodeMobileModelManager.off(
            "nodeMobileIsModelInitedResp",
            this.handleModelCheck
        );
    }

    // For testing purposes
    public static resetInstance(): void {
        if (NodeMobileModelManager.instance) {
            NodeMobileModelManager.instance.reset();
            NodeMobileModelManager.instance = null;
        }
    }
}

export default NodeMobileModelManager;
