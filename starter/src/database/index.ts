import { SqliteDatabaseAdapter } from "@elizaos/adapter-sqlite-node-mobile";
import { elizaLogger } from "@elizaos/core";
import path from "path";

export function initializeDatabase(dataDir: string, modelHash: string) {
  const filePath =
    process.env.SQLITE_FILE ?? path.resolve(dataDir, `db-${modelHash}.sqlite`);
  elizaLogger.info("initializeDatabase filePath", filePath);
  // ":memory:";
  const db = new SqliteDatabaseAdapter(filePath);
  return db;
}
