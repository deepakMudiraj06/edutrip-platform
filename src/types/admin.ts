import type { Trip } from "@/types/catalogue";

export type AdminDashboardData = {
  trips: Trip[];
  totalStudents: number;
  totalRegistrations: number;
  publishedOpenTrips: number;
  registrationCounts: Record<string, number>;
};

export type AdminServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: Error };

export type AdminService = {
  getDashboard(): Promise<AdminServiceResult<AdminDashboardData>>;
};
