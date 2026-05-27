declare module "@opennextjs/cloudflare" {
  export type OpenNextConfig = unknown;

  export function defineCloudflareConfig(config?: unknown): OpenNextConfig;

  export function getCloudflareContext(options?: {
    async?: boolean;
  }): Promise<{ env: unknown }>;
}
