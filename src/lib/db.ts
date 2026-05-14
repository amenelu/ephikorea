import "server-only";

import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const DEFAULT_SQLITE_PATH = "data/ephikorea.sqlite";

declare global {
  // eslint-disable-next-line no-var
  var sqliteDatabase: Database.Database | undefined;
}

function resolveDatabasePath() {
  return path.resolve(process.cwd(), process.env.SQLITE_PATH || DEFAULT_SQLITE_PATH);
}

function readSchema() {
  return fs.readFileSync(path.join(process.cwd(), "data", "schema.sql"), "utf8");
}

export function getDb() {
  if (!globalThis.sqliteDatabase) {
    const databasePath = resolveDatabasePath();
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });

    const db = new Database(databasePath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    db.exec(readSchema());

    globalThis.sqliteDatabase = db;
  }

  return globalThis.sqliteDatabase;
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
