import type { Metadata } from "next";

import { AdminDashboard, AdminDashboardError } from "@/components/admin/admin-dashboard";
import { requireRole } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdminService } from "@/services/admin/admin.service";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  await requireRole("ADMIN", supabase);

  const result = await createAdminService(supabase).getDashboard();

  return result.error ? <AdminDashboardError /> : <AdminDashboard data={result.data} />;
}
