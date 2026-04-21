import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_SESSION_COOKIE = "admin_session";
const ADMIN_SESSION_DURATION_MS = 1000 * 60 * 60 * 12;

type AdminSessionPayload = {
  email: string;
  expiresAt: number;
};

function getAdminEmail() {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() || "";
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.COOKIE_SECRET || "";
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signValue(value: string) {
  const secret = getAdminSessionSecret();

  if (!secret) {
    throw new Error(
      "Admin auth is not configured. Set ADMIN_SESSION_SECRET or COOKIE_SECRET.",
    );
  }

  return createHmac("sha256", secret).update(value).digest("base64url");
}

function createSessionToken(payload: AdminSessionPayload) {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = signValue(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function parseSessionToken(token: string) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signValue(encodedPayload);
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

export function isAdminAuthConfigured() {
  return Boolean(getAdminEmail() && getAdminPassword() && getAdminSessionSecret());
}

export async function createAdminSession(email: string) {
  const cookieStore = await cookies();
  const token = createSessionToken({
    email,
    expiresAt: Date.now() + ADMIN_SESSION_DURATION_MS,
  });

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(ADMIN_SESSION_DURATION_MS / 1000),
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token || !isAdminAuthConfigured()) {
    return false;
  }

  const payload = parseSessionToken(token);
  return payload?.email === getAdminEmail();
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
  if (!isAdminAuthConfigured()) {
    throw new Error(
      "Admin auth is not configured. Add ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET to .env.",
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail !== getAdminEmail() || password !== getAdminPassword()) {
    return false;
  }

  await createAdminSession(normalizedEmail);
  return true;
}
