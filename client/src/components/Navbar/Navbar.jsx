import { Menu, ChevronDown, MapPin } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkClass = "transition hover:text-emerald-700";

  return (
    <nav className="fixed left-1/2 top-5 z-50 w-[95%] max-w-7xl -translate-x-1/2 rounded-[32px] border border-white/70 bg-white/90 px-6 py-4 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 text-xl font-extrabold text-slate-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white">W</div>
          Worksy.
        </Link>

        <div className="hidden items-center gap-8 font-medium text-slate-700 md:flex">
          <NavLink to="/services" className={({ isActive }) => `${linkClass} ${isActive ? "text-emerald-700" : ""}`}>
            Find Services
          </NavLink>
          <NavLink to="/register" className={({ isActive }) => `${linkClass} ${isActive ? "text-emerald-700" : ""}`}>
            Become a Pro
          </NavLink>
          <a href="#how-it-works" className={linkClass}>How It Works</a>
          <a href="#about" className={linkClass}>About Us</a>
          <a href="#help" className={linkClass}>Help</a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            <MapPin size={16} />
            Kochi, Kerala
            <ChevronDown size={16} />
          </button>
          <Link to="/login" className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            Log in
          </Link>
          <Link to="/register" className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800">
            Sign up
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="inline-flex items-center rounded-full border border-slate-200 bg-white p-3 text-slate-700 shadow-sm md:hidden">
          <Menu />
        </button>
      </div>

      {open && (
        <div className="mt-4 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-lg md:hidden">
          <Link to="/services" onClick={() => setOpen(false)} className="font-medium text-slate-700">Find Services</Link>
          <Link to="/register" className="font-medium text-slate-700">Become a Pro</Link>
          <a href="#how-it-works" className="font-medium text-slate-700">How It Works</a>
          <a href="#about" className="font-medium text-slate-700">About Us</a>
          <a href="#help" className="font-medium text-slate-700">Help</a>
          <Link to="/login" className="rounded-full border border-slate-200 px-4 py-2 text-center font-semibold text-slate-700">Log in</Link>
          <Link to="/register" className="rounded-full bg-emerald-700 px-4 py-2 text-center font-semibold text-white">Sign up</Link>
        </div>
      )}
    </nav>
  );
}