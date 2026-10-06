import type { AuthClient } from "@/types/auth";
import type { TripStatus } from "@/types/catalogue";

export type RegistrationErrorCode =
  | "invalid_trip_id"
  | "unauthenticated"
  | "not_student"
  | "student_profile_missing"
  | "trip_not_found"
  | "trip_not_published"
  | "trip_not_open"
  | "registration_deadline_passed"
  | "already_registered"
  | "trip_full"
  | "registration_failed";

export type RegistrationServiceError = Error & {
  code: RegistrationErrorCode;
};

export type RegistrationStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export type TripRegistration = {
  id: string;
  tripId: string;
  status: RegistrationStatus;
};

export type MyTripRegistration = {
  id: string;
  tripId: string;
  status: RegistrationStatus;
  registeredAt: string;
  updatedAt: string;
  trip: {
    title: string;
    slug: string;
    startDate: string;
    endDate: string;
    price: number;
    status: TripStatus;
    destination: {
      name: string;
    };
  };
};

export type RegistrationServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: RegistrationServiceError };

export type RegistrationService = {
  getCurrentRegistrationForTrip(
    tripId: string,
  ): Promise<RegistrationServiceResult<TripRegistration | null>>;
  getMyRegistrations(): Promise<RegistrationServiceResult<MyTripRegistration[]>>;
  getRegistrationCountsByTrip(): Promise<RegistrationServiceResult<Record<string, number>>>;
  registerForTrip(tripId: string): Promise<RegistrationServiceResult<TripRegistration>>;
};

export type RegistrationServiceFactory = (supabase: AuthClient) => RegistrationService;
