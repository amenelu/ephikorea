declare module "@opennextjs/cloudflare" {
  export function getCloudflareContext(options?: {
    async?: boolean;
  }): Promise<{ env: unknown }>;
}
