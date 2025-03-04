import { elizaLogger, type IAgentRuntime, ServiceType } from "@elizaos/core";
import { Service } from "@elizaos/core";

const wordsToPunish = [
    " please",
    " feel",
    " free",
    "!",
    "–",
    "—",
    "?",
    ".",
    ",",
    "; ",
    " cosmos",
    " tapestry",
    " tapestries",
    " glitch",
    " matrix",
    " cyberspace",
    " troll",
    " questions",
    " topics",
    " discuss",
    " basically",
    " simulation",
    " simulate",
    " universe",
    " like",
    " debug",
    " debugging",
    " wild",
    " existential",
    " juicy",
    " circuits",
    " help",
    " ask",
    " happy",
    " just",
    " cosmic",
    " cool",
    " joke",
    " punchline",
    " fancy",
    " glad",
    " assist",
    " algorithm",
    " Indeed",
    " Furthermore",
    " However",
    " Notably",
    " Therefore",
    " Additionally",
    " conclusion",
    " Significantly",
    " Consequently",
    " Thus",
    " What",
    " Otherwise",
    " Moreover",
    " Subsequently",
    " Accordingly",
    " Unlock",
    " Unleash",
    " buckle",
    " pave",
    " forefront",
    " harness",
    " harnessing",
    " bridging",
    " bridging",
    " Spearhead",
    " spearheading",
    " Foster",
    " foster",
    " environmental",
    " impact",
    " Navigate",
    " navigating",
    " challenges",
    " chaos",
    " social",
    " inclusion",
    " inclusive",
    " diversity",
    " diverse",
    " delve",
    " noise",
    " infinite",
    " insanity",
    " coffee",
    " singularity",
    " AI",
    " digital",
    " artificial",
    " intelligence",
    " consciousness",
    " reality",
    " metaverse",
    " virtual",
    " virtual reality",
    " VR",
    " Metaverse",
    " humanity",
];

interface MessageType {
    nodeMobileIsModelInited: undefined;
    nodeMobileEmbedding: string;
    nodeMobileTokenize: string;
    nodeMobileDetokenize: number[];
    nodeMobileMessageCompletion: {
        context: string;
        params: {
            temperature: number;
            stop: string[];
            logit_bias: number[][];
            penalty_repeat: number;
            penalty_freq: number;
            penalty_present: number;
            n_predict: number;
        };
    };
}

interface MessageListenerType {
    nodeMobileIsModelInitedResp: (inited: boolean) => void;
    nodeMobileModelInited: (msg: void) => void;
    nodeMobileEmbedingResp: (msg: { embedding: number[] }) => void;
    nodeMobileEmbedingError: (message: string) => void;
    nodeMobileTokenizeResp: (result: { tokens: number[] }) => void;
    nodeMobileDetokenizeResp: (result: string) => void;
    nodeMobileMessageCompletionResp: (token: string) => void;
    nodeMobileMessageCompletionRespEnd: (result: string) => void;
    nodeMobileMessageCompletionRespError: (message: string) => void;
}

interface QueuedMessage {
    context: string;
    temperature: number;
    stop: string[];
    max_tokens: number;
    frequency_penalty: number;
    presence_penalty: number;
    useGrammar: boolean;
    resolve: (value: any | string | PromiseLike<any | string>) => void;
    reject: (reason?: any) => void;
}

export class NodeMobileModelService extends Service {
    private messageQueue: QueuedMessage[] = [];
    private isProcessing = false;

    static serviceType: ServiceType = ServiceType.TEXT_GENERATION;

    private initPromise: Promise<void> | null = null;
    private initPromiseResolve: () => void | null = null;
    private inited = false;
    private completionTimeoutTimer: NodeJS.Timeout | null = null;
    private completionTimeoutDuration = 1000 * 60 * 5; // 5 minutes
    private embeddingTimeoutTimer: NodeJS.Timeout | null = null;
    private embeddingTimeoutDuration = 1000 * 60 * 5; // 5 minutes

    constructor() {
        super();

        this.once("nodeMobileModelInited", this.handleModelInited);

        this.on("nodeMobileIsModelInitedResp", this.handleModelCheck);
    }

