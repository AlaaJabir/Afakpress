import { ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE } from "@/lib/admin-auth";
import { createServerSupabaseClient, createServiceSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function POST(request: Request) {
  const { accessToken, refreshToken, expiresIn } = await request.json();
  if (!accessToken || !refreshToken) {
    return Response.json({ error: "Missing Supabase session tokens." }, { status: 400 });
  }

  const authClient = createServerSupabaseClient();
  const adminClient = createServiceSupabaseAdminClient();
  if (!authClient || !adminClient) {
    return Response.json({ error: "Missing Supabase configuration." }, { status: 500 });
  }

  const { data: userData, error: userError } = await authClient.auth.getUser(accessToken);
  const user = userData.user;
  if (userError || !user?.email) {
    return Response.json({ error: "Invalid Supabase session." }, { status: 401 });
  }

  const { data: admin, error: adminError } = await adminClient
    .from("admin_users")
    .select("id,email,role,status")
    .eq("email", user.email.toLowerCase())
    .eq("status", "active")
    .maybeSingle();

  if (adminError || !admin) {
    return Response.json({ error: "Access denied." }, { status: 403 });
  }

  const response = Response.json({ ok: true, admin: { email: admin.email, role: admin.role } });
  response.headers.append(
    "Set-Cookie",
    `${ADMIN_ACCESS_COOKIE}=${encodeURIComponent(accessToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Number(expiresIn) || 3600}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
  response.headers.append(
    "Set-Cookie",
    `${ADMIN_REFRESH_COOKIE}=${encodeURIComponent(refreshToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
  return response;
}

export async function DELETE() {
  const response = Response.json({ ok: true });
  response.headers.append("Set-Cookie", `${ADMIN_ACCESS_COOKIE}=; Path=${cookieOptions.path}; HttpOnly; SameSite=Lax; Max-Age=0${cookieOptions.secure ? "; Secure" : ""}`);
  response.headers.append("Set-Cookie", `${ADMIN_REFRESH_COOKIE}=; Path=${cookieOptions.path}; HttpOnly; SameSite=Lax; Max-Age=0${cookieOptions.secure ? "; Secure" : ""}`);
  return response;
}

