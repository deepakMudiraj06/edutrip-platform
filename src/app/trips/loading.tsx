export default function TripsLoading() {
  return (
    <main className="min-h-screen bg-[#f7f8f4] px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="h-4 w-32 animate-pulse rounded-full bg-emerald-950/10" />
        <div className="mt-6 h-16 max-w-xl animate-pulse rounded-2xl bg-emerald-950/10" />
        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {["one", "two", "three"].map((card) => (
            <div key={card} className="h-96 animate-pulse rounded-[1.5rem] bg-white shadow-sm" />
          ))}
        </div>
      </div>
    </main>
  );
}
