import { Plugin } from "@elizaos/core";
import NodeMobileModelService from "./service";

export function createNodeMobilePlugin() {
    return {
        name: "node_mobile",
        description: "plugin for node mobile runtime",
        services: [new NodeMobileModelService()],
        actions: [],
    } as const satisfies Plugin;
}
