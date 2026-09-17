export default function AppLoading() {
  return (
    <div className="h-full overflow-auto px-8 py-6">
      <div className="mb-6">
        <div className="h-7 w-40 animate-pulse rounded-md bg-zinc-200" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded-md bg-zinc-100" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="h-5 w-28 animate-pulse rounded-md bg-zinc-200" />
        <div className="h-4 w-16 animate-pulse rounded-md bg-zinc-100" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-xl bg-zinc-50 px-3 py-3">
            <div className="h-3 w-14 animate-pulse rounded bg-zinc-200" />
            <div className="mt-2 h-7 w-10 animate-pulse rounded bg-zinc-200" />
          </div>
        ))}
      </div>
    </section>
  );
}
