// src/index.ts
import {
  elizaLogger,
  messageCompletionFooter,
  getEmbeddingZeroVector,
  composeContext,
  generateMessageResponse,
  ModelClass,
  stringToUuid
} from "@elizaos/core";
import rn_bridge from "rn-bridge";
var messageHandlerTemplate = (
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
` + messageCompletionFooter
);
var NodeMobileClient = class {
  runtime;
  constructor() {
  }
  on(type, listener) {
    rn_bridge.channel.on(type, listener);
  }
  off(type, listener) {
    rn_bridge.channel.off(type, listener);
  }
  sendMessage(type, data) {
    rn_bridge.channel.post(type, data);
  }
  start() {
    elizaLogger.log("NodeMobileClient start");
    this.sendMessage("nodeMobileClientStart", void 0);
    this.on("nodeMobileClientMessage", this.handleMessage);
  }
  stop() {
    elizaLogger.log("NodeMobileClient stop");
    this.sendMessage("nodeMobileClientStop", void 0);
    this.off("nodeMobileClientMessage", this.handleMessage);
  }
  handleMessage = async (msg) => {
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
    if (!text) {
      this.sendMessage("nodeMobileClientMessageResp", []);
      return;
    }
    const messageId = stringToUuid(Date.now().toString());
    const attachments = [];
    if (msg.file) {
      attachments.push({
        id: Date.now().toString(),
        url: msg.file.path,
        title: msg.file.originalname,
        source: "direct",
        description: `Uploaded file: ${msg.file.originalname}`,
        text: "",
        contentType: msg.file.mimetype
      });
    }
    const content = {
      text,
      attachments,
      source: "node-mobile",
      inReplyTo: void 0
    };
    const userMessage = {
      content,
      userId,
      roomId,
      agentId: runtime.agentId
    };
    const memory = {
      id: stringToUuid(messageId + "-" + userId),
      ...userMessage,
      agentId: runtime.agentId,
      userId,
      roomId,
      content,
      createdAt: Date.now()
    };
    await runtime.messageManager.addEmbeddingToMemory(memory);
    await runtime.messageManager.createMemory(memory);
    let state = await runtime.composeState(userMessage, {
      agentName: runtime.character.name
    });
    const context = composeContext({
      state,
      template: messageHandlerTemplate
    });
    const response = await generateMessageResponse({
      runtime,
      context,
      modelClass: ModelClass.EMBEDDING
    });
    if (!response) {
      this.sendMessage("nodeMobileError", {
        message: "No response from generateMessageResponse"
      });
      return;
    }
    const responseMessage = {
      id: stringToUuid(messageId + "-" + runtime.agentId),
      ...userMessage,
      userId: runtime.agentId,
      content: response,
      embedding: await getEmbeddingZeroVector(),
      createdAt: Date.now()
    };
    await runtime.messageManager.createMemory(responseMessage);
    state = await runtime.updateRecentMessageState(state);
    let message = null;
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
    const action = runtime.actions.find((a) => a.name === response.action);
    const shouldSuppressInitialMessage = action?.suppressInitialMessage;
    if (!shouldSuppressInitialMessage) {
      if (message) {
        this.sendMessage("nodeMobileClientMessageResp", [
          response,
          message
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
  registerAgent(runtime) {
    this.runtime = runtime;
  }
  unregisterAgent(runtime) {
    this.runtime = void 0;
  }
};
export {
  NodeMobileClient,
  messageHandlerTemplate
};
//# sourceMappingURL=index.js.map