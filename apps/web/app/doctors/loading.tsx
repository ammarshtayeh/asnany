export default function DoctorsLoading() {
  return (
    <main className="min-h-screen bg-slate-50 p-4" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="h-64 animate-pulse rounded-3xl bg-slate-200" />
        {["one", "two", "three"].map((item) => (
          <div key={item} className="h-44 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    </main>
  );
}
