import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { TripRegistrationAction } from "@/components/registration/trip-registration-action";
import { createAuthService } from "@/services/auth/auth.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createCatalogueService } from "@/services/catalogue/catalogue.service";
import { createRegistrationService } from "@/services/registration/registration.service";
import type { Trip, TripDetail } from "@/types/catalogue";
import type { TripRegistration } from "@/types/registration";
import type { UserRole } from "@/types/auth";

type TripDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  title: "Trip details",
  description: "Explore the itinerary, dates, and registration details for an EduTrip journey.",
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const numberFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
});

function formatDate(value: string): string {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

function formatStatus(status: Trip["status"]): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function CatalogueError() {
  return (
    <main className="min-h-screen bg-[#f7f8f4] px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-200 bg-red-50 px-6 py-14 text-center sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-700">Catalogue unavailable</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-red-950">
          We could not load this trip.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-red-900/70">
          Please try again shortly. The catalogue was not changed.
        </p>
        <Link href="/trips" className="mt-8 inline-flex rounded-xl bg-emerald-900 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800">
          Browse all trips
        </Link>
      </div>
    </main>
  );
}

function TripDetailView({
  trip,
  viewerRole,
  initialRegistration,
}: {
  trip: TripDetail;
  viewerRole: UserRole | null;
  initialRegistration: TripRegistration | null;
}) {
  const destination = trip.destination;
  const itinerary = [...trip.itinerary].sort((first, second) => first.dayNumber - second.dayNumber);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8f4]">
      <PublicHeader />

      <section className="relative overflow-hidden bg-emerald-950 text-white">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-lime-300/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-20">
          <Link href="/trips" className="inline-flex items-center gap-2 text-sm font-medium text-lime-200 hover:text-white">
            <span aria-hidden="true">&lt;-</span> Back to all trips
          </Link>
          <div className="mt-12 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full border border-lime-200/20 bg-white/10 px-3 py-1 font-semibold uppercase tracking-[0.16em] text-lime-200">
                {formatStatus(trip.status)}
              </span>
              <span className="text-emerald-50/65">
                {destination?.name || "Destination details unavailable"}
              </span>
            </div>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-7xl">
              {trip.title}
            </h1>
            {trip.description && (
              <p className="mt-7 max-w-2xl text-lg leading-8 text-emerald-50/70">
                {trip.description}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1fr_20rem] lg:px-8 lg:py-16">
        <div>
          {destination?.description && (
            <section aria-labelledby="destination-heading">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">The destination</p>
              <h2 id="destination-heading" className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-emerald-950">
                {destination.name}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-950/65">
                {destination.description}
              </p>
              {(destination.location || destination.country) && (
                <p className="mt-4 text-sm font-medium text-emerald-950/55">
                  {[destination.location, destination.country].filter(Boolean).join(", ")}
                </p>
              )}
            </section>
          )}

          <section aria-labelledby="itinerary-heading" className={destination?.description ? "mt-16" : ""}>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">The itinerary</p>
            <h2 id="itinerary-heading" className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-emerald-950">
              A closer look at the journey.
            </h2>
            {itinerary.length > 0 ? (
              <ol className="mt-8 space-y-4" aria-label={`${trip.title} itinerary`}>
                {itinerary.map((day) => (
                  <li key={day.id} className="rounded-[1.5rem] border border-emerald-950/10 bg-white p-6 shadow-sm sm:p-7">
                    <div className="flex gap-5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-900 text-sm font-semibold text-lime-200">
                        {day.dayNumber}
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Day {day.dayNumber}</p>
                        <h3 className="mt-2 text-xl font-semibold tracking-tight text-emerald-950">{day.title}</h3>
                        {day.description && <p className="mt-3 text-sm leading-6 text-emerald-950/65">{day.description}</p>}
                        {day.activities && (
                          <div className="mt-4 border-l-2 border-lime-300 pl-4 text-sm leading-6 text-emerald-950/70">
                            <p className="font-semibold text-emerald-950">Activities</p>
                            <p className="mt-1">{day.activities}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-8 rounded-2xl border border-dashed border-emerald-950/20 bg-white/60 px-6 py-8 text-sm text-emerald-950/60">
                The itinerary for this trip will be available soon.
              </p>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-[1.5rem] border border-emerald-950/10 bg-white p-6 shadow-sm lg:sticky lg:top-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Trip overview</p>
          <dl className="mt-6 divide-y divide-emerald-950/10 text-sm">
            <div className="flex items-start justify-between gap-4 py-4 first:pt-0">
              <dt className="text-emerald-950/55">Dates</dt>
              <dd className="text-right font-medium text-emerald-950">{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-4">
              <dt className="text-emerald-950/55">Registration deadline</dt>
              <dd className="text-right font-medium text-emerald-950">{formatDate(trip.registrationDeadline)}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-4">
              <dt className="text-emerald-950/55">Listed price</dt>
              <dd className="text-right font-medium text-emerald-950">{numberFormatter.format(trip.price)}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-4">
              <dt className="text-emerald-950/55">Capacity</dt>
              <dd className="text-right font-medium text-emerald-950">{trip.capacity} places</dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-4 last:pb-0">
              <dt className="text-emerald-950/55">Status</dt>
              <dd className="text-right font-medium text-emerald-950">{formatStatus(trip.status)}</dd>
            </div>
          </dl>
          <TripRegistrationAction
            tripId={trip.id}
            tripStatus={trip.status}
            viewerRole={viewerRole}
            initialRegistration={initialRegistration}
          />
        </aside>
      </section>
      <PublicFooter />
    </main>
  );
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const catalogueService = createCatalogueService(supabase);
  const result = await catalogueService.getPublishedTripBySlug(slug);

  if (result.error) {
    return <CatalogueError />;
  }

  if (!result.data) {
    notFound();
  }

  const roleResult = await createAuthService(supabase).getCurrentUserRole();
  const viewerRole = roleResult.error ? null : roleResult.data.role;
  let initialRegistration: TripRegistration | null = null;

  if (viewerRole === "STUDENT") {
    const registrationResult = await createRegistrationService(supabase).getCurrentRegistrationForTrip(result.data.id);
    initialRegistration = registrationResult.error ? null : registrationResult.data;
  }

  return <TripDetailView trip={result.data} viewerRole={viewerRole} initialRegistration={initialRegistration} />;
}
