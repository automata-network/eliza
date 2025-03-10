import type {
    IDatabaseCacheAdapter,
    Account,
    Actor,
    GoalStatus,
    Participant,
    Goal,
    Memory,
    Relationship,
    UUID,
    RAGKnowledgeItem,
} from "@elizaos/core";
import { v4 as uuidv4 } from "uuid";

interface MessageType {
    nodeMobileSQLite: {
        uuid: string;
        func: string;
        params: any[];
    };
}

interface MessageListenerType {
    nodeMobileSQLiteResp: (data: { uuid: string; result: any }) => void;
    nodeMobileSQLiteRespError: (data: {
        uuid: string;
        message: string;
    }) => void;
}

export class SqliteDatabaseAdapter implements IDatabaseCacheAdapter {
    private dbPath: string;
    private promises: {
        [uuid: string]: {
            resolve: (data: any) => void;
            reject: (err: Error) => void;
        };
    };

    constructor(dbPath: string) {
        this.dbPath = dbPath;
        this.on("nodeMobileSQLiteResp", (data) => {
            const { uuid, result } = data;
            if (this.promises[uuid]) {
                this.promises[uuid].resolve(result);
                delete this.promises[uuid];
            }
        });
        this.on("nodeMobileSQLiteRespError", (data) => {
            const { uuid, message } = data;
            if (this.promises[uuid]) {
                this.promises[uuid].reject(new Error(message));
                delete this.promises[uuid];
            }
        });
        this.promises = {};
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

    async getRoom(roomId: UUID): Promise<UUID | null> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "getRoom",
                params: [roomId],
            });
        });
    }

    async getParticipantsForAccount(userId: UUID): Promise<Participant[]> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "getParticipantsForAccount",
                params: [userId],
            });
        });
    }

    async getParticipantsForRoom(roomId: UUID): Promise<UUID[]> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "getParticipantsForRoom",
                params: [roomId],
            });
        });
    }

    async getParticipantUserState(
        roomId: UUID,
        userId: UUID
    ): Promise<"FOLLOWED" | "MUTED" | null> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "getParticipantUserState",
                params: [roomId, userId],
            });
        });
    }

    async setParticipantUserState(
        roomId: UUID,
        userId: UUID,
        state: "FOLLOWED" | "MUTED" | null
    ): Promise<void> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "setParticipantUserState",
                params: [roomId, userId, state],
            });
        });
    }

    async init() {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "init",
                params: [this.dbPath],
            });
        });
    }

    async close() {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "close",
                params: [],
            });
        });
    }

    async getAccountById(userId: UUID): Promise<Account | null> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "getAccountById",
                params: [userId],
            });
        });
    }

    async createAccount(account: Account): Promise<boolean> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "createAccount",
                params: [account],
            });
        });
    }

    async getActorDetails(params: { roomId: UUID }): Promise<Actor[]> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "getActorDetails",
                params: [params],
            });
        });
    }

    async getMemoriesByRoomIds(params: {
        agentId: UUID;
        roomIds: UUID[];
        tableName: string;
        limit?: number;
    }): Promise<Memory[]> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "getMemoriesByRoomIds",
                params: [params],
            });
        });
    }

    async getMemoryById(memoryId: UUID): Promise<Memory | null> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "getMemoryById",
                params: [memoryId],
            });
        });
    }

    async getMemoriesByIds(
        memoryIds: UUID[],
        tableName?: string
    ): Promise<Memory[]> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "getMemoriesByIds",
                params: [memoryIds, tableName],
            });
        });
    }

    async createMemory(memory: Memory, tableName: string): Promise<void> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "createMemory",
                params: [memory, tableName],
            });
        });
    }

    async searchMemories(params: {
        tableName: string;
        roomId: UUID;
        agentId?: UUID;
        embedding: number[];
        match_threshold: number;
        match_count: number;
        unique: boolean;
    }): Promise<Memory[]> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "searchMemories",
                params: [params],
            });
        });
    }

    async searchMemoriesByEmbedding(
        embedding: number[],
        params: {
            match_threshold?: number;
            count?: number;
            roomId?: UUID;
            agentId: UUID;
            unique?: boolean;
            tableName: string;
        }
    ): Promise<Memory[]> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "searchMemoriesByEmbedding",
                params: [embedding, params],
            });
        });
    }

    async getCachedEmbeddings(opts: {
        query_table_name: string;
        query_threshold: number;
        query_input: string;
        query_field_name: string;
        query_field_sub_name: string;
        query_match_count: number;
    }): Promise<{ embedding: number[]; levenshtein_score: number }[]> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "getCachedEmbeddings",
                params: [opts],
            });
        });
    }

    async updateGoalStatus(params: {
        goalId: UUID;
        status: GoalStatus;
    }): Promise<void> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "updateGoalStatus",
                params: [params],
            });
        });
    }

    async log(params: {
        body: { [key: string]: unknown };
        userId: UUID;
        roomId: UUID;
        type: string;
    }): Promise<void> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "log",
                params: [params],
            });
        });
    }

    async getMemories(params: {
        roomId: UUID;
        count?: number;
        unique?: boolean;
        tableName: string;
        agentId: UUID;
        start?: number;
        end?: number;
    }): Promise<Memory[]> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "getMemories",
                params: [params],
            });
        });
    }

    async removeMemory(memoryId: UUID, tableName: string): Promise<void> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "removeMemory",
                params: [memoryId, tableName],
            });
        });
    }

    async removeAllMemories(roomId: UUID, tableName: string): Promise<void> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "removeAllMemories",
                params: [roomId, tableName],
            });
        });
    }

    async countMemories(
        roomId: UUID,
        unique = true,
        tableName = ""
    ): Promise<number> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "countMemories",
                params: [roomId, unique, tableName],
            });
        });
    }

    async getGoals(params: {
        roomId: UUID;
        userId?: UUID | null;
        onlyInProgress?: boolean;
        count?: number;
    }): Promise<Goal[]> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "getGoals",
                params: [params],
            });
        });
    }

    async updateGoal(goal: Goal): Promise<void> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "updateGoal",
                params: [goal],
            });
        });
    }

    async removeGoal(goalId: UUID): Promise<void> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "removeGoal",
                params: [goalId],
            });
        });
    }

    async removeAllGoals(roomId: UUID): Promise<void> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "removeAllGoals",
                params: [roomId],
            });
        });
    }

    async createRoom(roomId?: UUID): Promise<UUID> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "createRoom",
                params: [roomId],
            });
        });
    }

    async removeRoom(roomId: UUID): Promise<void> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "removeRoom",
                params: [roomId],
            });
        });
    }

    async getRoomsForParticipant(userId: UUID): Promise<UUID[]> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "getRoomsForParticipant",
                params: [userId],
            });
        });
    }

    async getRoomsForParticipants(userIds: UUID[]): Promise<UUID[]> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "getRoomsForParticipants",
                params: [userIds],
            });
        });
    }

    async addParticipant(userId: UUID, roomId: UUID): Promise<boolean> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "addParticipant",
                params: [userId, roomId],
            });
        });
    }

    async removeParticipant(userId: UUID, roomId: UUID): Promise<boolean> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "removeParticipant",
                params: [userId, roomId],
            });
        });
    }

    async createRelationship(params: {
        userA: UUID;
        userB: UUID;
    }): Promise<boolean> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "createRelationship",
                params: [params],
            });
        });
    }

    async getRelationship(params: {
        userA: UUID;
        userB: UUID;
    }): Promise<Relationship | null> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "getRelationship",
                params: [params],
            });
        });
    }

    async getRelationships(params: { userId: UUID }): Promise<Relationship[]> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "getRelationships",
                params: [params],
            });
        });
    }

    async getCache(params: {
        key: string;
        agentId: UUID;
    }): Promise<string | undefined> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "getCache",
                params: [params],
            });
        });
    }

    async setCache(params: {
        key: string;
        agentId: UUID;
        value: string;
    }): Promise<boolean> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "setCache",
                params: [params],
            });
        });
    }

    async deleteCache(params: {
        key: string;
        agentId: UUID;
    }): Promise<boolean> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "deleteCache",
                params: [params],
            });
        });
    }

    async getKnowledge(params: {
        id?: UUID;
        agentId: UUID;
        limit?: number;
        query?: string;
    }): Promise<RAGKnowledgeItem[]> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "getKnowledge",
                params: [params],
            });
        });
    }

    async searchKnowledge(params: {
        agentId: UUID;
        embedding: Float32Array;
        match_threshold: number;
        match_count: number;
        searchText?: string;
    }): Promise<RAGKnowledgeItem[]> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "searchKnowledge",
                params: [params],
            });
        });
    }

    async createKnowledge(knowledge: RAGKnowledgeItem): Promise<void> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "createKnowledge",
                params: [knowledge],
            });
        });
    }

    async removeKnowledge(id: UUID): Promise<void> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "removeKnowledge",
                params: [id],
            });
        });
    }

    async clearKnowledge(agentId: UUID, shared?: boolean): Promise<void> {
        return new Promise<any>((resolve, reject) => {
            const uuid = uuidv4();
            this.promises[uuid] = { resolve, reject };

            this.sendMessage("nodeMobileSQLite", {
                uuid,
                func: "clearKnowledge",
                params: [agentId, shared],
            });
        });
    }
}
