"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createStudentService } from "@/services/student/student.service";
import { studentProfileSchema } from "@/services/student/student.validation";

export type StudentProfileActionResult =
  | { success: true }
  | { success: false; message: string; fieldErrors?: Record<string, string> };

function getFieldErrors(error: { issues: Array<{ path: PropertyKey[]; message: string }> }) {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }

  return fieldErrors;
}

function safeProfileError(message: string): string {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("duplicate key") || normalizedMessage.includes("already exists")) {
    return "Your student profile already exists. Refresh the page to view it.";
  }

  if (normalizedMessage.includes("row-level security") || normalizedMessage.includes("permission denied")) {
    return "Your student profile could not be authorized. Please sign in again and try again.";
  }

  if (normalizedMessage.includes("foreign key") || normalizedMessage.includes("school")) {
    return "That school is no longer available. Leave school unselected and try again.";
  }

  return "We could not create your student profile. Please check your details and try again.";
}

export async function createStudentProfileAction(
  input: unknown,
): Promise<StudentProfileActionResult> {
  const validation = studentProfileSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message: "Check the highlighted details and try again.",
      fieldErrors: getFieldErrors(validation.error),
    };
  }

  const supabase = await createSupabaseServerClient();
  const result = await createStudentService(supabase).createStudentProfile(validation.data);

  if (result.error) {
    return { success: false, message: safeProfileError(result.error.message) };
  }

  revalidatePath("/student");
  return { success: true };
}
