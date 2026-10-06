import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import type { AdminDashboardData } from "@/types/admin";
import type { TripStatus } from "@/types/catalogue";

type AdminDashboardProps = {
  data: AdminDashboardData;
};

const STATUS_LABELS: Record<TripStatus, string> = {
  DRAFT: "Draft",
  OPEN: "Open",
  FULL: "Full",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const numberFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

function formatDate(value: string): string {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

function statusClass(status: TripStatus): string {
  return status === "OPEN"
    ? "bg-lime-100 text-emerald-900"
    : status === "CANCELLED"
      ? "bg-red-100 text-red-800"
      : "bg-emerald-950/10 text-emerald-950/70";
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-emerald-950/10 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-950/45">{label}</p>
      <p className="mt-4 text-4xl font-semibold tracking-tight text-emerald-950">{value}</p>
    </article>
  );
}

export function AdminDashboard({ data }: AdminDashboardProps) {
  return (
    <main className="min-h-screen bg-[#f7f8f4] px-5 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-950/10 pb-6">
          <div>
            <Link href="/" className="text-xl font-bold tracking-tight text-emerald-950">
              Edu<span className="text-emerald-700">Trip</span>
            </Link>
            <p className="mt-2 text-sm text-emerald-950/55">Admin workspace</p>
          </div>
          <LogoutButton />
        </header>

        <section className="mt-10 rounded-[2rem] bg-emerald-950 p-8 text-white shadow-xl shadow-emerald-950/10 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lime-200">Admin access verified</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Trip operations overview</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50/70">
            A read-only view of the current EduTrip catalogue, students, and registrations.
          </p>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Platform metrics">
          <MetricCard label="Total trips" value={data.trips.length} />
          <MetricCard label="Published / open trips" value={data.publishedOpenTrips} />
          <MetricCard label="Total students" value={data.totalStudents} />
          <MetricCard label="Total registrations" value={data.totalRegistrations} />
        </section>

        <section className="mt-8 rounded-2xl border border-emerald-950/10 bg-white shadow-sm" aria-labelledby="trips-heading">
          <div className="border-b border-emerald-950/10 px-6 py-5 sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Catalogue</p>
            <h2 id="trips-heading" className="mt-2 text-2xl font-semibold tracking-tight text-emerald-950">Trips</h2>
          </div>

          {data.trips.length === 0 ? (
            <p className="px-6 py-10 text-sm text-emerald-950/60 sm:px-8">No trips have been created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <caption className="sr-only">All trips and their current registration counts</caption>
                <thead className="border-b border-emerald-950/10 bg-emerald-50/50 text-xs uppercase tracking-[0.12em] text-emerald-950/50">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-semibold sm:px-8">Trip</th>
                    <th scope="col" className="px-4 py-4 font-semibold">Dates</th>
                    <th scope="col" className="px-4 py-4 font-semibold">Status</th>
                    <th scope="col" className="px-4 py-4 font-semibold">Capacity</th>
                    <th scope="col" className="px-4 py-4 font-semibold">Price</th>
                    <th scope="col" className="px-4 py-4 font-semibold">Registrations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-950/10">
                  {data.trips.map((trip) => (
                    <tr key={trip.id} className="align-top">
                      <th scope="row" className="px-6 py-5 font-medium sm:px-8">
                        <Link href={`/trips/${trip.slug}`} className="font-semibold text-emerald-950 hover:text-emerald-700">
                          {trip.title}
                        </Link>
                        <span className="mt-1 block font-normal text-emerald-950/55">
                          {trip.destination?.name ?? "Destination unavailable"}
                        </span>
                      </th>
                      <td className="whitespace-nowrap px-4 py-5 text-emerald-950/70">
                        {formatDate(trip.startDate)}<br />{formatDate(trip.endDate)}
                      </td>
                      <td className="px-4 py-5">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(trip.status)}`}>
                          {STATUS_LABELS[trip.status]}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-emerald-950/70">{trip.capacity}</td>
                      <td className="px-4 py-5 text-emerald-950/70">{numberFormatter.format(trip.price)}</td>
                      <td className="px-4 py-5 font-medium text-emerald-950">{data.registrationCounts[trip.id] ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export function AdminDashboardError() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8f4] px-6 py-16">
      <section className="w-full max-w-xl rounded-[2rem] border border-red-200 bg-red-50 px-6 py-12 text-center sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-700">Admin workspace unavailable</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-red-950">We could not load the dashboard.</h1>
        <p className="mt-4 text-sm leading-6 text-red-900/70">Please try again shortly. No data was changed.</p>
        <Link href="/" className="mt-8 inline-flex rounded-xl bg-emerald-900 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800">Return home</Link>
      </section>
    </main>
  );
}
