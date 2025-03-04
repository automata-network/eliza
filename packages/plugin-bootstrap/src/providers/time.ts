import type { IAgentRuntime, Memory, Provider, State } from "@elizaos/core";
import dayjs from "dayjs";

const timeProvider: Provider = {
    get: async (_runtime: IAgentRuntime, _message: Memory, _state?: State) => {
        const humanReadable = dayjs().format("YYYY-MM-DD hh:mm:ss");
        return `The current date and time is ${humanReadable}. Please use this as your reference for any time-based operations or responses.`;
    },
};
export { timeProvider };
