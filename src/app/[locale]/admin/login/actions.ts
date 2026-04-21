"use server";

import { redirect } from "next/navigation";

import {
  clearAdminSession,
  requireAdminActionAccess,
  validateAdminCredentials,
} from "@/lib/admin-auth";

function buildLoginRedirect(locale: string, message: string) {
  const params = new URLSearchParams({ error: message });
  return `/${locale}/admin/login?${params.toString()}`;
}

export async function loginAdminAction(formData: FormData) {
  const locale = String(formData.get("locale") || "en");
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  try {
    const authenticated = await validateAdminCredentials(email, password);

    if (!authenticated) {
      redirect(buildLoginRedirect(locale, "Invalid admin email or password."));
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to sign in.";
    redirect(buildLoginRedirect(locale, message));
  }

  redirect(`/${locale}/admin`);
}

export async function logoutAdminAction(formData: FormData) {
  const locale = String(formData.get("locale") || "en");

  await requireAdminActionAccess(locale);
  await clearAdminSession();

  redirect(`/${locale}/admin/login`);
}
