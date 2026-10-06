import type { PostgrestError } from "@supabase/supabase-js";

import type { AuthClient } from "@/types/auth";
import type {
  CreateStudentProfileInput,
  StudentDashboardData,
  StudentProfileSummary,
  StudentRecord,
  StudentSchool,
  StudentService,
  StudentServiceResult,
} from "@/types/student";

import { studentProfileSchema } from "./student.validation";

type ProfileRow = {
  id: string;
  full_name: string;
  role: "STUDENT";
  phone: string | null;
};

type StudentRow = {
  id: string;
  student_number: string | null;
  grade_level: string | null;
  schools: StudentSchoolRow | null;
};

type StudentSchoolRow = {
  id: string;
  name: string;
  code: string | null;
  address: string | null;
};

function serviceError(error: PostgrestError | Error): StudentServiceResult<never> {
  return { data: null, error };
}

function unexpectedDashboardError(error: unknown): Error {
  return error instanceof Error
    ? error
    : new Error("Unable to load the student dashboard.");
}

function unexpectedProfileError(error: unknown): Error {
  return error instanceof Error
    ? error
    : new Error("Unable to complete the student profile request.");
}

function mapProfile(row: ProfileRow): StudentProfileSummary {
  return {
    id: row.id,
    fullName: row.full_name,
    role: row.role,
    phone: row.phone,
  };
}

function mapSchool(row: StudentSchoolRow): StudentSchool {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    address: row.address,
  };
}

function mapStudent(row: StudentRow): StudentRecord {
  return {
    id: row.id,
    studentNumber: row.student_number,
    gradeLevel: row.grade_level,
    school: row.schools ? mapSchool(row.schools) : null,
  };
}

export function createStudentService(supabase: AuthClient): StudentService {
  return {
    async getCurrentStudentDashboard(): Promise<StudentServiceResult<StudentDashboardData>> {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          return serviceError(userError);
        }

        if (!user) {
          return serviceError(new Error("No authenticated user was found."));
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, role, phone")
          .eq("id", user.id)
          .eq("role", "STUDENT")
          .maybeSingle()
          .returns<ProfileRow | null>();

        if (profileError) {
          return serviceError(profileError);
        }

        if (!profile) {
          return serviceError(new Error("The authenticated student profile was not found."));
        }

        const { data: student, error: studentError } = await supabase
          .from("students")
          .select(
            "id, student_number, grade_level, schools (id, name, code, address)",
          )
          .eq("id", user.id)
          .maybeSingle()
          .returns<StudentRow | null>();

        if (studentError) {
          return serviceError(studentError);
        }

        return {
          data: {
            profile: mapProfile(profile),
            student: student ? mapStudent(student) : null,
          },
          error: null,
        };
      } catch (error) {
        return serviceError(unexpectedDashboardError(error));
      }
    },

    async createStudentProfile(input: unknown): Promise<StudentServiceResult<StudentRecord>> {
      const validation = studentProfileSchema.safeParse(input);

      if (!validation.success) {
        return serviceError(new Error(validation.error.issues[0]?.message ?? "Check your student details."));
      }

      const profileInput: CreateStudentProfileInput = validation.data;

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          return serviceError(userError);
        }

        if (!user) {
          return serviceError(new Error("No authenticated user was found."));
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle()
          .returns<{ role: "STUDENT" } | null>();

        if (profileError) {
          return serviceError(profileError);
        }

        if (!profile || profile.role !== "STUDENT") {
          return serviceError(new Error("Only authenticated student profiles can create student records."));
        }

        const { data: student, error: studentError } = await supabase
          .from("students")
          .insert({
            id: user.id,
            student_number: profileInput.studentNumber,
            grade_level: profileInput.gradeLevel,
            school_id: profileInput.schoolId,
          })
          .select("id, student_number, grade_level, schools (id, name, code, address)")
          .single()
          .returns<StudentRow>();

        if (studentError) {
          return serviceError(studentError);
        }

        return { data: mapStudent(student), error: null };
      } catch (error) {
        return serviceError(unexpectedProfileError(error));
      }
    },
  };
}
