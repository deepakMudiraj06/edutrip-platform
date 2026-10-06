import Link from "next/link";

export default function TripNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8f4] px-6 py-16">
      <section className="w-full max-w-xl rounded-[2rem] border border-emerald-950/10 bg-white px-6 py-14 text-center shadow-sm sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Trip not found</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-emerald-950">
          That journey is not available.
        </h1>
        <p className="mt-4 text-sm leading-6 text-emerald-950/60">
          It may be unpublished, removed, or the link may be incorrect.
        </p>
        <Link href="/trips" className="mt-8 inline-flex rounded-xl bg-emerald-900 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800">
          Browse published trips
        </Link>
      </section>
    </main>
  );
}
