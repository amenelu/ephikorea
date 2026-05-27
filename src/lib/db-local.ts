import "server-only";

import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

import type { AppDatabase, SqlRunResult, SqlStatement } from "@/lib/db";

const DEFAULT_SQLITE_PATH = "data/ephikorea.sqlite";

declare global {
  // eslint-disable-next-line no-var
  var sqliteDatabase: Database.Database | undefined;
  // eslint-disable-next-line no-var
  var appDatabase: AppDatabase | undefined;
}

function resolveDatabasePath() {
  return path.resolve(process.cwd(), process.env.SQLITE_PATH || DEFAULT_SQLITE_PATH);
}

function readSchema() {
  return fs.readFileSync(path.join(process.cwd(), "data", "schema.sql"), "utf8");
}

function toArgs(params?: Record<string, unknown> | unknown[]) {
  if (!params) {
    return [];
  }

  return Array.isArray(params) ? params : [params];
}

function createLocalStatement(db: Database.Database, sql: string): SqlStatement {
  const statement = db.prepare(sql);

  return {
    async get<T = unknown>(params?: Record<string, unknown> | unknown[]) {
      return statement.get(...toArgs(params)) as T | undefined;
    },
    async all<T = unknown>(params?: Record<string, unknown> | unknown[]) {
      return statement.all(...toArgs(params)) as T[];
    },
    async run(params?: Record<string, unknown> | unknown[]) {
      const result = statement.run(...toArgs(params));
      return { changes: result.changes } satisfies SqlRunResult;
    },
  };
}

function createLocalDatabase(db: Database.Database): AppDatabase {
  const appDb: AppDatabase = {
    prepare(sql: string) {
      return createLocalStatement(db, sql);
    },
    async exec(sql: string) {
      db.exec(sql);
    },
    async transaction<T>(callback: (database: AppDatabase) => Promise<T>) {
      db.exec("begin immediate");

      try {
        const result = await callback(appDb);
        db.exec("commit");
        return result;
      } catch (error) {
        db.exec("rollback");
        throw error;
      }
    },
  };

  return appDb;
}

export function getLocalDb() {
  if (!globalThis.sqliteDatabase) {
    const databasePath = resolveDatabasePath();
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });

    const db = new Database(databasePath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    db.exec(readSchema());

    globalThis.sqliteDatabase = db;
    globalThis.appDatabase = createLocalDatabase(db);
  }

  return globalThis.appDatabase!;
}
