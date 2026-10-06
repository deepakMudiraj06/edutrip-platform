import type { AuthClient } from "@/types/auth";
import type {
  RegistrationErrorCode,
  RegistrationService,
  RegistrationServiceError,
  RegistrationServiceResult,
  RegistrationStatus,
  MyTripRegistration,
  TripRegistration,
} from "@/types/registration";
import type { TripStatus } from "@/types/catalogue";

import { tripIdSchema } from "./registration.validation";

type RegisterForTripRow = {
  success: boolean;
  code: RegistrationErrorCode | "registered";
  message: string;
  registration_id: string | null;
};

type RegistrationRow = {
  id: string;
  trip_id: string;
  status: RegistrationStatus;
};

type MyTripRegistrationRow = {
  id: string;
  trip_id: string;
  status: RegistrationStatus;
  registered_at: string;
  updated_at: string;
  trips: {
    title: string;
    slug: string;
    start_date: string;
    end_date: string;
    price: number;
    status: TripStatus;
    destinations: {
      name: string;
    };
  };
};

const ERROR_MESSAGES: Record<RegistrationErrorCode, string> = {
  invalid_trip_id: "A valid trip is required.",
  unauthenticated: "Authentication is required.",
  not_student: "Only student accounts can register for trips.",
  student_profile_missing: "A student profile is required.",
  trip_not_found: "The requested trip was not found.",
  trip_not_published: "This trip is not available for registration.",
  trip_not_open: "This trip is not open for registration.",
  registration_deadline_passed: "Registration for this trip has closed.",
  already_registered: "You are already registered for this trip.",
  trip_full: "This trip has reached capacity.",
  registration_failed: "The trip registration could not be completed.",
};

function createRegistrationError(code: RegistrationErrorCode): RegistrationServiceError {
  const error = new Error(ERROR_MESSAGES[code]) as RegistrationServiceError;
  error.code = code;
  return error;
}

function isRegistrationErrorCode(value: string): value is RegistrationErrorCode {
  return value in ERROR_MESSAGES;
}

function mapRegistration(row: RegistrationRow): TripRegistration {
  return {
    id: row.id,
    tripId: row.trip_id,
    status: row.status,
  };
}

function mapMyTripRegistration(row: MyTripRegistrationRow): MyTripRegistration {
  return {
    id: row.id,
    tripId: row.trip_id,
    status: row.status,
    registeredAt: row.registered_at,
    updatedAt: row.updated_at,
    trip: {
      title: row.trips.title,
      slug: row.trips.slug,
      startDate: row.trips.start_date,
      endDate: row.trips.end_date,
      price: row.trips.price,
      status: row.trips.status,
      destination: {
        name: row.trips.destinations.name,
      },
    },
  };
}

export function createRegistrationService(supabase: AuthClient): RegistrationService {
  return {
    async getCurrentRegistrationForTrip(
      tripId: string,
    ): Promise<RegistrationServiceResult<TripRegistration | null>> {
      const validation = tripIdSchema.safeParse(tripId);

      if (!validation.success) {
        return { data: null, error: createRegistrationError("invalid_trip_id") };
      }

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          return { data: null, error: createRegistrationError("unauthenticated") };
        }

        if (!user) {
          return { data: null, error: createRegistrationError("unauthenticated") };
        }

        const { data, error } = await supabase
          .from("trip_registrations")
          .select("id, trip_id, status")
          .eq("trip_id", validation.data)
          .eq("student_id", user.id)
          .maybeSingle()
          .returns<RegistrationRow | null>();

        if (error) {
          return { data: null, error: createRegistrationError("registration_failed") };
        }

        return { data: data ? mapRegistration(data) : null, error: null };
      } catch {
        return { data: null, error: createRegistrationError("registration_failed") };
      }
    },

    async getMyRegistrations(): Promise<RegistrationServiceResult<MyTripRegistration[]>> {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          return { data: null, error: createRegistrationError("unauthenticated") };
        }

        const { data, error } = await supabase
          .from("trip_registrations")
          .select(
            "id, trip_id, status, registered_at, updated_at, trips (title, slug, start_date, end_date, price, status, destinations (name))",
          )
          .eq("student_id", user.id)
          .order("registered_at", { ascending: false })
          .returns<MyTripRegistrationRow[]>();

        if (error) {
          return { data: null, error: createRegistrationError("registration_failed") };
        }

        return { data: data.map(mapMyTripRegistration), error: null };
      } catch {
        return { data: null, error: createRegistrationError("registration_failed") };
      }
    },

    async getRegistrationCountsByTrip(): Promise<RegistrationServiceResult<Record<string, number>>> {
      try {
        const { data, error } = await supabase
          .from("trip_registrations")
          .select("trip_id")
          .returns<Array<{ trip_id: string }>>();

        if (error) {
          return { data: null, error: createRegistrationError("registration_failed") };
        }

        const counts: Record<string, number> = {};
        for (const row of data) {
          counts[row.trip_id] = (counts[row.trip_id] ?? 0) + 1;
        }

        return { data: counts, error: null };
      } catch {
        return { data: null, error: createRegistrationError("registration_failed") };
      }
    },

    async registerForTrip(tripId: string): Promise<RegistrationServiceResult<TripRegistration>> {
      const validation = tripIdSchema.safeParse(tripId);

      if (!validation.success) {
        return { data: null, error: createRegistrationError("invalid_trip_id") };
      }

      const { data, error } = await supabase
        .rpc("register_for_trip", { p_trip_id: validation.data })
        .single()
        .returns<RegisterForTripRow>();

      if (error || !data) {
        return { data: null, error: createRegistrationError("registration_failed") };
      }

      const result = data;

      if (!result.success) {
        const code = isRegistrationErrorCode(result.code)
          ? result.code
          : "registration_failed";
        return { data: null, error: createRegistrationError(code) };
      }

      if (result.code !== "registered" || !result.registration_id) {
        return { data: null, error: createRegistrationError("registration_failed") };
      }

      return {
        data: {
          id: result.registration_id,
          tripId: validation.data,
          status: "PENDING",
        },
        error: null,
      };
    },
  };
}
