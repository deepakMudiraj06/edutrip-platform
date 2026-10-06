import type { RegistrationStatus } from "@/types/registration";

export type ParentStudent = {
  id: string;
  fullName: string;
  studentNumber: string | null;
  gradeLevel: string | null;
  schoolName: string | null;
};

export type ParentTripRegistration = {
  id: string;
  studentId: string;
  studentName: string;
  tripId: string;
  tripSlug: string;
  tripTitle: string;
  destinationName: string;
  price: number;
  startDate: string;
  endDate: string;
  status: RegistrationStatus;
  registeredAt: string;
};

export type ParentDashboardData = {
  students: ParentStudent[];
  registrations: ParentTripRegistration[];
};

export type ParentServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: Error };

export type ParentService = {
  getDashboard(): Promise<ParentServiceResult<ParentDashboardData>>;
};
