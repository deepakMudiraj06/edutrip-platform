import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { MyTripCard } from "@/components/registration/my-trip-card";
import type { MyTripRegistration } from "@/types/registration";
import type { StudentDashboardData } from "@/types/student";

type StudentDashboardProps = {
  data: StudentDashboardData;
  registrations: MyTripRegistration[] | null;
  registrationsError: boolean;
};

function DetailItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-950/45">{label}</dt>
      <dd className="mt-2 text-sm font-medium text-emerald-950">{value || "Not added yet"}</dd>
    </div>
  );
}

export function StudentDashboard({ data, registrations, registrationsError }: StudentDashboardProps) {
  const { profile, student } = data;

  return (
    <main className="min-h-screen bg-[#f7f8f4] px-5 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-950/10 pb-6">
          <div>
            <Link href="/" className="text-xl font-bold tracking-tight text-emerald-950">
              Edu<span className="text-emerald-700">Trip</span>
            </Link>
            <p className="mt-2 text-sm text-emerald-950/55">Student workspace</p>
          </div>
          <LogoutButton />
        </header>

        <section className="mt-10 rounded-[2rem] bg-emerald-950 p-8 text-white shadow-xl shadow-emerald-950/10 sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lime-200">Student access verified</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Welcome back, {profile.fullName}.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-emerald-50/70">
            Review your profile, school details, and registered journeys in one place.
          </p>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2" aria-label="Student information">
          <article className="rounded-[1.5rem] border border-emerald-950/10 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Profile summary</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-emerald-950">Your details</h2>
            <dl className="mt-7 grid gap-6 sm:grid-cols-2">
              <DetailItem label="Full name" value={profile.fullName} />
              <DetailItem label="Phone" value={profile.phone} />
            </dl>
          </article>

          {student ? (
            <article className="rounded-[1.5rem] border border-emerald-950/10 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Academic profile</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-emerald-950">Student information</h2>
              <dl className="mt-7 grid gap-6 sm:grid-cols-2">
                <DetailItem label="Student number" value={student.studentNumber} />
                <DetailItem label="Grade level" value={student.gradeLevel} />
              </dl>
            </article>
          ) : (
            <article className="rounded-[1.5rem] border border-dashed border-emerald-950/20 bg-white/70 p-6 shadow-sm sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Academic profile</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-emerald-950">Still being set up</h2>
              <p className="mt-4 text-sm leading-6 text-emerald-950/60">
                Your account is ready, but the student record has not been created yet. Your school can complete this information later.
              </p>
            </article>
          )}
        </section>

        <section className="mt-6 rounded-[1.5rem] border border-emerald-950/10 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="school-heading">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">School</p>
          <h2 id="school-heading" className="mt-3 text-2xl font-semibold tracking-tight text-emerald-950">
            {student?.school?.name || "School details not assigned yet"}
          </h2>
          {student?.school ? (
            <dl className="mt-6 grid gap-6 text-sm sm:grid-cols-2">
              <DetailItem label="School code" value={student.school.code} />
              <DetailItem label="Address" value={student.school.address} />
            </dl>
          ) : (
            <p className="mt-4 text-sm leading-6 text-emerald-950/60">
              School information will appear when your student record is linked to a school.
            </p>
          )}
        </section>

        <section className="mt-6" aria-labelledby="my-trips-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Your journeys</p>
              <h2 id="my-trips-heading" className="mt-3 text-2xl font-semibold tracking-tight text-emerald-950">My Trips</h2>
            </div>
            <Link href="/trips" className="text-sm font-semibold text-emerald-800 underline decoration-emerald-800/30 underline-offset-4 hover:text-emerald-950">
              Browse all trips
            </Link>
          </div>

          {registrationsError ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-900" role="alert">
              We could not load your trips right now. Please try again shortly.
            </div>
          ) : registrations?.length ? (
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              {registrations.map((registration) => <MyTripCard key={registration.id} registration={registration} />)}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-emerald-950/15 bg-white p-6">
              <p className="text-sm leading-6 text-emerald-950/65">You haven&apos;t registered for any trips yet.</p>
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

export function StudentDashboardError() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8f4] px-6 py-16">
      <section className="w-full max-w-xl rounded-[2rem] border border-red-200 bg-red-50 px-6 py-12 text-center sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-700">Student workspace unavailable</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-red-950">We could not load your profile.</h1>
        <p className="mt-4 text-sm leading-6 text-red-900/70">Please try again shortly. No student data was changed.</p>
        <Link href="/" className="mt-8 inline-flex rounded-xl bg-emerald-900 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800">Return home</Link>
      </section>
    </main>
  );
}

export function StudentDashboardLoading() {
  return (
    <main className="min-h-screen bg-[#f7f8f4] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="h-10 w-36 animate-pulse rounded-xl bg-emerald-950/10" />
        <div className="mt-10 h-56 animate-pulse rounded-[2rem] bg-emerald-950/10" />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="h-56 animate-pulse rounded-[1.5rem] bg-white" />
          <div className="h-56 animate-pulse rounded-[1.5rem] bg-white" />
        </div>
      </div>
    </main>
  );
}
