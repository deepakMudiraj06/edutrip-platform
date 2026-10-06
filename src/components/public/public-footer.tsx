import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-emerald-950/10 bg-[#f7f8f4]">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-10 text-sm text-emerald-950/55 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div>
          <Link href="/" className="font-semibold text-emerald-950">
            Edu<span className="text-emerald-700">Trip</span>
          </Link>
          <p className="mt-1">Thoughtfully organized educational journeys.</p>
          <p className="mt-3 text-xs text-emerald-950/40">© {new Date().getFullYear()} EduTrip</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/trips" className="rounded-sm hover:text-emerald-900">Explore trips</Link>
          <Link href="/login" className="rounded-sm hover:text-emerald-900">Login</Link>
          <Link href="/register" className="rounded-sm hover:text-emerald-900">Register</Link>
        </div>
      </div>
    </footer>
  );
}
