import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAuthService } from "@/services/auth/auth.service";
import type { AuthClient, UserRole } from "@/types/auth";

const roleRoutes: Record<UserRole, string> = {
  ADMIN: "/admin",
  STUDENT: "/student",
  PARENT: "/parent",
};

export async function requireRole(
  expectedRole: UserRole,
  supabase?: AuthClient,
): Promise<UserRole> {
  const authService = createAuthService(
    supabase ?? (await createSupabaseServerClient()),
  );
  const result = await authService.getCurrentUserRole();

  if (result.error) {
    redirect("/login");
  }

  if (result.data.role !== expectedRole) {
    redirect(roleRoutes[result.data.role]);
  }

  return result.data.role;
}
