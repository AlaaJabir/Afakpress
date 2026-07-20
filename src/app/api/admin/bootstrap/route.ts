import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { cmsRoleFromAdmin } from "@/lib/admin-roles";
import { seedDefaultCmsReferences } from "@/lib/cms-reference-data";
import { createServiceSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceSupabaseClient();
  if (!supabase) return Response.json({ error: "Missing Supabase service role configuration." }, { status: 500 });

  const profile = {
    id: session.userId,
    name: session.email,
    email: session.email,
    role: cmsRoleFromAdmin(session.role),
    avatar: null,
  };

  const error = await seedDefaultCmsReferences(supabase, profile, { includeLocations: true, syncMissingHierarchy: true });
  if (error) return Response.json({ error }, { status: 400 });

  return Response.json({ ok: true });
}
