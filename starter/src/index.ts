// import './utils/log.ts';
import "dotenv/config";

import "./utils/fetch.ts";

import { NodeMobileClient } from "@elizaos/client-node-mobile";
import { createNodeMobilePlugin } from "@elizaos/plugin-node-mobile";
import {
  AgentRuntime,
  elizaLogger,
  stringToUuid,
  type Character,
} from "@elizaos/core";
import { bootstrapPlugin } from "@elizaos/plugin-bootstrap";
// import { createNodePlugin } from "@elizaos/plugin-node";
// import { solanaPlugin } from "@elizaos/plugin-solana";
import { initializeDbCache } from "./cache/index.ts";
import { character } from "./character.ts";
import { initializeClients } from "./clients/index.ts";
import { getTokenForProvider } from "./config/index.ts";
import { initializeDatabase } from "./database/index.ts";
import path from "path";
import { existsSync, mkdirSync } from "fs";
import rn_bridge from "rn-bridge";
import { verifiableTwitterPlugin } from "@elizaos/plugin-verifiable-twitter";

let agent: AgentRuntime;
let client: NodeMobileClient;
let nodeMobileModelService: ReturnType<
  typeof createNodeMobilePlugin
>["services"][0];

interface TwitterParameters {
  twitterConsumerKey?: string;
  twitterConsumerSecret?: string;
  twitterAccessToken?: string;
  twitterAccessTokenSecret?: string;
}

interface MessageType {
  nodeMobileError: { message: string };
  nodeMobileAgentStart: undefined;
  nodeMobileAgentStarted: undefined;
  nodeMobileAgentStop: undefined;
  nodeMobileAgentStoped: undefined;
  nodeMobilePluginConfig: undefined;
}

interface MessageListenerType {
  nodeMobileModelChanged: (data: { modelHash: string }) => void;
  nodeMobilePluginConfigResp: (
    data:
      | { [plugin: string]: { [config: string]: string | undefined } }
      | undefined
  ) => void;
  nodeMobileStopAgent: () => void;
}

function sendMessage<T extends keyof MessageType>(
  type: T,
  data: MessageType[T]
) {
  rn_bridge.channel.post(type, data);
}

function on<T extends keyof MessageListenerType>(
  type: T,
  listener: MessageListenerType[T]
) {
  rn_bridge.channel.on(type, listener);
}

function off<T extends keyof MessageListenerType>(
  type: T,
  listener: MessageListenerType[T]
) {
  rn_bridge.channel.off(type, listener);
}

function once<T extends keyof MessageListenerType>(
  type: T,
  listener: MessageListenerType[T]
) {
  rn_bridge.channel.once(type, listener);
}

function createAgent(character: Character, db: any, cache: any, token: string) {
  elizaLogger.error("Creating runtime for character", character.name);

  const nodeMobilePlugin = createNodeMobilePlugin();

  nodeMobileModelService = nodeMobilePlugin.services[0];

  return new AgentRuntime({
    databaseAdapter: db,
    token,
    modelProvider: character.modelProvider,
    evaluators: [],
    character,
    plugins: [
      bootstrapPlugin,
      nodeMobilePlugin,
      verifiableTwitterPlugin,
      // nodePlugin,
      // character.settings?.secrets?.WALLET_PUBLIC_KEY ? solanaPlugin : null,
    ].filter(Boolean),
    providers: [],
    actions: [],
    services: [],
    managers: [],
    cacheManager: cache,
  });
}

async function startAgent(
  character: Character,
  client: NodeMobileClient,
  modelHash: string
) {
  try {
    elizaLogger.info("pluginConfig start");
    const pluginConfig = await new Promise<
      { [plugin: string]: { [config: string]: string | undefined } } | undefined
    >((resolve, reject) => {
      once("nodeMobilePluginConfigResp", (data) => {
        resolve(data);
      });

      sendMessage("nodeMobilePluginConfig", undefined);
    });
    elizaLogger.info("pluginConfig end", pluginConfig);
    const twitterPluginConfigs: TwitterParameters =
      pluginConfig["@elizaos/plugin-verifiable-twitter"];

    elizaLogger.info("twitterPluginConfigs", twitterPluginConfigs);

    character.id ??= stringToUuid(character.name);
    character.username ??= character.name;
    character.settings.secrets = {
      TWITTER_CONSUMER_KEY: twitterPluginConfigs.twitterConsumerKey,
      TWITTER_CONSUMER_SECRET: twitterPluginConfigs.twitterConsumerSecret,
      TWITTER_ACCESS_TOKEN: twitterPluginConfigs.twitterAccessToken,
      TWITTER_ACCESS_TOKEN_SECRET:
        twitterPluginConfigs.twitterAccessTokenSecret,
    };
    const token = getTokenForProvider(character.modelProvider, character);
    const dataDir = path.resolve(process.env.cwd, "data");
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
    const db = initializeDatabase(dataDir, modelHash);
    await db.init();
    const cache = initializeDbCache(character, db);
    const runtime = createAgent(character, db, cache, token);
    await runtime.initialize();
    runtime.clients = await initializeClients(character, runtime);

    client.start();
    client.registerAgent(runtime);
    // report to console
    console.debug(`Started ${character.name} as ${runtime.agentId}`);
    return runtime;
  } catch (error) {
    elizaLogger.error(`Error starting agent for character:`, error);
    elizaLogger.error(error);
    throw error;
  }
}

const startAgents = async (modelHash: string) => {
  sendMessage("nodeMobileAgentStart", undefined);

  elizaLogger.debug("starting agents");

  client = new NodeMobileClient();

  try {
    agent = await startAgent(character, client, modelHash);

    elizaLogger.debug("agent started");

    sendMessage("nodeMobileAgentStarted", undefined);
  } catch (error) {
    sendMessage("nodeMobileError", { message: error.message });
    elizaLogger.error("Error starting agents:", error);
  }
};

const stopAgents = async () => {
  if (agent) {
    elizaLogger.debug("Stoping agents");

    sendMessage("nodeMobileAgentStop", undefined);

    try {
      if (client) {
        client.stop();

        client.unregisterAgent(agent);

        client = undefined;
      }

      if (nodeMobileModelService) {
        nodeMobileModelService.stop();

        nodeMobileModelService = undefined;
      }

      await agent.stop();

      agent = undefined;

      elizaLogger.debug("Agents stoped");

      sendMessage("nodeMobileAgentStoped", undefined);
    } catch (error) {
      sendMessage("nodeMobileError", { message: error.message });
      elizaLogger.error(`Error stoping agents: ${(error as Error).message}`);
    }
  }
};

async function handleModelChanged({ modelHash }: { modelHash: string }) {
  elizaLogger.info("handle model changed");
  await stopAgents();
  await startAgents(modelHash);
}

async function handleStopAgent() {
  elizaLogger.info("handle stop agent");
  await stopAgents();
}

export function startEliza() {
  on("nodeMobileModelChanged", handleModelChanged);
  on("nodeMobileStopAgent", handleStopAgent);
}
