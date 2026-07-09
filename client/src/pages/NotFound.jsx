import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-24">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">404</p>
        <h1 className="mt-3 text-4xl font-bold">Page not found</h1>
        <p className="mt-3 text-slate-600">The page you are looking for does not exist yet.</p>
        <Link to="/" className="mt-6 inline-flex rounded-2xl bg-emerald-700 px-5 py-3 font-semibold text-white">
          Go home
        </Link>
      </div>
    </div>
  );
}
