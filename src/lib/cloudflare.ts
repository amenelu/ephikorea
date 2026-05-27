import "server-only";

export type R2ObjectBody = {
  body: ReadableStream;
  httpMetadata?: {
    contentType?: string;
  };
};

export type R2Bucket = {
  put(
    key: string,
    value: ArrayBuffer | Uint8Array | ReadableStream,
    options?: { httpMetadata?: { contentType?: string } },
  ): Promise<unknown>;
  get(key: string): Promise<R2ObjectBody | null>;
};

export type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results?: T[] }>;
  run(): Promise<{ meta?: { changes?: number } }>;
};

export type D1Database = {
  prepare(sql: string): D1PreparedStatement;
  exec(sql: string): Promise<void>;
};

export type CloudflareEnv = {
  DB?: D1Database;
  PRODUCT_MEDIA?: R2Bucket;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
  COOKIE_SECRET?: string;
  NEXT_PUBLIC_SITE_URL?: string;
};

export async function getCloudflareEnv(): Promise<CloudflareEnv | null> {
  try {
    const cloudflare = await import("@opennextjs/cloudflare");
    const context = await cloudflare.getCloudflareContext({ async: true });

    return context.env as CloudflareEnv;
  } catch {
    return null;
  }
}
