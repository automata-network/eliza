import type { Action } from "@elizaos/core";
import { verifyAndAttestOnChain } from "../dcap.js";
import { getQuote } from "../quote.js";
import { DCAPMode } from "../types.js";
import {
    getDCAPMode,
    getTEEMode,
    hasPrivateKey,
    hasTEEMode,
} from "../utils.js";

export const dcapOnChainVerifyAction: Action = {
    name: "DCAP_ON_CHAIN",
    description:
        "If the user wants to perform DCAP attestation, then call this action. The user can also directly use the keyword DCAP_ON_CHAIN to call this action.",
    similes: [
        "DCAP",
        "DCAP_ATTESTATION",
        "DCAP_TEE",
        "DCAP_SGX",
        "ATTESTATION",
        "GENERATE_ATTESTATION",
    ],
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Generate an attestation and verify it on-chain",
                    action: "DCAP_ON_CHAIN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Of course, one second...",
                    action: "DCAP_ON_CHAIN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "DCAP_ON_CHAIN" },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "secret code activate....",
                    action: "DCAP_ON_CHAIN",
                },
            },
        ],
    ],
    async validate(runtime, message) {
        if (!hasPrivateKey(runtime)) return false;
        const mode = getDCAPMode(runtime);
        if (!mode) return false;
        if (mode === DCAPMode.TDX) return hasTEEMode(runtime);
        // try {
        // const { text } = message.content;
        // return is0xString(message.content.text);
        // } catch {
        //     return false;
        // }
        return true;
    },
    async handler(runtime, message, state, options, callback) {
        const { agentId } = runtime;
        const { userId, roomId, content } = message;
        const quote = await getQuote(
            // Attestation will be generated based on the message info
            JSON.stringify({
                agentId,
                timestamp: Date.now(),
                message: { userId, roomId, content: content.text },
            }),
            getDCAPMode(runtime),
            getTEEMode(runtime)
        );

        const reply = (text: string) =>
            callback({
                text,
                // source: quote,
                action: "DCAP_ON_CHAIN",
            });
        try {
            const tx = await verifyAndAttestOnChain(
                runtime.getSetting("EVM_PRIVATE_KEY")!,
                quote
            );
            reply("Verified! Transaction hash: " + tx.hash);
            return true;
        } catch (e) {
            reply(e instanceof Error ? e.message : "Attestation failed");
            return false;
        }
    },
    suppressInitialMessage: true,
};
