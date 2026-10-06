"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { createAuthService } from "@/services/auth/auth.service";

export function LogoutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSignOut() {
    setErrorMessage("");
    setIsSigningOut(true);
    const result = await createAuthService(
      createSupabaseBrowserClient(),
    ).signOut();

    if (result.error) {
      setErrorMessage("We could not sign you out. Please try again.");
      setIsSigningOut(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      {errorMessage && <p role="alert" className="text-xs text-red-700">{errorMessage}</p>}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="rounded-xl border border-emerald-950/15 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-950 transition hover:border-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSigningOut ? "Signing out..." : "Sign out"}
      </button>
    </div>
  );
}
