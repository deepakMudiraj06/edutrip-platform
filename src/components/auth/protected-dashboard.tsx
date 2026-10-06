import type { UserRole } from "@/types/auth";

import { LogoutButton } from "./logout-button";

type ProtectedDashboardProps = {
  role: UserRole;
};

export function ProtectedDashboard({ role }: ProtectedDashboardProps) {
  return (
    <main className="min-h-screen bg-[#f7f8f4] px-5 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-950/10 pb-6">
          <div>
            <p className="text-xl font-bold tracking-tight text-emerald-950">
              Edu<span className="text-emerald-700">Trip</span>
            </p>
            <p className="mt-2 text-sm text-emerald-950/55">Protected workspace</p>
          </div>
          <LogoutButton />
        </header>

        <section className="mt-12 rounded-[2rem] bg-emerald-950 p-8 text-white shadow-xl shadow-emerald-950/10 sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lime-200">
            {role} access verified
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Your {role.toLowerCase()} space is ready.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-emerald-50/70">
            This protected placeholder confirms that Supabase Auth, the database profile role, and route authorization are connected. Dashboard features will arrive in a later milestone.
          </p>
        </section>
      </div>
    </main>
  );
}
