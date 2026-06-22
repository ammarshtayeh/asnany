export default function BookingLoading() {
  return (
    <main className="min-h-screen animate-fade-in bg-transparent p-4" dir="rtl">
      <section className="mx-auto max-w-5xl space-y-5 pt-12">
        <div className="h-56 animate-pulse rounded-3xl bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-2">
          {["one", "two", "three", "four"].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-3xl bg-white" />
      </section>
    </main>
  );
}
