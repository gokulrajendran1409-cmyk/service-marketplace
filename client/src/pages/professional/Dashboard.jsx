export default function ProfessionalDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Professional dashboard</p>
          <h1 className="mt-3 text-3xl font-bold">Grow your service business</h1>
          <p className="mt-3 max-w-2xl text-slate-600">This area will eventually cover profile management, job requests, bookings, and reviews.</p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-5">
              <h2 className="font-semibold">Nearby requests</h2>
              <p className="mt-2 text-sm text-slate-600">4 new requests</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <h2 className="font-semibold">Bookings this week</h2>
              <p className="mt-2 text-sm text-slate-600">8 confirmed jobs</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <h2 className="font-semibold">Rating</h2>
              <p className="mt-2 text-sm text-slate-600">4.9 / 5 from 126 reviews</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
