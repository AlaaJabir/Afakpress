import { cookies } from "next/headers";
import { createServerSupabaseClient, createServiceSupabaseAdminClient } from "@/lib/supabase";
import type { AdminRole } from "@/lib/admin-roles";

export const ADMIN_ACCESS_COOKIE = "afakpress-admin-access-token";
export const ADMIN_REFRESH_COOKIE = "afakpress-admin-refresh-token";

export type AdminSession = {
  id: string;
  userId: string;
  email: string;
  role: AdminRole;
  status: "active" | "disabled" | string;
};

export type AdminUserRecord = {
  id: string;
  user_id: string | null;
  email: string;
  role: AdminRole;
  status: string;
  created_at: string | null;
};

export type AdminAuthState =
  | { status: "unauthenticated" }
  | { status: "access_denied"; email: string }
  | { status: "authenticated"; session: AdminSession };

export async function getAdminSessionFromCookies(): Promise<AdminSession | null> {
  const state = await getAdminAuthStateFromCookies();
  return state.status === "authenticated" ? state.session : null;
}

export async function getAdminAuthStateFromCookies(): Promise<AdminAuthState> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value;
  if (!accessToken) return { status: "unauthenticated" };

  const authClient = createServerSupabaseClient();
  const adminClient = createServiceSupabaseAdminClient();
  if (!authClient || !adminClient) return { status: "unauthenticated" };

  const { data: userData, error: userError } = await authClient.auth.getUser(accessToken);
  const user = userData.user;
  if (userError || !user?.email) return { status: "unauthenticated" };

  const { data, error } = await adminClient
    .from("admin_users")
    .select("id,user_id,email,role,status,created_at")
    .eq("email", user.email.toLowerCase())
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) return { status: "access_denied", email: user.email };

  return {
    status: "authenticated",
    session: {
      id: data.id,
      userId: user.id,
      email: data.email,
      role: data.role,
      status: data.status,
    },
  };
}

export async function getAdminSessionFromRequest(request: Request): Promise<AdminSession | null> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookiesByName = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [name, ...valueParts] = entry.split("=");
        return [name, decodeURIComponent(valueParts.join("="))];
      }),
  );

  const accessToken = cookiesByName[ADMIN_ACCESS_COOKIE];
  if (!accessToken) return null;

  const authClient = createServerSupabaseClient();
  const adminClient = createServiceSupabaseAdminClient();
  if (!authClient || !adminClient) return null;

  const { data: userData, error: userError } = await authClient.auth.getUser(accessToken);
  const user = userData.user;
  if (userError || !user?.email) return null;

  const { data, error } = await adminClient
    .from("admin_users")
    .select("id,user_id,email,role,status,created_at")
    .eq("email", user.email.toLowerCase())
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    userId: user.id,
    email: data.email,
    role: data.role,
    status: data.status,
  };
}
