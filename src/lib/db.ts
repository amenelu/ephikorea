import "server-only";

import { getCloudflareEnv, type D1Database } from "@/lib/cloudflare";

type SqlParams = Record<string, unknown> | unknown[];

export type SqlRunResult = {
  changes: number;
};

export type SqlStatement = {
  get<T = unknown>(params?: SqlParams): Promise<T | undefined>;
  all<T = unknown>(params?: SqlParams): Promise<T[]>;
  run(params?: SqlParams): Promise<SqlRunResult>;
};

export type AppDatabase = {
  prepare(sql: string): SqlStatement;
  exec(sql: string): Promise<void>;
  transaction<T>(callback: (db: AppDatabase) => Promise<T>): Promise<T>;
};

const NAMED_PARAM_PATTERN = /[@:$]([A-Za-z_][A-Za-z0-9_]*)/g;

function normalizeParams(params?: SqlParams) {
  if (!params) {
    return [];
  }

  return Array.isArray(params) ? params : params;
}

function prepareD1Sql(sql: string, params?: SqlParams) {
  const normalizedParams = normalizeParams(params);

  if (Array.isArray(normalizedParams)) {
    return { sql, values: normalizedParams };
  }

  const values: unknown[] = [];
  const normalizedSql = sql.replace(NAMED_PARAM_PATTERN, (_match, name: string) => {
    values.push(normalizedParams[name]);
    return "?";
  });

  return { sql: normalizedSql, values };
}

function createD1Database(d1: D1Database): AppDatabase {
  const database: AppDatabase = {
    prepare(sql: string) {
      return {
        async get<T = unknown>(params?: SqlParams) {
          const prepared = prepareD1Sql(sql, params);
          return (await d1.prepare(prepared.sql).bind(...prepared.values).first<T>()) ?? undefined;
        },
        async all<T = unknown>(params?: SqlParams) {
          const prepared = prepareD1Sql(sql, params);
          const result = await d1.prepare(prepared.sql).bind(...prepared.values).all<T>();
          return result.results ?? [];
        },
        async run(params?: SqlParams) {
          const prepared = prepareD1Sql(sql, params);
          const result = await d1.prepare(prepared.sql).bind(...prepared.values).run();
          return { changes: result.meta?.changes ?? 0 };
        },
      };
    },
    async exec(sql: string) {
      await d1.exec(sql);
    },
    async transaction<T>(callback: (db: AppDatabase) => Promise<T>) {
      return callback(database);
    },
  };

  return database;
}

export async function getDb() {
  const env = await getCloudflareEnv();

  if (env?.DB) {
    return createD1Database(env.DB);
  }

  const local = await import("@/lib/db-local");
  return local.getLocalDb();
}

export function parseJsonObject(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function stringifyJson(value: unknown) {
  return JSON.stringify(value ?? null);
}
