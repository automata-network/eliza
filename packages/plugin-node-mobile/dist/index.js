// src/service.ts
import {
  elizaLogger,
  ServiceType,
  settings
} from "@elizaos/core";
import { Service } from "@elizaos/core";
var wordsToPunish = [
  " please",
  " feel",
  " free",
  "!",
  "\u2013",
  "\u2014",
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
  " humanity"
];
var NodeMobileModelService = class extends Service {
  runtime;
  messageQueue = [];
  isProcessing = false;
  static serviceType = ServiceType.TEXT_GENERATION;
  initPromise = null;
  initPromiseResolve = null;
  inited = false;
  embeddingTimeoutTimer = null;
  embeddingTimeoutDuration = 1e3 * 60 * 5;
  // 5 minutes
  constructor() {
    super();
    this.on("nodeMobileIsModelInitedResp", this.handleModelCheck);
  }
  sendMessage(type, data) {
    import("rn-bridge").then((rn_bridge) => {
      rn_bridge.default.channel.post(type, data);
    });
  }
  once(type, listener) {
    import("rn-bridge").then((rn_bridge) => {
      rn_bridge.default.channel.once(type, listener);
    });
  }
  on(type, listener) {
    import("rn-bridge").then((rn_bridge) => {
      rn_bridge.default.channel.on(type, listener);
    });
  }
  off(type, listener) {
    import("rn-bridge").then((rn_bridge) => {
      rn_bridge.default.channel.off(type, listener);
    });
  }
  async ensureInitialized() {
    if (!this.inited) {
      elizaLogger.info(
        "Model not initialized, starting initialization..."
      );
      await this.initializeModel();
    } else {
      elizaLogger.info("Model already initialized");
    }
  }
  handleModelCheck = (inited) => {
    if (inited) {
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
    }
  };
  stop() {
    this.off("nodeMobileMessageCompletionResp", this.handleCompletionResp);
    this.off("nodeMobileIsModelInitedResp", this.handleModelCheck);
  }
  async initialize(runtime) {
    elizaLogger.info("Initializing LlamaService...");
    this.runtime = runtime;
    return this.ensureInitialized();
  }
  async initializeModel() {
    if (this.inited) {
      return;
    }
    if (this.initPromise) {
      return this.initPromise;
    }
    this.initPromise = new Promise((resolve) => {
      if (this.inited) {
        resolve();
      } else {
        this.initPromiseResolve = resolve;
        this.sendMessage("nodeMobileIsModelInited", void 0);
      }
    });
    return this.initPromise;
  }
  async queueMessageCompletion(context, temperature, stop, frequency_penalty, presence_penalty, max_tokens) {
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
        reject
      });
      this.processQueue();
    });
  }
  async queueTextCompletion(context, temperature, stop, frequency_penalty, presence_penalty, max_tokens) {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.messageQueue.push({
        context,
        temperature,
        stop,
        frequency_penalty: frequency_penalty ?? 1,
        presence_penalty: presence_penalty ?? 1,
        max_tokens,
        useGrammar: false,
        resolve,
        reject
      });
      this.processQueue();
    });
  }
  async processQueue() {
    if (this.isProcessing || this.messageQueue.length === 0 || !this.inited) {
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
  async completion(prompt, runtime) {
    try {
      await this.initialize(runtime);
      return await this.localCompletion(prompt);
    } catch (error) {
      elizaLogger.error("Error in completion:", error);
      throw error;
    }
  }
  async embedding(text, runtime) {
    try {
      await this.initialize(runtime);
      return await this.localEmbedding(text);
    } catch (error) {
      elizaLogger.error("Error in embedding:", error);
      throw error;
    }
  }
  handleCompletionResp = (token) => {
    elizaLogger.info(`nodeMobileMessageCompletionResp ${token}`);
  };
  async getCompletionResponse(context, temperature, stop, frequency_penalty, presence_penalty, max_tokens, useGrammar) {
    context = context += "\nIMPORTANT: Escape any quotes in any string fields with a backslash so the JSON is valid.";
    const wordsToPunishTokens = await new Promise(
      (resolve, reject) => {
        this.once("nodeMobileTokenizeResp", (data) => {
          resolve(data.tokens);
        });
        this.sendMessage("nodeMobileTokenize", wordsToPunish.join(" "));
      }
    );
    const logit_bias = wordsToPunishTokens.map((token) => [token, -0.2]);
    console.log("Message completion started");
    this.on("nodeMobileMessageCompletionResp", this.handleCompletionResp);
    const response = await new Promise((resolve, reject) => {
      this.once("nodeMobileMessageCompletionRespEnd", (result) => {
        resolve(result);
        console.log("Message completion ended");
      });
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
          system: this.runtime.character.system ?? settings.SYSTEM_PROMPT ?? void 0
        }
      });
    });
    if (!response) {
      throw new Error("Response is undefined");
    }
    if (useGrammar) {
      let jsonString = response.match(/```json(.*?)```/s)?.[1].trim();
      if (!jsonString) {
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
  async getEmbeddingResponse(input) {
    console.log("embedding started");
    const embedding = await new Promise((resolve, reject) => {
      this.once("nodeMobileEmbedingResp", (result) => {
        resolve(result.embedding);
        console.log("embedding ended", result.embedding);
        if (this.embeddingTimeoutTimer) {
          clearTimeout(this.embeddingTimeoutTimer);
          this.embeddingTimeoutTimer = null;
        }
      });
      this.sendMessage("nodeMobileEmbedding", input);
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
  async localCompletion(prompt) {
    return this.queueMessageCompletion(prompt, 0.7, ["\n"], 0.5, 0.5, 256);
  }
  async localEmbedding(text) {
    return this.getEmbeddingResponse(text);
  }
};
var service_default = NodeMobileModelService;

// src/index.ts
function createNodeMobilePlugin() {
  return {
    name: "node_mobile",
    description: "plugin for node mobile runtime",
    services: [new service_default()],
    actions: []
  };
}
export {
  createNodeMobilePlugin
};
//# sourceMappingURL=index.js.map