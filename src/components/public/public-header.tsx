"use client";

import Link from "next/link";
import { useState } from "react";

const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "/trips", label: "Explore Trips" },
] as const;

export function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="relative z-10 border-b border-emerald-950/8 bg-[#f7f8f4]/90 backdrop-blur">
      <nav aria-label="Primary navigation" className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="rounded-sm text-xl font-bold tracking-tight text-emerald-950" onClick={closeMenu}>
            Edu<span className="text-emerald-700">Trip</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navigationLinks.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-sm text-sm font-medium text-emerald-950/65 transition hover:text-emerald-900">
                {link.label}
              </Link>
            ))}
            <Link href="/login" className="rounded-sm text-sm font-medium text-emerald-950/65 transition hover:text-emerald-900">
              Login
            </Link>
            <Link href="/register" className="rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-700/20">
              Register
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-950/12 text-emerald-950 transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-700/15 md:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-public-navigation"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span aria-hidden="true" className="text-xl leading-none">{isMenuOpen ? "×" : "☰"}</span>
          </button>
        </div>

        {isMenuOpen && (
          <div id="mobile-public-navigation" className="border-t border-emerald-950/8 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {navigationLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={closeMenu} className="rounded-xl px-3 py-3 text-sm font-medium text-emerald-950/75 hover:bg-white hover:text-emerald-900">
                  {link.label}
                </Link>
              ))}
              <Link href="/login" onClick={closeMenu} className="rounded-xl px-3 py-3 text-sm font-medium text-emerald-950/75 hover:bg-white hover:text-emerald-900">
                Login
              </Link>
              <Link href="/register" onClick={closeMenu} className="mt-1 rounded-xl bg-emerald-900 px-3 py-3 text-sm font-semibold text-white hover:bg-emerald-800">
                Register
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
