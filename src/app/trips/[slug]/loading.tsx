export default function TripDetailLoading() {
  return (
    <main className="min-h-screen bg-[#f7f8f4] px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="h-4 w-32 animate-pulse rounded-full bg-emerald-950/10" />
        <div className="mt-12 h-20 max-w-3xl animate-pulse rounded-2xl bg-emerald-950/10" />
        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-4">
            {["one", "two", "three"].map((card) => (
              <div key={card} className="h-36 animate-pulse rounded-[1.5rem] bg-white shadow-sm" />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-[1.5rem] bg-white shadow-sm" />
        </div>
      </div>
    </main>
  );
}
