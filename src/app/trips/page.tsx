import type { Metadata } from "next";

import { TripCard } from "@/components/catalogue/trip-card";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createCatalogueService } from "@/services/catalogue/catalogue.service";

export const metadata: Metadata = {
  title: "Explore trips",
  description: "Explore published EduTrip educational journeys.",
};

function CatalogueError() {
  return (
    <section className="rounded-[1.5rem] border border-red-200 bg-red-50 px-6 py-10 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-700">Catalogue unavailable</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-red-950">
        We could not load the trips right now.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-red-900/70">
        Please try again shortly. No trip information was changed.
      </p>
    </section>
  );
}

function EmptyCatalogue() {
  return (
    <section className="rounded-[1.5rem] border border-dashed border-emerald-950/20 bg-white/60 px-6 py-14 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Coming soon</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-emerald-950">
        New journeys are being prepared.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-emerald-950/60">
        There are no published trips available at the moment. Please check back soon.
      </p>
    </section>
  );
}

export default async function TripsPage() {
  const catalogueService = createCatalogueService(await createSupabaseServerClient());
  const result = await catalogueService.getPublishedTrips();

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8f4]">
      <PublicHeader />

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-10 lg:px-8 lg:pb-24 lg:pt-16">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Explore EduTrip
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-0.05em] text-emerald-950 sm:text-6xl">
            Find the next place to learn.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-950/65">
            Explore published educational trips designed to turn new places into shared stories, practical discovery, and lasting perspective.
          </p>
        </div>

        <div className="mt-14">
          {result.error ? (
            <CatalogueError />
          ) : result.data.length === 0 ? (
            <EmptyCatalogue />
          ) : (
            <>
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-950">Published trips</p>
              <p className="mt-1 text-sm text-emerald-950/55">
                    {result.data.length} {result.data.length === 1 ? "journey" : "journeys"} available
                  </p>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {result.data.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
