export default function BookingPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-24">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Booking flow</p>
        <h1 className="mt-3 text-3xl font-bold">Book a trusted professional</h1>
        <p className="mt-3 text-slate-600">This page will later connect to the booking API and payment flow.</p>

        <div className="mt-8 rounded-2xl border border-slate-200 p-6">
          <h2 className="text-xl font-semibold">Service request</h2>
          <div className="mt-4 space-y-4">
            <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="What do you need?" />
            <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Your location" />
            <textarea className="w-full rounded-2xl border border-slate-200 px-4 py-3" rows="4" placeholder="Describe the issue" />
            <button className="rounded-2xl bg-emerald-700 px-5 py-3 font-semibold text-white">Continue to professionals</button>
          </div>
        </div>
      </div>
    </div>
  );
}
