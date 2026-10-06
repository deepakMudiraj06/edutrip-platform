import type { PostgrestError } from "@supabase/supabase-js";

import type { AuthClient } from "@/types/auth";
import type {
  CatalogueResult,
  CatalogueService,
  Destination,
  Trip,
  TripDetail,
  TripItinerary,
  TripStatus,
} from "@/types/catalogue";

type DestinationRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  location: string | null;
  country: string | null;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type ItineraryRow = {
  id: string;
  trip_id: string;
  day_number: number;
  title: string;
  description: string | null;
  activities: string | null;
  created_at: string;
  updated_at: string;
};

type TripRow = {
  id: string;
  destination_id: string;
  title: string;
  slug: string;
  description: string | null;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  capacity: number;
  price: number;
  status: TripStatus;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  destinations: DestinationRow | null;
  trip_itineraries?: ItineraryRow[] | null;
};

const destinationColumns = `
  id,
  name,
  slug,
  description,
  location,
  country,
  image_url,
  is_published,
  created_at,
  updated_at
`;

const tripColumns = `
  id,
  destination_id,
  title,
  slug,
  description,
  start_date,
  end_date,
  registration_deadline,
  capacity,
  price,
  status,
  is_published,
  created_at,
  updated_at
`;

const itineraryColumns = `
  id,
  trip_id,
  day_number,
  title,
  description,
  activities,
  created_at,
  updated_at
`;

function catalogueError(error: PostgrestError | Error): CatalogueResult<never> {
  return { data: null, error };
}

function mapDestination(row: DestinationRow): Destination {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    location: row.location,
    country: row.country,
    imageUrl: row.image_url,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapItinerary(row: ItineraryRow): TripItinerary {
  return {
    id: row.id,
    tripId: row.trip_id,
    dayNumber: row.day_number,
    title: row.title,
    description: row.description,
    activities: row.activities,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTrip(row: TripRow): Trip {
  return {
    id: row.id,
    destinationId: row.destination_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    registrationDeadline: row.registration_deadline,
    capacity: row.capacity,
    price: row.price,
    status: row.status,
    isPublished: row.is_published,
    destination: row.destinations ? mapDestination(row.destinations) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTripDetail(row: TripRow): TripDetail {
  return {
    ...mapTrip(row),
    itinerary: (row.trip_itineraries ?? [])
      .map(mapItinerary)
      .sort((first, second) => first.dayNumber - second.dayNumber),
  };
}

function unexpectedCatalogueError(error: unknown): Error {
  return error instanceof Error
    ? error
    : new Error("Unable to load the public trip catalogue.");
}

export function createCatalogueService(supabase: AuthClient): CatalogueService {
  return {
    async getPublishedDestinations(): Promise<CatalogueResult<Destination[]>> {
      try {
        const { data, error } = await supabase
          .from("destinations")
          .select(destinationColumns)
          .eq("is_published", true)
          .order("name", { ascending: true })
          .returns<DestinationRow[]>();

        if (error) {
          return catalogueError(error);
        }

        return { data: data.map(mapDestination), error: null };
      } catch (error) {
        return catalogueError(unexpectedCatalogueError(error));
      }
    },

    async getPublishedTrips(): Promise<CatalogueResult<Trip[]>> {
      try {
        const { data, error } = await supabase
          .from("trips")
          .select(`${tripColumns}, destinations (${destinationColumns})`)
          .eq("is_published", true)
          .order("start_date", { ascending: true })
          .returns<TripRow[]>();

        if (error) {
          return catalogueError(error);
        }

        return { data: data.map(mapTrip), error: null };
      } catch (error) {
        return catalogueError(unexpectedCatalogueError(error));
      }
    },

    async getAllTrips(): Promise<CatalogueResult<Trip[]>> {
      try {
        const { data, error } = await supabase
          .from("trips")
          .select(`${tripColumns}, destinations (${destinationColumns})`)
          .order("start_date", { ascending: true })
          .returns<TripRow[]>();

        if (error) {
          return catalogueError(error);
        }

        return { data: data.map(mapTrip), error: null };
      } catch (error) {
        return catalogueError(unexpectedCatalogueError(error));
      }
    },

    async getPublishedTripBySlug(
      slug: string,
    ): Promise<CatalogueResult<TripDetail | null>> {
      if (!slug.trim()) {
        return catalogueError(new Error("A trip slug is required."));
      }

      try {
        const { data, error } = await supabase
          .from("trips")
          .select(
            `${tripColumns}, destinations (${destinationColumns}), trip_itineraries (${itineraryColumns})`,
          )
          .eq("slug", slug)
          .eq("is_published", true)
          .maybeSingle()
          .returns<TripRow | null>();

        if (error) {
          return catalogueError(error);
        }

        return { data: data ? mapTripDetail(data) : null, error: null };
      } catch (error) {
        return catalogueError(unexpectedCatalogueError(error));
      }
    },

    async getPublishedItineraryForTrip(
      tripId: string,
    ): Promise<CatalogueResult<TripItinerary[]>> {
      if (!tripId.trim()) {
        return catalogueError(new Error("A trip ID is required."));
      }

      try {
        const { data: publishedTrip, error: tripError } = await supabase
          .from("trips")
          .select("id")
          .eq("id", tripId)
          .eq("is_published", true)
          .maybeSingle()
          .returns<{ id: string } | null>();

        if (tripError) {
          return catalogueError(tripError);
        }

        if (!publishedTrip) {
          return { data: [], error: null };
        }

        const { data, error } = await supabase
          .from("trip_itineraries")
          .select(itineraryColumns)
          .eq("trip_id", tripId)
          .order("day_number", { ascending: true })
          .returns<ItineraryRow[]>();

        if (error) {
          return catalogueError(error);
        }

        return { data: data.map(mapItinerary), error: null };
      } catch (error) {
        return catalogueError(unexpectedCatalogueError(error));
      }
    },
  };
}
