export default function DoctorsLoading() {
  return (
    <main className="min-h-screen animate-fade-in bg-transparent p-4" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="h-64 animate-pulse rounded-3xl bg-slate-200/80" />
        {["one", "two", "three"].map((item) => (
          <div key={item} className="h-44 animate-pulse bento-card" />
        ))}
      </div>
    </main>
  );
}
