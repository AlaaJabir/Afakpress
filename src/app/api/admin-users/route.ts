import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { adminRoles, canManageAdmins, type AdminRole } from "@/lib/admin-roles";
import { createServiceSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const adminUserColumns = "id,user_id,email,role,status,created_at";

async function requireSuperAdmin(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!canManageAdmins(session.role)) return { error: Response.json({ error: "Forbidden" }, { status: 403 }) };
  return { session };
}

export async function GET(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;
  const supabase = createServiceSupabaseAdminClient();
  if (!supabase) return Response.json({ error: "Missing Supabase service role configuration." }, { status: 500 });

  const { data, error } = await supabase.from("admin_users").select(adminUserColumns).order("created_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ data });
}

export async function POST(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;
  const supabase = createServiceSupabaseAdminClient();
  if (!supabase) return Response.json({ error: "Missing Supabase service role configuration." }, { status: 500 });

  const { email, role } = await request.json();
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  const nextRole = adminRoles.includes(role) ? role : "admin";
  if (!normalizedEmail) return Response.json({ error: "Email is required." }, { status: 400 });

  let userId: string | null = null;
  const inviteResult = await supabase.auth.admin.inviteUserByEmail(normalizedEmail);
  if (inviteResult.data.user?.id) {
    userId = inviteResult.data.user.id;
  }

  const { data, error } = await supabase
    .from("admin_users")
    .upsert({ email: normalizedEmail, user_id: userId, role: nextRole, status: "active" }, { onConflict: "email" })
    .select(adminUserColumns)
    .single();

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ data, invited: !inviteResult.error, inviteError: inviteResult.error?.message ?? "" });
}

export async function PATCH(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;
  const supabase = createServiceSupabaseAdminClient();
  if (!supabase) return Response.json({ error: "Missing Supabase service role configuration." }, { status: 500 });

  const { id, role, status } = await request.json();
  if (!id) return Response.json({ error: "Missing id." }, { status: 400 });
  const payload: { role?: AdminRole; status?: string } = {};
  if (adminRoles.includes(role)) payload.role = role;
  if (status === "active" || status === "disabled") payload.status = status;

  const { data, error } = await supabase.from("admin_users").update(payload).eq("id", id).select(adminUserColumns).single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ data });
}

export async function DELETE(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;
  const supabase = createServiceSupabaseAdminClient();
  if (!supabase) return Response.json({ error: "Missing Supabase service role configuration." }, { status: 500 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id." }, { status: 400 });
  const { error } = await supabase.from("admin_users").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}
