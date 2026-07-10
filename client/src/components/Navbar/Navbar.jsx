import { Menu, ChevronDown, MapPin, User, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = "transition hover:text-emerald-700";

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setOpen(false);
    navigate("/");
  };

  return (
    <nav className="fixed left-1/2 top-5 z-50 w-[95%] max-w-7xl -translate-x-1/2 rounded-[32px] border border-white/70 bg-white/90 px-6 py-4 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 text-xl font-extrabold text-slate-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white">S</div>
          Servora.
        </Link>

        <div className="hidden items-center gap-8 font-medium text-slate-700 md:flex">
          <NavLink to="/services" className={({ isActive }) => `${linkClass} ${isActive ? "text-emerald-700" : ""}`}>
            Find Services
          </NavLink>
          <NavLink to="/how-it-works" className={({ isActive }) => `${linkClass} ${isActive ? "text-emerald-700" : ""}`}>
            How It Works
          </NavLink>
          <NavLink to="/professionals" className={({ isActive }) => `${linkClass} ${isActive ? "text-emerald-700" : ""}`}>
            For Professionals
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `${linkClass} ${isActive ? "text-emerald-700" : ""}`}>
            About Us
          </NavLink>
          <NavLink to="/help" className={({ isActive }) => `${linkClass} ${isActive ? "text-emerald-700" : ""}`}>
            Help
          </NavLink>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            <MapPin size={16} />
            Kochi, Kerala
            <ChevronDown size={16} />
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold uppercase">
                  {user.full_name?.[0] || "U"}
                </div>
                {user.full_name?.split(" ")[0]}
                <ChevronDown size={14} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                  <div className="px-3 py-2 mb-1 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900">{user.full_name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                  </div>
                  <Link
                    to={user.roles?.professional ? "/professional/dashboard" : "/customer/dashboard"}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <User size={15} /> My Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut size={15} /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                Log in
              </Link>
              <Link to="/register" className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800">
                Sign up
              </Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="inline-flex items-center rounded-full border border-slate-200 bg-white p-3 text-slate-700 shadow-sm md:hidden">
          <Menu />
        </button>
      </div>

      {open && (
        <div className="mt-4 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-lg md:hidden">
          <Link to="/services" onClick={() => setOpen(false)} className="font-medium text-slate-700">Find Services</Link>
          <Link to="/how-it-works" onClick={() => setOpen(false)} className="font-medium text-slate-700">How It Works</Link>
          <Link to="/about" onClick={() => setOpen(false)} className="font-medium text-slate-700">About Us</Link>
          <Link to="/help" onClick={() => setOpen(false)} className="font-medium text-slate-700">Help</Link>
          <hr className="border-slate-100" />
          {user ? (
            <>
              <Link to={user.roles?.professional ? "/professional/dashboard" : "/customer/dashboard"} onClick={() => setOpen(false)} className="font-medium text-slate-700">My Dashboard</Link>
              <button onClick={handleLogout} className="text-left font-medium text-rose-600">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="rounded-full border border-slate-200 px-4 py-2 text-center font-semibold text-slate-700">Log in</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="rounded-full bg-emerald-700 px-4 py-2 text-center font-semibold text-white">Sign up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}