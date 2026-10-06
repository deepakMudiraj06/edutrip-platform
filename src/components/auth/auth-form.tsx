"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { z } from "zod";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { createAuthService } from "@/services/auth/auth.service";
import type { PublicRegistrationRole } from "@/types/auth";

type AuthFormMode = "login" | "register";

type AuthFormProps = {
  mode: AuthFormMode;
};

const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name."),
    email: z.email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .regex(/[A-Z]/, "Include at least one uppercase letter.")
      .regex(/[a-z]/, "Include at least one lowercase letter.")
      .regex(/[0-9]/, "Include at least one number."),
    confirmPassword: z.string(),
    role: z.enum(["STUDENT", "PARENT"], "Choose Student or Parent."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

function formatAuthError(message: string): string {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("already registered") ||
    normalizedMessage.includes("already exists")
  ) {
    return "An account with this email already exists. Try signing in instead.";
  }

  if (normalizedMessage.includes("invalid login credentials")) {
    return "That email and password combination is not correct.";
  }

  if (normalizedMessage.includes("email not confirmed")) {
    return "Confirm your email address before signing in.";
  }

  return "We could not complete that request. Please check your details and try again.";
}

function inputClasses(hasError = false): string {
  return `mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-emerald-950 outline-none transition placeholder:text-emerald-950/35 focus:ring-4 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
      : "border-emerald-950/12 focus:border-emerald-700 focus:ring-emerald-700/10"
  }`;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<PublicRegistrationRole>("STUDENT");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (isRegister) {
      const validation = registerSchema.safeParse({
        fullName,
        email,
        password,
        confirmPassword,
        role,
      });

      if (!validation.success) {
        setErrorMessage(validation.error.issues[0]?.message ?? "Check your details and try again.");
        return;
      }

      setIsSubmitting(true);
      const authService = createAuthService(createSupabaseBrowserClient());
      const result = await authService.signUp({
        fullName: validation.data.fullName,
        email: validation.data.email,
        password: validation.data.password,
        role: validation.data.role,
        emailRedirectTo: `${window.location.origin}/login`,
      });

      if (result.error) {
        setErrorMessage(formatAuthError(result.error.message));
        setIsSubmitting(false);
        return;
      }

      if (!result.data.session) {
        setSuccessMessage("Your account was created. Check your email to confirm your address before signing in.");
        setIsSubmitting(false);
        return;
      }

      router.replace("/");
      return;
    }

    const validation = loginSchema.safeParse({ email, password });

    if (!validation.success) {
      setErrorMessage(validation.error.issues[0]?.message ?? "Check your details and try again.");
      return;
    }

    setIsSubmitting(true);
    const authService = createAuthService(createSupabaseBrowserClient());
    const result = await authService.signIn({
      email: validation.data.email,
      password: validation.data.password,
    });

    if (result.error) {
      setErrorMessage(formatAuthError(result.error.message));
      setIsSubmitting(false);
      return;
    }

    const roleResult = await authService.getCurrentUserRole();

    if (roleResult.error) {
      await authService.signOut();
      setErrorMessage("We could not verify your account profile. Please try again.");
      setIsSubmitting(false);
      return;
    }

    // Role-based destinations will be added with protected routing. Until then,
    // send every verified session to the public foundation page.
    router.replace("/");
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
              Better journeys start here
            </p>
            <h1 className="mt-6 max-w-md text-5xl font-semibold leading-[1.02] tracking-[-0.04em]">
              {isRegister ? "A calmer way to travel together." : "Welcome back to the journey."}
            </h1>
            <p className="mt-6 max-w-sm text-base leading-7 text-emerald-50/70">
              Keep schools, students, and families connected around every educational adventure.
            </p>
          </div>
          <p className="relative text-sm text-emerald-50/45">Secure access for the EduTrip community.</p>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link href="/" className="text-xl font-bold tracking-tight text-emerald-950">
                Edu<span className="text-emerald-700">Trip</span>
              </Link>
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {isRegister ? "Create your account" : "Your account"}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-emerald-950">
              {isRegister ? "Start your next journey." : "Sign in to EduTrip."}
            </h2>
            <p className="mt-3 text-sm leading-6 text-emerald-950/60">
              {isRegister
                ? "Choose how you will use EduTrip. You can update your profile details later."
                : "Use the email address connected to your EduTrip account."}
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
              {isRegister && (
                <div>
                  <label htmlFor="fullName" className="text-sm font-medium text-emerald-950">
                    Full name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className={inputClasses()}
                    placeholder="Aarav Sharma"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="text-sm font-medium text-emerald-950">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClasses()}
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                />
              </div>

              {isRegister && (
                <div>
                  <label htmlFor="role" className="text-sm font-medium text-emerald-950">
                    Account type
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={role}
                    onChange={(event) => setRole(event.target.value as PublicRegistrationRole)}
                    className={inputClasses()}
                    disabled={isSubmitting}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="PARENT">Parent</option>
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="password" className="text-sm font-medium text-emerald-950">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={inputClasses()}
                  placeholder="At least 8 characters"
                  disabled={isSubmitting}
                />
                {isRegister && <p className="mt-2 text-xs text-emerald-950/50">Use upper and lowercase letters plus a number.</p>}
              </div>

              {isRegister && (
                <div>
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-emerald-950">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className={inputClasses()}
                    placeholder="Repeat your password"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {errorMessage && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                  {errorMessage}
                </p>
              )}
              {successMessage && (
                <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-800">
                  {successMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-emerald-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-700/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
              </button>
            </form>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-3 text-sm text-emerald-950/60">
              <span>
                {isRegister ? "Already have an account?" : "New to EduTrip?"}{" "}
                <Link href={isRegister ? "/login" : "/register"} className="font-semibold text-emerald-800 hover:text-emerald-950">
                  {isRegister ? "Sign in" : "Create an account"}
                </Link>
              </span>
              {!isRegister && (
                <Link href="/forgot-password" className="font-semibold text-emerald-800 hover:text-emerald-950">
                  Forgot password?
                </Link>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
