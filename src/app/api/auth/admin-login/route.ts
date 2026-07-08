import { ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE } from "@/lib/admin-auth";
import { createServerSupabaseClient, createServiceSupabaseAdminClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

function loginRedirect(request: Request, error: string) {
  const url = new URL("/admin/login", request.url);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return loginRedirect(request, "missing_fields");

  const authClient = createServerSupabaseClient();
  const adminClient = createServiceSupabaseAdminClient();
  if (!authClient || !adminClient) return loginRedirect(request, "missing_config");

  const { data, error } = await authClient.auth.signInWithPassword({ email, password });
  if (error || !data.session?.access_token || !data.user?.email) return loginRedirect(request, "invalid_login");

  const { data: admin, error: adminError } = await adminClient
    .from("admin_users")
    .select("id,email,role,status")
    .eq("email", data.user.email.toLowerCase())
    .eq("status", "active")
    .maybeSingle();

  if (adminError || !admin) return loginRedirect(request, "access_denied");

  const response = NextResponse.redirect(new URL("/admin/dashboard", request.url), 303);
  response.cookies.set(ADMIN_ACCESS_COOKIE, data.session.access_token, {
    ...cookieOptions,
    maxAge: data.session.expires_in ?? 3600,
  });
  response.cookies.set(ADMIN_REFRESH_COOKIE, data.session.refresh_token, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
