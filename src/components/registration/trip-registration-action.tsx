"use client";

import Link from "next/link";
import { useState } from "react";

import { registerForTripAction } from "@/app/trips/[slug]/actions";
import type { TripStatus } from "@/types/catalogue";
import type {
  RegistrationErrorCode,
  RegistrationStatus,
  TripRegistration,
} from "@/types/registration";
import type { UserRole } from "@/types/auth";

type TripRegistrationActionProps = {
  tripId: string;
  tripStatus: TripStatus;
  viewerRole: UserRole | null;
  initialRegistration: TripRegistration | null;
};

const ERROR_MESSAGES: Record<RegistrationErrorCode, string> = {
  invalid_trip_id: "This trip cannot be registered for.",
  unauthenticated: "Sign in as a student to register for this trip.",
  not_student: "Only student accounts can register for trips.",
  student_profile_missing: "Complete your student profile before registering.",
  trip_not_found: "This trip is no longer available.",
  trip_not_published: "This trip is not available for registration.",
  trip_not_open: "This trip is not open for registration.",
  registration_deadline_passed: "Registration for this trip has closed.",
  already_registered: "You are already registered for this trip.",
  trip_full: "This trip has reached capacity.",
  registration_failed: "We could not complete registration. Please try again.",
};

function statusLabel(status: RegistrationStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function TripRegistrationAction({
  tripId,
  tripStatus,
  viewerRole,
  initialRegistration,
}: TripRegistrationActionProps) {
  const [registration, setRegistration] = useState(initialRegistration);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorCode, setErrorCode] = useState<RegistrationErrorCode | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  async function handleRegister() {
    if (isSubmitting || registration?.status === "PENDING" || registration?.status === "CONFIRMED") {
      return;
    }

    setErrorCode(null);
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const result = await registerForTripAction(tripId);

      if (!result.success) {
        setErrorCode(result.code);
        return;
      }

      setRegistration(result.registration);
      setSuccessMessage("You are registered with PENDING status.");
    } catch {
      setErrorCode("registration_failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!viewerRole) {
    return (
      <section className="mt-8 rounded-2xl border border-emerald-900/10 bg-emerald-50/70 p-5" aria-labelledby="registration-heading">
        <p id="registration-heading" className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Ready to join?</p>
        <p className="mt-2 text-sm leading-6 text-emerald-950/65">Sign in with a student account to register for this trip.</p>
        <Link href="/login" className="mt-4 inline-flex rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800">
          Login to register
        </Link>
      </section>
    );
  }

  if (viewerRole !== "STUDENT") {
    return (
      <section className="mt-8 rounded-2xl border border-emerald-900/10 bg-emerald-50/70 p-5" aria-labelledby="registration-heading">
        <p id="registration-heading" className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Trip registration</p>
        <p className="mt-2 text-sm leading-6 text-emerald-950/65">Trip registration is available to student accounts.</p>
      </section>
    );
  }

  const hasActiveRegistration = registration?.status === "PENDING" || registration?.status === "CONFIRMED";
  const unavailable = tripStatus !== "OPEN" && !hasActiveRegistration;

  return (
    <section className="mt-8 rounded-2xl border border-emerald-900/10 bg-emerald-50/70 p-5" aria-labelledby="registration-heading">
      <p id="registration-heading" className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Trip registration</p>

      {hasActiveRegistration ? (
        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="text-sm leading-6 text-emerald-950/70">Your registration is currently <span className="font-semibold text-emerald-950">{statusLabel(registration.status)}</span>.</p>
          <span className="shrink-0 rounded-full bg-emerald-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-lime-200">{registration.status}</span>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm leading-6 text-emerald-950/65">
            {registration?.status === "CANCELLED" ? "Your previous registration was cancelled. You may register again." : "Submit a registration request for this trip."}
          </p>
          {unavailable ? (
            <p className="mt-4 text-sm font-semibold text-emerald-950/60">Registration is not currently available.</p>
          ) : (
            <button type="button" onClick={handleRegister} disabled={isSubmitting} className="mt-4 inline-flex min-w-36 items-center justify-center rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Registering..." : "Register for trip"}
            </button>
          )}
        </>
      )}

      {successMessage ? <p className="mt-4 text-sm font-medium text-emerald-800" role="status">{successMessage}</p> : null}
      {errorCode ? <p className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-800" role="alert">{ERROR_MESSAGES[errorCode]}</p> : null}
    </section>
  );
}
