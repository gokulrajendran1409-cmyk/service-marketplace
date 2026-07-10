import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Phone, Lock, Briefcase } from "lucide-react";
import { loginUser } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

export default function ProfessionalLogin() {
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
        if (res.user.role !== "professional") {
          setError("This portal is only for registered professionals.");
          setLoading(false);
          return;
        }

        login(res.user, res.token);
        setSuccess("Login successful! Redirecting to dashboard...");
        setTimeout(() => {
          if (returnTo) {
            navigate(returnTo);
          } else {
            navigate("/professional/dashboard");
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
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-6 py-24">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-[32px] bg-slate-800 p-8 shadow-2xl border border-slate-700 text-white">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 font-bold text-lg">S</div>
            <span className="text-xl font-extrabold text-white">Servora.</span>
          </Link>

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400 flex items-center gap-2"><Briefcase size={16} /> Business Portal</p>
          <h1 className="mt-2 text-3xl font-extrabold text-white">Professional Login</h1>
          <p className="mt-2 text-sm text-slate-400">Manage your business, view leads, and track earnings.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {/* Phone */}
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="login-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone number"
                className="w-full rounded-2xl border border-slate-600 bg-slate-900 py-3.5 pl-12 pr-4 text-white placeholder-slate-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full rounded-2xl border border-slate-600 bg-slate-900 py-3.5 pl-12 pr-12 text-white placeholder-slate-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && <p className="text-sm font-semibold text-rose-400 bg-rose-900/30 p-3 rounded-xl border border-rose-800/50">{error}</p>}
            {success && <p className="text-sm font-semibold text-emerald-400 bg-emerald-900/30 p-3 rounded-xl border border-emerald-800/50">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50 shadow-lg shadow-emerald-900/50"
            >
              {loading ? "Authenticating..." : "Login to Dashboard"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            Not registered yet?{" "}
            <Link to="/professional/register" className="font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4">
              Apply as a Professional
            </Link>
          </p>
        </div>
        
        <p className="mt-8 text-center text-sm text-slate-500">
          Looking for customer login? <Link to="/login" className="text-slate-400 hover:text-white underline">Click here</Link>
        </p>
      </div>
    </div>
  );
}
