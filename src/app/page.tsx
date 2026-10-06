import Link from "next/link";
import type { Metadata } from "next";

import { TripCard } from "@/components/catalogue/trip-card";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createCatalogueService } from "@/services/catalogue/catalogue.service";

export const metadata: Metadata = {
  title: "Educational trips, thoughtfully organized",
  description: "EduTrip helps students, parents, and schools discover and manage educational trips.",
};

export default async function Home() {
  const catalogueService = createCatalogueService(await createSupabaseServerClient());
  const tripsResult = await catalogueService.getPublishedTrips();
  const featuredTrip = tripsResult.error ? null : tripsResult.data[0] ?? null;

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8f4]">
      <PublicHeader />

      <section className="mx-auto grid max-w-6xl gap-14 px-6 pb-24 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:pt-24">
        <div>
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Learning beyond the classroom
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-emerald-950 sm:text-7xl">
            Educational trips, simplified.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-emerald-950/65">
            EduTrip brings schools, students, and parents together around
            organized educational travel, clear trip information, and simple
            registration.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/trips" className="rounded-full bg-emerald-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-700/20">
              Explore Trips
            </Link>
            <span className="rounded-full border border-emerald-900/15 bg-white/60 px-5 py-3 text-sm font-medium text-emerald-950">
              Built for school communities
            </span>
          </div>
        </div>

        <div className="relative rounded-[2rem] bg-emerald-950 p-8 text-white shadow-2xl shadow-emerald-950/15 sm:p-10">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-lime-300/80 blur-2xl" />
          <p className="relative text-sm font-semibold uppercase tracking-[0.16em] text-lime-200">A clearer journey</p>
          <p className="relative mt-5 text-3xl font-semibold leading-tight">
            One calm command center for every school adventure.
          </p>
          <div className="relative mt-10 grid gap-3 text-sm text-emerald-50/75 sm:grid-cols-2">
            {[
              "Explore published trips",
              "Register securely",
              "Keep families informed",
              "Support school operations",
            ].map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-4">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {featuredTrip && (
        <section className="mx-auto max-w-6xl px-6 pb-24 lg:px-8" aria-labelledby="featured-trip-heading">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Featured journey</p>
              <h2 id="featured-trip-heading" className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-emerald-950">
                A real trip, ready to explore.
              </h2>
            </div>
            <Link href="/trips" className="text-sm font-semibold text-emerald-800 hover:text-emerald-950">View all trips -&gt;</Link>
          </div>
          <div className="max-w-md">
            <TripCard trip={featuredTrip} />
          </div>
        </section>
      )}

      <section className="border-y border-emerald-950/10 bg-white/55" aria-labelledby="platform-capabilities-heading">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">One shared experience</p>
            <h2 id="platform-capabilities-heading" className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-emerald-950 sm:text-4xl">
              Designed around the people who make every trip happen.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["Students", "Explore educational trips, register securely, and keep track of the journeys you have joined."],
              ["Parents", "View linked children and stay close to their registered trips and travel details."],
              ["Administrators", "Review the trip catalogue, student totals, and registration activity in one place."],
            ].map(([title, description]) => (
              <article key={title} className="rounded-2xl border border-emerald-950/10 bg-[#f7f8f4] p-6">
                <h3 className="text-xl font-semibold text-emerald-950">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-emerald-950/60">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
