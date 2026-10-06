import type { Metadata } from "next";

import { StudentDashboard, StudentDashboardError } from "@/components/student/student-dashboard";
import { StudentProfileSetup } from "@/components/student/student-profile-setup";
import { requireRole } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createStudentService } from "@/services/student/student.service";
import { createRegistrationService } from "@/services/registration/registration.service";

export const metadata: Metadata = { title: "Student" };

export default async function StudentPage() {
  const supabase = await createSupabaseServerClient();
  await requireRole("STUDENT", supabase);

  const result = await createStudentService(supabase).getCurrentStudentDashboard();

  if (result.error) {
    return <StudentDashboardError />;
  }

  const registrationsResult = await createRegistrationService(supabase).getMyRegistrations();

  return result.data.student ? (
    <StudentDashboard
      data={result.data}
      registrations={registrationsResult.data}
      registrationsError={Boolean(registrationsResult.error)}
    />
  ) : (
    <StudentProfileSetup fullName={result.data.profile.fullName} />
  );
}
