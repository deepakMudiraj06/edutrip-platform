import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import type { ParentDashboardData, ParentStudent, ParentTripRegistration } from "@/types/parent";
import type { RegistrationStatus } from "@/types/registration";

type ParentDashboardProps = {
  data: ParentDashboardData;
};

const STATUS_LABELS: Record<RegistrationStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(value: string): string {
  return dateFormatter.format(new Date(value.includes("T") ? value : `${value}T00:00:00Z`));
}

function statusClass(status: RegistrationStatus): string {
  return status === "CONFIRMED"
    ? "bg-lime-100 text-emerald-900"
    : status === "CANCELLED"
      ? "bg-red-100 text-red-800"
      : "bg-amber-100 text-amber-900";
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);
}

function StudentCard({ student }: { student: ParentStudent }) {
  return (
    <article className="rounded-2xl border border-emerald-950/10 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold tracking-tight text-emerald-950">{student.fullName}</h3>
      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="font-semibold text-emerald-950/45">Student number</dt>
          <dd className="mt-1 text-emerald-950">{student.studentNumber || "Not added yet"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-emerald-950/45">School</dt>
          <dd className="mt-1 text-emerald-950">{student.schoolName || "Not assigned yet"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-emerald-950/45">Grade</dt>
          <dd className="mt-1 text-emerald-950">{student.gradeLevel || "Not added yet"}</dd>
        </div>
      </dl>
    </article>
  );
}

function RegistrationCard({ registration }: { registration: ParentTripRegistration }) {
  return (
    <article className="rounded-2xl border border-emerald-950/10 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-700">{registration.studentName}</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-emerald-950">
            <Link href={`/trips/${registration.tripSlug}`} className="hover:text-emerald-700">
              {registration.tripTitle}
            </Link>
          </h3>
          <p className="mt-2 text-sm text-emerald-950/60">{registration.destinationName}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(registration.status)}`}>
          {STATUS_LABELS[registration.status]}
        </span>
      </div>
      <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-emerald-950/45">Trip dates</dt>
          <dd className="mt-1 text-emerald-950">{formatDate(registration.startDate)} - {formatDate(registration.endDate)}</dd>
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
        <p className="mt-4 text-sm font-medium text-emerald-950">Trip fee: ₹{formatPrice(registration.price)}</p>
        <p className="mt-3 text-xs leading-5 text-emerald-950/55">Payment status will appear here when the secure payment gateway is connected.</p>
      </section>
    </article>
  );
}

export function ParentDashboard({ data }: ParentDashboardProps) {
  const hasStudents = data.students.length > 0;

  return (
    <main className="min-h-screen bg-[#f7f8f4] px-5 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-950/10 pb-6">
          <div>
            <Link href="/" className="text-xl font-bold tracking-tight text-emerald-950">
              Edu<span className="text-emerald-700">Trip</span>
            </Link>
            <p className="mt-2 text-sm text-emerald-950/55">Parent workspace</p>
          </div>
          <LogoutButton />
        </header>

        <section className="mt-10 rounded-[2rem] bg-emerald-950 p-8 text-white shadow-xl shadow-emerald-950/10 sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lime-200">Parent access verified</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Parent Dashboard</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-emerald-50/70">
            Keep up with your children&apos;s student information and registered trips.
          </p>
        </section>

        <section className="mt-8" aria-labelledby="children-heading">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Family</p>
          <h2 id="children-heading" className="mt-3 text-2xl font-semibold tracking-tight text-emerald-950">My Children</h2>
          {hasStudents ? (
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              {data.students.map((student) => <StudentCard key={student.id} student={student} />)}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-emerald-950/15 bg-white p-6">
              <p className="text-sm leading-6 text-emerald-950/65">No students are linked to your parent account yet.</p>
            </div>
          )}
        </section>

        <section className="mt-10" aria-labelledby="registered-trips-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Travel plans</p>
              <h2 id="registered-trips-heading" className="mt-3 text-2xl font-semibold tracking-tight text-emerald-950">Registered Trips</h2>
            </div>
            <Link href="/trips" className="text-sm font-semibold text-emerald-800 underline decoration-emerald-800/30 underline-offset-4 hover:text-emerald-950">
              Browse trips
            </Link>
          </div>
          {!hasStudents ? null : data.registrations.length > 0 ? (
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              {data.registrations.map((registration) => <RegistrationCard key={registration.id} registration={registration} />)}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-emerald-950/15 bg-white p-6">
              <p className="text-sm leading-6 text-emerald-950/65">Your children are not registered for any trips yet.</p>
              <Link href="/trips" className="mt-4 inline-flex rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800">
                Explore trips
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export function ParentDashboardError() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8f4] px-6 py-16">
      <section className="w-full max-w-xl rounded-[2rem] border border-red-200 bg-red-50 px-6 py-12 text-center sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-700">Parent workspace unavailable</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-red-950">We could not load your dashboard.</h1>
        <p className="mt-4 text-sm leading-6 text-red-900/70">Please try again shortly. No parent or student data was changed.</p>
        <Link href="/" className="mt-8 inline-flex rounded-xl bg-emerald-900 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800">Return home</Link>
      </section>
    </main>
  );
}
