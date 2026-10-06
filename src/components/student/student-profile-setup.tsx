"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  createStudentProfileAction,
  type StudentProfileActionResult,
} from "@/app/student/actions";
import { studentProfileSchema } from "@/services/student/student.validation";

type StudentProfileSetupProps = {
  fullName: string;
};

type ProfileFields = "studentNumber" | "gradeLevel" | "schoolId";

function inputClasses(hasError = false): string {
  return `mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-emerald-950 outline-none transition focus:ring-4 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
      : "border-emerald-950/12 focus:border-emerald-700 focus:ring-emerald-700/10"
  }`;
}

function getFieldErrors(result: StudentProfileActionResult): Partial<Record<ProfileFields, string>> {
  return result.success ? {} : result.fieldErrors as Partial<Record<ProfileFields, string>>;
}

export function StudentProfileSetup({ fullName }: StudentProfileSetupProps) {
  const router = useRouter();
  const [studentNumber, setStudentNumber] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ProfileFields, string>>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setFieldErrors({});
    setErrorMessage("");
    setSuccessMessage("");

    const validation = studentProfileSchema.safeParse({
      studentNumber,
      gradeLevel,
      schoolId: null,
    });

    if (!validation.success) {
      const nextErrors: Partial<Record<ProfileFields, string>> = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0];
        if ((field === "studentNumber" || field === "gradeLevel" || field === "schoolId") && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      setErrorMessage("Check the highlighted details and try again.");
      return;
    }

    setIsSubmitting(true);
    const result = await createStudentProfileAction(validation.data);

    if (!result.success) {
      setFieldErrors(getFieldErrors(result));
      setErrorMessage(result.message);
      setIsSubmitting(false);
      return;
    }

    setSuccessMessage("Your student profile was created. Loading your dashboard...");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f7f8f4] px-5 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <header className="border-b border-emerald-950/10 pb-6">
          <p className="text-xl font-bold tracking-tight text-emerald-950">
            Edu<span className="text-emerald-700">Trip</span>
          </p>
          <p className="mt-2 text-sm text-emerald-950/55">Student workspace</p>
        </header>

        <section className="mt-10 rounded-[2rem] bg-emerald-950 p-8 text-white shadow-xl shadow-emerald-950/10 sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lime-200">One quick step</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Set up your student profile.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-emerald-50/70">
            Add your academic details, {fullName}. You can leave school unassigned until it becomes available.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="mt-8 rounded-[1.5rem] border border-emerald-950/10 bg-white p-6 shadow-sm sm:p-8" noValidate>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="text-sm font-semibold text-emerald-950">
              Student Number
              <input
                value={studentNumber}
                onChange={(event) => setStudentNumber(event.target.value)}
                className={inputClasses(Boolean(fieldErrors.studentNumber))}
                aria-invalid={Boolean(fieldErrors.studentNumber)}
                aria-describedby={fieldErrors.studentNumber ? "student-number-error" : undefined}
                autoComplete="off"
                disabled={isSubmitting}
              />
              {fieldErrors.studentNumber ? <span id="student-number-error" className="mt-2 block text-xs font-medium text-red-700">{fieldErrors.studentNumber}</span> : null}
            </label>

            <label className="text-sm font-semibold text-emerald-950">
              Grade Level
              <input
                value={gradeLevel}
                onChange={(event) => setGradeLevel(event.target.value)}
                className={inputClasses(Boolean(fieldErrors.gradeLevel))}
                aria-invalid={Boolean(fieldErrors.gradeLevel)}
                aria-describedby={fieldErrors.gradeLevel ? "grade-level-error" : undefined}
                autoComplete="off"
                disabled={isSubmitting}
              />
              {fieldErrors.gradeLevel ? <span id="grade-level-error" className="mt-2 block text-xs font-medium text-red-700">{fieldErrors.gradeLevel}</span> : null}
            </label>
          </div>

          <div className="mt-6 rounded-xl border border-dashed border-emerald-950/15 bg-emerald-50/50 px-4 py-4">
            <p className="text-sm font-semibold text-emerald-950">School (optional)</p>
            <p className="mt-1 text-sm leading-6 text-emerald-950/60">No schools are available for selection yet. You can continue without assigning one.</p>
          </div>

          {errorMessage ? <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="alert">{errorMessage}</p> : null}
          {successMessage ? <p className="mt-6 rounded-xl bg-lime-50 px-4 py-3 text-sm font-medium text-emerald-900" role="status">{successMessage}</p> : null}

          <button type="submit" disabled={isSubmitting} className="mt-8 inline-flex min-w-40 items-center justify-center rounded-xl bg-emerald-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? "Creating profile..." : "Create profile"}
          </button>
        </form>
      </div>
    </main>
  );
}
