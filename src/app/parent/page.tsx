import type { Metadata } from "next";

import { ParentDashboard, ParentDashboardError } from "@/components/parent/parent-dashboard";
import { requireRole } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createParentService } from "@/services/parent/parent.service";

export const metadata: Metadata = { title: "Parent" };

export default async function ParentPage() {
  const supabase = await createSupabaseServerClient();
  await requireRole("PARENT", supabase);

  const result = await createParentService(supabase).getDashboard();

  return result.error ? <ParentDashboardError /> : <ParentDashboard data={result.data} />;
}
