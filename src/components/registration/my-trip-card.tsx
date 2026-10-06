import Link from "next/link";

import type { MyTripRegistration, RegistrationStatus } from "@/types/registration";

type MyTripCardProps = {
  registration: MyTripRegistration;
};

const STATUS_LABELS: Record<RegistrationStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function MyTripCard({ registration }: MyTripCardProps) {
  const { trip } = registration;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-emerald-950/10 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-700">{trip.destination.name}</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-emerald-950">{trip.title}</h3>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-lime-200">
          {STATUS_LABELS[registration.status]}
        </span>
      </div>

      <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-emerald-950/45">Trip dates</dt>
          <dd className="mt-1 text-emerald-950">{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-emerald-950/45">Price</dt>
          <dd className="mt-1 text-emerald-950">{formatPrice(trip.price)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-emerald-950/45">Registered</dt>
          <dd className="mt-1 text-emerald-950">{formatDate(registration.registeredAt)}</dd>
        </div>
      </dl>

      <section className="mt-6 rounded-xl border border-dashed border-emerald-900/20 bg-emerald-50/60 p-4" aria-label="Trip payment">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Trip Payment</p>
            <p className="mt-2 text-sm text-emerald-950/65">Payment integration coming soon</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-950/60">Not available yet</span>
        </div>
        <p className="mt-4 text-sm font-medium text-emerald-950">Trip fee: ₹{formatPrice(trip.price)}</p>
        <button type="button" disabled className="mt-4 cursor-not-allowed rounded-xl border border-emerald-900/15 px-4 py-2 text-sm font-semibold text-emerald-950/45">
          Payments coming soon
        </button>
      </section>

      <Link
        href={`/trips/${trip.slug}`}
        className="mt-6 inline-flex w-fit rounded-xl border border-emerald-900/20 px-4 py-2.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
      >
        View trip
      </Link>
    </article>
  );
}