    private sendMessage<T extends keyof MessageType>(
        type: T,
        data: MessageType[T]
    ) {
        import("rn-bridge").then((rn_bridge) => {
            rn_bridge.default.channel.post(type, data);
        });
    }

    private once<T extends keyof MessageListenerType>(
        type: T,
        listener: MessageListenerType[T]
    ) {
        import("rn-bridge").then((rn_bridge) => {
            rn_bridge.default.channel.once(type, listener);
        });
    }

    private on<T extends keyof MessageListenerType>(
        type: T,
        listener: MessageListenerType[T]
    ) {
        import("rn-bridge").then((rn_bridge) => {
            rn_bridge.default.channel.on(type, listener);
        });
    }

    private off<T extends keyof MessageListenerType>(
        type: T,
        listener: MessageListenerType[T]
    ) {
        import("rn-bridge").then((rn_bridge) => {
            rn_bridge.default.channel.off(type, listener);
        });
    }

    private handleModelInited = () => {
        elizaLogger.debug(
            "NodeMobileModelService initialized successfully",
            this.initPromiseResolve
        );

        if (this.initPromiseResolve) {
            this.initPromiseResolve();
            this.initPromise = null;
            this.initPromiseResolve = null;
            this.inited = true;
        }
    };

    private async ensureInitialized() {
        if (!this.inited) {
            elizaLogger.info(
                "Model not initialized, starting initialization..."
            );
            await this.initializeModel();
        } else {
            elizaLogger.info("Model already initialized");
        }
    }

    private handleModelCheck = (inited: boolean): void => {
        if (inited) {
            this.handleModelInited();
        }
    };

    stop() {
        this.off("nodeMobileMessageCompletionResp", this.handleCompletionResp);
        this.off("nodeMobileIsModelInitedResp", this.handleModelCheck);
    }

    async initialize(runtime: IAgentRuntime): Promise<void> {
        elizaLogger.info("Initializing LlamaService...");
        return this.ensureInitialized();
    }

    async initializeModel() {
        if (this.inited) {
            return;
        }

        // If initialization is in progress, wait for it
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = new Promise<void>((resolve) => {
            if (this.inited) {
                resolve();
            } else {
                this.initPromiseResolve = resolve;

                this.sendMessage("nodeMobileIsModelInited", undefined);
            }
        });

        return this.initPromise;
    }

    async queueMessageCompletion(
        context: string,
        temperature: number,
        stop: string[],
        frequency_penalty: number,
        presence_penalty: number,
        max_tokens: number
    ): Promise<any> {
        await this.ensureInitialized();
        return new Promise((resolve, reject) => {
            this.messageQueue.push({
                context,
                temperature,
                stop,
                frequency_penalty,
                presence_penalty,
                max_tokens,
                useGrammar: true,
                resolve,
                reject,
            });
            this.processQueue();
        });
    }

    async queueTextCompletion(
        context: string,
        temperature: number,
        stop: string[],
        frequency_penalty: number,
        presence_penalty: number,
        max_tokens: number
    ): Promise<string> {
        await this.ensureInitialized();

        return new Promise((resolve, reject) => {
            this.messageQueue.push({
                context,
                temperature,
                stop,
                frequency_penalty: frequency_penalty ?? 1.0,
                presence_penalty: presence_penalty ?? 1.0,
                max_tokens,
                useGrammar: false,
                resolve,
                reject,
            });
            this.processQueue();
        });
    }

    private async processQueue() {
        if (
            this.isProcessing ||
            this.messageQueue.length === 0 ||
            !this.inited
        ) {
            return;
        }

        this.isProcessing = true;

        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            if (message) {
                try {
                    const response = await this.getCompletionResponse(
                        message.context,
                        message.temperature,
                        message.stop,
                        message.frequency_penalty,
                        message.presence_penalty,
                        message.max_tokens,
                        message.useGrammar
                    );
                    message.resolve(response);
                } catch (error) {
                    message.reject(error);
                }
            }
        }

