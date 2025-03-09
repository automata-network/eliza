// src/index.ts
import { v4 as uuidv4 } from "uuid";
var SqliteDatabaseAdapter = class {
  dbPath;
  promises;
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.on("nodeMobileSQLLiteResp", (data) => {
      const { uuid, result } = data;
      if (this.promises[uuid]) {
        this.promises[uuid].resolve(result);
        delete this.promises[uuid];
      }
    });
    this.on("nodeMobileSQLLiteRespError", (data) => {
      const { uuid, message } = data;
      if (this.promises[uuid]) {
        this.promises[uuid].reject(new Error(message));
        delete this.promises[uuid];
      }
    });
    this.promises = {};
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
  async getRoom(roomId) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "getRoom",
        params: [roomId]
      });
    });
  }
  async getParticipantsForAccount(userId) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "getParticipantsForAccount",
        params: [userId]
      });
    });
  }
  async getParticipantsForRoom(roomId) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "getParticipantsForRoom",
        params: [roomId]
      });
    });
  }
  async getParticipantUserState(roomId, userId) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "getParticipantUserState",
        params: [roomId, userId]
      });
    });
  }
  async setParticipantUserState(roomId, userId, state) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "setParticipantUserState",
        params: [roomId, userId, state]
      });
    });
  }
  async init() {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "init",
        params: [this.dbPath]
      });
    });
  }
  async close() {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "close",
        params: []
      });
    });
  }
  async getAccountById(userId) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "getAccountById",
        params: [userId]
      });
    });
  }
  async createAccount(account) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "createAccount",
        params: [account]
      });
    });
  }
  async getActorDetails(params) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "getActorDetails",
        params: [params]
      });
    });
  }
  async getMemoriesByRoomIds(params) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "getMemoriesByRoomIds",
        params: [params]
      });
    });
  }
  async getMemoryById(memoryId) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "getMemoryById",
        params: [memoryId]
      });
    });
  }
  async getMemoriesByIds(memoryIds, tableName) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "getMemoriesByIds",
        params: [memoryIds, tableName]
      });
    });
  }
  async createMemory(memory, tableName) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "createMemory",
        params: [memory, tableName]
      });
    });
  }
  async searchMemories(params) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "searchMemories",
        params: [params]
      });
    });
  }
  async searchMemoriesByEmbedding(embedding, params) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "searchMemoriesByEmbedding",
        params: [embedding, params]
      });
    });
  }
  async getCachedEmbeddings(opts) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "getCachedEmbeddings",
        params: [opts]
      });
    });
  }
  async updateGoalStatus(params) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "updateGoalStatus",
        params: [params]
      });
    });
  }
  async log(params) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "log",
        params: [params]
      });
    });
  }
  async getMemories(params) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "getMemories",
        params: [params]
      });
    });
  }
  async removeMemory(memoryId, tableName) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "removeMemory",
        params: [memoryId, tableName]
      });
    });
  }
  async removeAllMemories(roomId, tableName) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "removeAllMemories",
        params: [roomId, tableName]
      });
    });
  }
  async countMemories(roomId, unique = true, tableName = "") {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "countMemories",
        params: [roomId, unique, tableName]
      });
    });
  }
  async getGoals(params) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "getGoals",
        params: [params]
      });
    });
  }
  async updateGoal(goal) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "updateGoal",
        params: [goal]
      });
    });
  }
  async removeGoal(goalId) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "removeGoal",
        params: [goalId]
      });
    });
  }
  async removeAllGoals(roomId) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "removeAllGoals",
        params: [roomId]
      });
    });
  }
  async createRoom(roomId) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "createRoom",
        params: [roomId]
      });
    });
  }
  async removeRoom(roomId) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "removeRoom",
        params: [roomId]
      });
    });
  }
  async getRoomsForParticipant(userId) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "getRoomsForParticipant",
        params: [userId]
      });
    });
  }
  async getRoomsForParticipants(userIds) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "getRoomsForParticipants",
        params: [userIds]
      });
    });
  }
  async addParticipant(userId, roomId) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "addParticipant",
        params: [userId, roomId]
      });
    });
  }
  async removeParticipant(userId, roomId) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "removeParticipant",
        params: [userId, roomId]
      });
    });
  }
  async createRelationship(params) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "createRelationship",
        params: [params]
      });
    });
  }
  async getRelationship(params) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "getRelationship",
        params: [params]
      });
    });
  }
  async getRelationships(params) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "getRelationships",
        params: [params]
      });
    });
  }
  async getCache(params) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "getCache",
        params: [params]
      });
    });
  }
  async setCache(params) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "setCache",
        params: [params]
      });
    });
  }
  async deleteCache(params) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "deleteCache",
        params: [params]
      });
    });
  }
  async getKnowledge(params) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "getKnowledge",
        params: [params]
      });
    });
  }
  async searchKnowledge(params) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "searchKnowledge",
        params: [params]
      });
    });
  }
  async createKnowledge(knowledge) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "createKnowledge",
        params: [knowledge]
      });
    });
  }
  async removeKnowledge(id) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "removeKnowledge",
        params: [id]
      });
    });
  }
  async clearKnowledge(agentId, shared) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      this.promises[uuid] = { resolve, reject };
      this.sendMessage("nodeMobileSQLLite", {
        uuid,
        func: "clearKnowledge",
        params: [agentId, shared]
      });
    });
  }
};
export {
  SqliteDatabaseAdapter
};
//# sourceMappingURL=index.js.map