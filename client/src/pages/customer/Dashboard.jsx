export default function CustomerDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Customer dashboard</p>
          <h1 className="mt-3 text-3xl font-bold">Manage your service requests</h1>
          <p className="mt-3 max-w-2xl text-slate-600">This dashboard is the first step toward booking flow, request tracking, and service history.</p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-5">
              <h2 className="font-semibold">Open requests</h2>
              <p className="mt-2 text-sm text-slate-600">2 active requests</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <h2 className="font-semibold">Upcoming bookings</h2>
              <p className="mt-2 text-sm text-slate-600">1 confirmed booking</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <h2 className="font-semibold">Saved providers</h2>
              <p className="mt-2 text-sm text-slate-600">5 trusted professionals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
