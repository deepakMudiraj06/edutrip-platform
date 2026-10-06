import type { UserRole } from "@/types/auth";

export type StudentSchool = {
  id: string;
  name: string;
  code: string | null;
  address: string | null;
};

export type StudentProfileSummary = {
  id: string;
  fullName: string;
  role: Extract<UserRole, "STUDENT">;
  phone: string | null;
};

export type StudentRecord = {
  id: string;
  studentNumber: string | null;
  gradeLevel: string | null;
  school: StudentSchool | null;
};

export type StudentDashboardData = {
  profile: StudentProfileSummary;
  student: StudentRecord | null;
};

export type CreateStudentProfileInput = {
  studentNumber: string | null;
  gradeLevel: string | null;
  schoolId: string | null;
};

export type StudentServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: Error };

export type StudentService = {
  getCurrentStudentDashboard(): Promise<StudentServiceResult<StudentDashboardData>>;
  createStudentProfile(input: unknown): Promise<StudentServiceResult<StudentRecord>>;
};
