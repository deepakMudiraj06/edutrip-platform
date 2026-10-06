"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { z } from "zod";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { createAuthService } from "@/services/auth/auth.service";

type PasswordRecoveryMode = "forgot" | "reset";

type PasswordRecoveryFormProps = {
  mode: PasswordRecoveryMode;
};

const emailSchema = z.object({
  email: z.email("Enter a valid email address."),
});

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .regex(/[A-Z]/, "Include at least one uppercase letter.")
      .regex(/[a-z]/, "Include at least one lowercase letter.")
      .regex(/[0-9]/, "Include at least one number."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

function recoveryInputClasses(): string {
  return "mt-2 w-full rounded-xl border border-emerald-950/12 bg-white px-4 py-3 text-sm text-emerald-950 outline-none transition placeholder:text-emerald-950/35 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10";
}

export function PasswordRecoveryForm({ mode }: PasswordRecoveryFormProps) {
  const isForgot = mode === "forgot";
  const searchParams = useSearchParams();
  const hasRecoveryError = !isForgot && searchParams.has("error");
  const supabaseRef = useRef<SupabaseClient | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isReady, setIsReady] = useState(isForgot);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function getSupabaseClient() {
    if (!supabaseRef.current) {
      supabaseRef.current = createSupabaseBrowserClient();
    }

    return supabaseRef.current;
  }

  useEffect(() => {
    if (isForgot) {
      return;
    }

    let isActive = true;
    const supabase = getSupabaseClient();

    if (hasRecoveryError) {
      return () => {
        isActive = false;
      };
    }

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (isActive && (event === "PASSWORD_RECOVERY" || session)) {
        setIsReady(true);
      }
    });

    void supabase.auth.getSession().then(({ data: sessionData }) => {
      if (!isActive) {
        return;
      }

      if (sessionData.session) {
        setIsReady(true);
      } else {
        setErrorMessage("This password reset link is invalid or has expired. Request a new one.");
      }
    });

    return () => {
      isActive = false;
      data.subscription.unsubscribe();
    };
  }, [hasRecoveryError, isForgot]);

  async function handleForgotSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const validation = emailSchema.safeParse({ email });
    if (!validation.success) {
      setErrorMessage(validation.error.issues[0]?.message ?? "Enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    const result = await createAuthService(getSupabaseClient()).resetPassword({
      email: validation.data.email,
      redirectTo: `${window.location.origin}/auth/confirm`,
    });

    // Keep this message identical for existing and unknown email addresses.
    setSuccessMessage("If an account exists for this email, you will receive password reset instructions.");
    if (result.error) {
      setErrorMessage("");
    }
    setIsSubmitting(false);
  }

  async function handleResetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const validation = passwordSchema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      setErrorMessage(validation.error.issues[0]?.message ?? "Check your password and try again.");
      return;
    }

    setIsSubmitting(true);
    const authService = createAuthService(getSupabaseClient());
    const result = await authService.updatePassword({
      password: validation.data.password,
    });

    if (result.error) {
      setErrorMessage("We could not update your password. The reset link may be invalid or expired.");
      setIsSubmitting(false);
      return;
    }

    await authService.signOut();
    setSuccessMessage("Your password was updated successfully. You can now sign in with your new password.");
    setPassword("");
    setConfirmPassword("");
    setIsSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-[#f7f8f4] px-5 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-white shadow-2xl shadow-emerald-950/10 sm:min-h-[calc(100vh-4rem)] lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-emerald-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute -right-24 top-16 h-64 w-64 rounded-full bg-lime-300/20 blur-3xl" />
          <div className="relative">
            <Link href="/" className="text-xl font-bold tracking-tight">
              Edu<span className="text-lime-300">Trip</span>
            </Link>
            <p className="mt-20 max-w-sm text-sm font-semibold uppercase tracking-[0.22em] text-lime-200">
              Secure account recovery
            </p>
            <h1 className="mt-6 max-w-md text-5xl font-semibold leading-[1.02] tracking-[-0.04em]">
              Get back to the journey.
            </h1>
            <p className="mt-6 max-w-sm text-base leading-7 text-emerald-50/70">
              Reset your access securely. Your password is managed only by Supabase Auth.
            </p>
          </div>
          <p className="relative text-sm text-emerald-50/45">EduTrip account security.</p>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link href="/" className="text-xl font-bold tracking-tight text-emerald-950">
                Edu<span className="text-emerald-700">Trip</span>
              </Link>
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {isForgot ? "Password recovery" : "Choose a new password"}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-emerald-950">
              {isForgot ? "Forgot your password?" : "Set a new password."}
            </h2>
            <p className="mt-3 text-sm leading-6 text-emerald-950/60">
              {isForgot
                ? "Enter your email and we will send instructions if an account exists."
                : "Use a strong password you have not used elsewhere."}
            </p>

            {isForgot ? (
              <form className="mt-8 space-y-5" onSubmit={handleForgotSubmit} noValidate>
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-emerald-950">Email address</label>
                  <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={recoveryInputClasses()} placeholder="you@example.com" disabled={isSubmitting} />
                </div>
                {errorMessage && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}
                {successMessage && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-800">{successMessage}</p>}
                <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-emerald-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-700/20 disabled:cursor-not-allowed disabled:opacity-60">
                  {isSubmitting ? "Sending..." : "Send reset instructions"}
                </button>
              </form>
            ) : isReady ? (
              <form className="mt-8 space-y-5" onSubmit={handleResetSubmit} noValidate>
                <div>
                  <label htmlFor="password" className="text-sm font-medium text-emerald-950">New password</label>
                  <input id="password" name="password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className={recoveryInputClasses()} placeholder="At least 8 characters" disabled={isSubmitting} />
                  <p className="mt-2 text-xs text-emerald-950/50">Use upper and lowercase letters plus a number.</p>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-emerald-950">Confirm new password</label>
                  <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={recoveryInputClasses()} placeholder="Repeat your password" disabled={isSubmitting} />
                </div>
                {errorMessage && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}
                {successMessage && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-800">{successMessage}</p>}
                <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-emerald-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-700/20 disabled:cursor-not-allowed disabled:opacity-60">
                  {isSubmitting ? "Updating..." : "Update password"}
                </button>
              </form>
            ) : (
              <p role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                {errorMessage || (hasRecoveryError ? "This password reset link is invalid or has expired. Request a new one." : "Verifying your reset link...")}
              </p>
            )}

            <p className="mt-7 text-sm text-emerald-950/60">
              Remember your password? <Link href="/login" className="font-semibold text-emerald-800 hover:text-emerald-950">Back to sign in</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
