import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-24">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Welcome back</p>
        <h1 className="mt-3 text-3xl font-bold">Log in to SERVIX</h1>
        <p className="mt-3 text-sm text-slate-600">Access your dashboard and manage bookings with trusted local professionals.</p>

        <form className="mt-8 space-y-4">
          <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Phone number" />
          <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Password" type="password" />
          <button className="w-full rounded-2xl bg-emerald-700 px-4 py-3 font-semibold text-white">Continue</button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          New here? <Link to="/register" className="font-semibold text-emerald-700">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
