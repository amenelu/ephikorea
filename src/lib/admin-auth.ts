import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { getCloudflareEnv } from "@/lib/cloudflare";

const ADMIN_SESSION_COOKIE = "admin_session";
const ADMIN_SESSION_DURATION_MS = 1000 * 60 * 60 * 12;

type AdminSessionPayload = {
  email: string;
  expiresAt: number;
};

type AdminAuthConfig = {
  email: string;
  password: string;
  sessionSecret: string;
};

async function getAdminAuthConfig(): Promise<AdminAuthConfig> {
  const env = await getCloudflareEnv();

  return {
    email: String(env?.ADMIN_EMAIL || process.env.ADMIN_EMAIL || "")
      .trim()
      .toLowerCase(),
    password: String(env?.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || ""),
    sessionSecret: String(
      env?.ADMIN_SESSION_SECRET ||
        env?.COOKIE_SECRET ||
        process.env.ADMIN_SESSION_SECRET ||
        process.env.COOKIE_SECRET ||
        "",
    ),
  };
}

function isPrivateNetworkHost(host: string) {
  const normalizedHost = host.trim().toLowerCase();

  if (
    normalizedHost.startsWith("localhost") ||
    normalizedHost.startsWith("127.") ||
    normalizedHost.startsWith("192.168.") ||
    normalizedHost.startsWith("10.")
  ) {
    return true;
  }

  const match = normalizedHost.match(/^172\.(\d{1,3})\./);
  if (!match) {
    return false;
  }

  const secondOctet = Number.parseInt(match[1], 10);
  return secondOctet >= 16 && secondOctet <= 31;
}

async function shouldUseSecureAdminCookie() {
  const secureOverride = process.env.ADMIN_SESSION_SECURE?.trim().toLowerCase();

  if (secureOverride === "true") {
    return true;
  }

  if (secureOverride === "false") {
    return false;
  }

  const headerStore = await headers();
  const forwardedProto = headerStore.get("x-forwarded-proto")?.toLowerCase();

  if (forwardedProto) {
    return forwardedProto === "https";
  }

  const host = headerStore.get("host") || "";

  if (isPrivateNetworkHost(host)) {
    return false;
  }

  return process.env.NODE_ENV === "production";
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signValue(value: string, secret: string) {
  if (!secret) {
    throw new Error(
      "Admin auth is not configured. Set ADMIN_SESSION_SECRET or COOKIE_SECRET.",
    );
  }

  return createHmac("sha256", secret).update(value).digest("base64url");
}

function createSessionToken(payload: AdminSessionPayload, secret: string) {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = signValue(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

function parseSessionToken(token: string, secret: string) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signValue(encodedPayload, secret);
  const providedSignature = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    providedSignature.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(providedSignature, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      decodeBase64Url(encodedPayload),
    ) as AdminSessionPayload;

    if (!payload.email || !payload.expiresAt || payload.expiresAt < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function isAdminAuthConfigured(config?: AdminAuthConfig) {
  const resolvedConfig = config || (await getAdminAuthConfig());
  return Boolean(
    resolvedConfig.email &&
      resolvedConfig.password &&
      resolvedConfig.sessionSecret,
  );
}

export async function createAdminSession(email: string) {
  const config = await getAdminAuthConfig();
  const cookieStore = await cookies();
  const secure = await shouldUseSecureAdminCookie();
  const token = createSessionToken({
    email,
    expiresAt: Date.now() + ADMIN_SESSION_DURATION_MS,
  }, config.sessionSecret);

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: Math.floor(ADMIN_SESSION_DURATION_MS / 1000),
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function isAdminAuthenticated() {
  const config = await getAdminAuthConfig();
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token || !(await isAdminAuthConfigured(config))) {
    return false;
  }

  const payload = parseSessionToken(token, config.sessionSecret);
  return payload?.email === config.email;
}

export async function requireAdminPageAccess(locale: string) {
  if (await isAdminAuthenticated()) {
    return;
  }

  redirect(`/${locale}/admin/login`);
}

export async function requireAdminActionAccess(locale: string) {
  if (await isAdminAuthenticated()) {
    return;
  }

  redirect(`/${locale}/admin/login`);
}

export async function assertAdminAuthenticated() {
  if (await isAdminAuthenticated()) {
    return;
  }

  throw new Error("Unauthorized admin access.");
}

export async function validateAdminCredentials(email: string, password: string) {
  const config = await getAdminAuthConfig();

  if (!(await isAdminAuthConfigured(config))) {
    throw new Error(
      "Admin auth is not configured. Add ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET to the hosting environment.",
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail !== config.email || password !== config.password) {
    return false;
  }

  await createAdminSession(normalizedEmail);
  return true;
}
