import { Plugin } from "@elizaos/core";
import { claimTokenAction } from "./actions/claimTokenAction";

export { ProofProvider } from "./providers/proofProvider";


export const poaPlugin: Plugin = {
    name: "poa",
    description:
        "proof of agent",
    actions: [
        claimTokenAction,
    ],
    evaluators: [
        /* custom evaluators */
    ],
    providers: [
        /* custom providers */
        // deriveKeyProvider,
    ],
    services: [
        /* custom services */
    ],
};
