export type AdminRole = "super_admin" | "admin" | "editor" | "journalist";

export function cmsRoleFromAdmin(role: AdminRole) {
  if (role === "super_admin" || role === "admin") return "Super Admin" as const;
  if (role === "editor") return "Editor" as const;
  return "Journalist" as const;
}

export function canManageAdmins(role: AdminRole) {
  return role === "super_admin";
}

export const adminRoles: AdminRole[] = ["super_admin", "admin", "editor", "journalist"];

