import mysql from "mysql2/promise";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetriableMysqlBootError(err: unknown): boolean {
  const e = err as { code?: string; message?: string };
  const code = e?.code;
  if (code === "ECONNREFUSED" || code === "ETIMEDOUT" || code === "PROTOCOL_CONNECTION_LOST") return true;
  const msg = String(e?.message || "").toLowerCase();
  if (msg.includes("connection lost") || msg.includes("server closed")) return true;
  if (msg.includes("read etimedout")) return true;
  return false;
}

export type MysqlEnvConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

export function getMysqlConfigFromEnv(): MysqlEnvConfig {
  return {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "cinenoir",
    password: process.env.DB_PASSWORD || "cinenoir",
    database: process.env.DB_NAME || "cinenoir",
  };
}

/**
 * Ouvre une connexion MySQL en réessayant : utile après `docker compose up`
 * pendant que le serveur termine l’initialisation (souvent 15–60 s).
 */
export async function createMysqlConnectionWithRetry(
  dbConfig: MysqlEnvConfig,
  options?: { maxAttempts?: number; delayMs?: number; multipleStatements?: boolean }
): Promise<mysql.Connection> {
  const maxAttempts = options?.maxAttempts ?? 24;
  const delayMs = options?.delayMs ?? 2500;
  const base = {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    connectTimeout: 20_000,
    multipleStatements: options?.multipleStatements ?? false,
  };

  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await mysql.createConnection(base);
    } catch (err) {
      lastErr = err;
      if (!isRetriableMysqlBootError(err) || attempt === maxAttempts) {
        throw err;
      }
      // eslint-disable-next-line no-console
      console.log(
        `⏳ MySQL pas encore prêt (tentative ${attempt}/${maxAttempts}) — nouvel essai dans ${delayMs / 1000}s…`
      );
      await sleep(delayMs);
    }
  }
  throw lastErr;
}
