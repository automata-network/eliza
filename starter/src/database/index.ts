import { SqliteDatabaseAdapter } from "@elizaos/adapter-sqlite-node-mobile";
import { elizaLogger } from "@elizaos/core";

export function initializeDatabase(modelHash: string) {
    const filePath = process.env.SQLITE_FILE ?? `db-${modelHash}.sqlite`;
    elizaLogger.info("initializeDatabase filePath", filePath);
    // ":memory:";
    const db = new SqliteDatabaseAdapter(filePath);
    return db;
}
