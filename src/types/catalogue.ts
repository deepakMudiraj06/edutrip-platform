export type TripStatus =
  | "DRAFT"
  | "OPEN"
  | "FULL"
  | "COMPLETED"
  | "CANCELLED";

export type Destination = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  location: string | null;
  country: string | null;
  imageUrl: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TripItinerary = {
  id: string;
  tripId: string;
  dayNumber: number;
  title: string;
  description: string | null;
  activities: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Trip = {
  id: string;
  destinationId: string;
  title: string;
  slug: string;
  description: string | null;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  capacity: number;
  price: number;
  status: TripStatus;
  isPublished: boolean;
  destination: Destination | null;
  createdAt: string;
  updatedAt: string;
};

export type TripDetail = Trip & {
  itinerary: TripItinerary[];
};

export type CatalogueResult<T> =
  | { data: T; error: null }
  | { data: null; error: Error };

export type CatalogueService = {
  getPublishedDestinations(): Promise<CatalogueResult<Destination[]>>;
  getPublishedTrips(): Promise<CatalogueResult<Trip[]>>;
  getAllTrips(): Promise<CatalogueResult<Trip[]>>;
  getPublishedTripBySlug(slug: string): Promise<CatalogueResult<TripDetail | null>>;
  getPublishedItineraryForTrip(tripId: string): Promise<CatalogueResult<TripItinerary[]>>;
};