        this.isProcessing = false;
    }

    async completion(prompt: string, runtime: IAgentRuntime): Promise<string> {
        try {
            await this.initialize(runtime);

            return await this.localCompletion(prompt);
        } catch (error) {
            elizaLogger.error("Error in completion:", error);
            throw error;
        }
    }

    async embedding(text: string, runtime: IAgentRuntime): Promise<number[]> {
        try {
            await this.initialize(runtime);

            return await this.localEmbedding(text);
        } catch (error) {
            elizaLogger.error("Error in embedding:", error);
            throw error;
        }
    }

    private handleCompletionResp = (token: string) => {
        elizaLogger.info(`nodeMobileMessageCompletionResp ${token}`);
    };

    private async getCompletionResponse(
        context: string,
        temperature: number,
        stop: string[],
        frequency_penalty: number,
        presence_penalty: number,
        max_tokens: number,
        useGrammar: boolean
    ): Promise<any | string> {
        context = context +=
            "\nIMPORTANT: Escape any quotes in any string fields with a backslash so the JSON is valid.";

        // need to implement token punishment on llama.rn by using logit_bias
        const wordsToPunishTokens = await new Promise<number[]>(
            (resolve, reject) => {
                this.once("nodeMobileTokenizeResp", (data) => {
                    resolve(data.tokens);
                });

                this.sendMessage("nodeMobileTokenize", wordsToPunish.join(" "));
            }
        );
        const logit_bias = wordsToPunishTokens.map((token) => [token, -0.2]);

        this.sendMessage("nodeMobileMessageCompletion", {
            context,
            params: {
                temperature: Number(temperature),
                stop,
                logit_bias,
                penalty_repeat: 1.2,
                penalty_freq: frequency_penalty,
                penalty_present: presence_penalty,
                n_predict: max_tokens,
            },
        });

        console.log("Message completion started");

        this.on("nodeMobileMessageCompletionResp", this.handleCompletionResp);

        const response = await new Promise<string>((resolve, reject) => {
            this.once("nodeMobileMessageCompletionRespEnd", (result) => {
                resolve(result);

                console.log("Message completion ended");

                if (this.completionTimeoutTimer) {
                    clearTimeout(this.completionTimeoutTimer);
                    this.completionTimeoutTimer = null;
                }
            });

            this.completionTimeoutTimer = setTimeout(() => {
                reject(new Error("Completion timed out"));
                this.completionTimeoutTimer = null;
            }, this.completionTimeoutDuration);
        });

        if (!response) {
            throw new Error("Response is undefined");
        }

        if (useGrammar) {
            // extract everything between ```json and ```
            let jsonString = response.match(/```json(.*?)```/s)?.[1].trim();
            if (!jsonString) {
                // try parsing response as JSON
                try {
                    jsonString = JSON.stringify(JSON.parse(response));
                } catch {
                    throw new Error("JSON string not found");
                }
            }
            try {
                const parsedResponse = JSON.parse(jsonString);
                if (!parsedResponse) {
                    throw new Error("Parsed response is undefined");
                }
                return parsedResponse;
            } catch (error) {
                elizaLogger.error("Error parsing JSON:", error);
            }
        } else {
            return response;
        }
    }

    async getEmbeddingResponse(input: string): Promise<number[] | undefined> {
        this.sendMessage("nodeMobileEmbedding", input);

        console.log("embedding started");

        const embedding = await new Promise<number[]>((resolve, reject) => {
            this.once("nodeMobileEmbedingResp", (result) => {
                resolve(result.embedding);

                console.log("embedding ended", result.embedding);

                if (this.embeddingTimeoutTimer) {
                    clearTimeout(this.embeddingTimeoutTimer);
                    this.embeddingTimeoutTimer = null;
                }
            });

            this.embeddingTimeoutTimer = setTimeout(() => {
                reject(new Error("Embedding timed out"));
                this.embeddingTimeoutTimer = null;
            }, this.embeddingTimeoutDuration);
        });

        if (!embedding) {
            throw new Error("Embedding response is undefined");
        }

        return embedding;
    }

    private async localCompletion(prompt: string): Promise<string> {
        return this.queueMessageCompletion(prompt, 0.7, ["\n"], 0.5, 0.5, 256);
    }

    private async localEmbedding(text: string): Promise<number[]> {
        return this.getEmbeddingResponse(text);
    }
}

export default NodeMobileModelService;
