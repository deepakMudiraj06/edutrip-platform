import type { AuthClient } from "@/types/auth";
import type { AdminDashboardData, AdminService, AdminServiceResult } from "@/types/admin";

import { createCatalogueService } from "@/services/catalogue/catalogue.service";
import { createRegistrationService } from "@/services/registration/registration.service";

function serviceError(error: unknown): AdminServiceResult<never> {
  return {
    data: null,
    error: new Error(error instanceof Error ? error.message : "Unable to load the admin dashboard."),
  };
}

export function createAdminService(supabase: AuthClient): AdminService {
  return {
    async getDashboard(): Promise<AdminServiceResult<AdminDashboardData>> {
      try {
        const [tripsResult, studentsResult, registrationResult] = await Promise.all([
          createCatalogueService(supabase).getAllTrips(),
          supabase.from("students").select("id", { count: "exact", head: true }),
          createRegistrationService(supabase).getRegistrationCountsByTrip(),
        ]);

        if (tripsResult.error || studentsResult.error || registrationResult.error) {
          return serviceError(new Error("Unable to load the admin dashboard."));
        }

        const trips = tripsResult.data;
        const registrationCounts = registrationResult.data;

        return {
          data: {
            trips,
            totalStudents: studentsResult.count ?? 0,
            totalRegistrations: Object.values(registrationCounts).reduce(
              (total, count) => total + count,
              0,
            ),
            publishedOpenTrips: trips.filter(
              (trip) => trip.isPublished && trip.status === "OPEN",
            ).length,
            registrationCounts,
          },
          error: null,
        };
      } catch (error) {
        return serviceError(error);
      }
    },
  };
}
