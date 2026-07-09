import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Phone, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { loginUser } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const returnTo = location.state?.returnTo;

  const [form, setForm] = useState({ phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.phone || !form.password) {
      setError("Please enter both phone number and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser(form);
      if (res.success) {
        login(res.user, res.token);
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          if (returnTo) {
            navigate(returnTo);
          } else if (res.user.role === "professional") {
            navigate("/professional/dashboard");
          } else {
            navigate("/customer/dashboard");
          }
        }, 800);
      } else {
        setError(res.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-slate-50 to-slate-100 px-6 py-24">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-[32px] bg-white p-8 shadow-[0_25px_80px_rgba(15,23,42,0.12)]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white font-bold text-lg">W</div>
            <span className="text-xl font-extrabold text-slate-900">Worksy.</span>
          </Link>

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Welcome back</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-950">Log in to your account</h1>
          <p className="mt-2 text-sm text-slate-500">Access your dashboard and manage your bookings.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {/* Phone */}
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="login-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone number"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                <AlertCircle size={16} className="shrink-0" /> {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 size={16} className="shrink-0" /> {success}
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-emerald-700 py-3.5 font-bold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Continue"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            New here?{" "}
            <Link to="/register" state={{ returnTo }} className="font-semibold text-emerald-700 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
