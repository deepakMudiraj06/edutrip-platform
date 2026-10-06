import Link from "next/link";

import type { Trip } from "@/types/catalogue";

type TripCardProps = {
  trip: Trip;
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

function statusClass(status: Trip["status"]): string {
  return status === "OPEN"
    ? "border-lime-200/30 bg-lime-200/15 text-lime-200"
    : status === "CANCELLED"
      ? "border-red-200/30 bg-red-200/15 text-red-100"
      : "border-white/15 bg-white/10 text-emerald-50/75";
}

export function TripCard({ trip }: TripCardProps) {
  const destinationLabel = trip.destination
    ? [trip.destination.name, trip.destination.country].filter(Boolean).join(", ")
    : "Destination details unavailable";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-emerald-950/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/10">
      <div className="relative overflow-hidden bg-emerald-950 px-6 pb-7 pt-6 text-white">
        <div className="absolute -right-8 -top-12 h-32 w-32 rounded-full bg-lime-300/20 blur-2xl transition duration-300 group-hover:bg-lime-300/30" />
        <div className="relative flex items-start justify-between gap-4">
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusClass(trip.status)}`}>
            {formatStatus(trip.status)}
          </span>
          <span className="text-right text-xs text-emerald-50/60">{trip.capacity} places</span>
        </div>
        <p className="relative mt-8 text-sm text-emerald-50/65">{destinationLabel}</p>
        <h2 className="relative mt-2 text-2xl font-semibold leading-tight tracking-[-0.03em]">
          {trip.title}
        </h2>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="line-clamp-3 text-sm leading-6 text-emerald-950/65">
          {trip.description || "Trip description not provided."}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-emerald-950/10 py-5 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-emerald-950/45">Dates</dt>
            <dd className="mt-1 font-medium text-emerald-950">
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-emerald-950/45">Listed price</dt>
            <dd className="mt-1 font-medium text-emerald-950">{numberFormatter.format(trip.price)}</dd>
          </div>
        </dl>

        <Link
          href={`/trips/${trip.slug}`}
          className="mt-6 inline-flex items-center justify-between rounded-xl border border-emerald-950/15 px-4 py-3 text-sm font-semibold text-emerald-900 transition hover:border-emerald-700 hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-700/15"
        >
          View trip details
          <span aria-hidden="true" className="text-lg transition-transform group-hover:translate-x-1">
            -&gt;
          </span>
        </Link>
      </div>
    </article>
  );
}
