// src/index.ts
var SqliteDatabaseAdapter = class {
  dbPath;
  constructor(dbPath) {
    this.dbPath = dbPath;
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
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "getRoom",
        params: [roomId]
      });
    });
  }
  async getParticipantsForAccount(userId) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "getParticipantsForAccount",
        params: [userId]
      });
    });
  }
  async getParticipantsForRoom(roomId) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "getParticipantsForRoom",
        params: [roomId]
      });
    });
  }
  async getParticipantUserState(roomId, userId) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "getParticipantUserState",
        params: [roomId, userId]
      });
    });
  }
  async setParticipantUserState(roomId, userId, state) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "setParticipantUserState",
        params: [roomId, userId, state]
      });
    });
  }
  async init() {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "init",
        params: [this.dbPath]
      });
    });
  }
  async close() {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "close",
        params: []
      });
    });
  }
  async getAccountById(userId) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "getAccountById",
        params: [userId]
      });
    });
  }
  async createAccount(account) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "createAccount",
        params: [account]
      });
    });
  }
  async getActorDetails(params) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "getActorDetails",
        params: [params]
      });
    });
  }
  async getMemoriesByRoomIds(params) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "getMemoriesByRoomIds",
        params: [params]
      });
    });
  }
  async getMemoryById(memoryId) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "getMemoryById",
        params: [memoryId]
      });
    });
  }
  async getMemoriesByIds(memoryIds, tableName) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "getMemoriesByIds",
        params: [memoryIds, tableName]
      });
    });
  }
  async createMemory(memory, tableName) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "createMemory",
        params: [memory, tableName]
      });
    });
  }
  async searchMemories(params) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "searchMemories",
        params: [params]
      });
    });
  }
  async searchMemoriesByEmbedding(embedding, params) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "searchMemoriesByEmbedding",
        params: [embedding, params]
      });
    });
  }
  async getCachedEmbeddings(opts) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "getCachedEmbeddings",
        params: [opts]
      });
    });
  }
  async updateGoalStatus(params) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "updateGoalStatus",
        params: [params]
      });
    });
  }
  async log(params) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "log",
        params: [params]
      });
    });
  }
  async getMemories(params) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "getMemories",
        params: [params]
      });
    });
  }
  async removeMemory(memoryId, tableName) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "removeMemory",
        params: [memoryId, tableName]
      });
    });
  }
  async removeAllMemories(roomId, tableName) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "removeAllMemories",
        params: [roomId, tableName]
      });
    });
  }
  async countMemories(roomId, unique = true, tableName = "") {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "countMemories",
        params: [roomId, unique, tableName]
      });
    });
  }
  async getGoals(params) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "getGoals",
        params: [params]
      });
    });
  }
  async updateGoal(goal) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "updateGoal",
        params: [goal]
      });
    });
  }
  async removeGoal(goalId) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "removeGoal",
        params: [goalId]
      });
    });
  }
  async removeAllGoals(roomId) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "removeAllGoals",
        params: [roomId]
      });
    });
  }
  async createRoom(roomId) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "createRoom",
        params: [roomId]
      });
    });
  }
  async removeRoom(roomId) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "removeRoom",
        params: [roomId]
      });
    });
  }
  async getRoomsForParticipant(userId) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "getRoomsForParticipant",
        params: [userId]
      });
    });
  }
  async getRoomsForParticipants(userIds) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "getRoomsForParticipants",
        params: [userIds]
      });
    });
  }
  async addParticipant(userId, roomId) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "addParticipant",
        params: [userId, roomId]
      });
    });
  }
  async removeParticipant(userId, roomId) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "removeParticipant",
        params: [userId, roomId]
      });
    });
  }
  async createRelationship(params) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "createRelationship",
        params: [params]
      });
    });
  }
  async getRelationship(params) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "getRelationship",
        params: [params]
      });
    });
  }
  async getRelationships(params) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "getRelationships",
        params: [params]
      });
    });
  }
  async getCache(params) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "getCache",
        params: [params]
      });
    });
  }
  async setCache(params) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "setCache",
        params: [params]
      });
    });
  }
  async deleteCache(params) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "deleteCache",
        params: [params]
      });
    });
  }
  async getKnowledge(params) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "getKnowledge",
        params: [params]
      });
    });
  }
  async searchKnowledge(params) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "searchKnowledge",
        params: [params]
      });
    });
  }
  async createKnowledge(knowledge) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "createKnowledge",
        params: [knowledge]
      });
    });
  }
  async removeKnowledge(id) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
        func: "removeKnowledge",
        params: [id]
      });
    });
  }
  async clearKnowledge(agentId, shared) {
    return new Promise((resolve, reject) => {
      this.once("nodeMobileSQLLiteResp", (data) => {
        resolve(data.result);
      });
      this.once("nodeMobileSQLLiteRespError", (data) => {
        reject(new Error(data.message));
      });
      this.sendMessage("nodeMobileSQLLite", {
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