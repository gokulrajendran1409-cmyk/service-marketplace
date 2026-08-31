import { useEffect, useRef, useState } from 'react';
import {
  Loader2, ShieldCheck, Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight,
} from 'lucide-react';
import { useToast, Toast } from '../components/Toast';

const AUTH_API = `${import.meta.env.DEV ? 'http://localhost:5000' : 'https://service-marketplace-af7p.onrender.com'}/api/auth`;
const GOOGLE_CLIENT_ID = '215103121223-i90tgh8pdlcug4ft1ij78i67h5go75es.apps.googleusercontent.com';
let googleScriptPromise;
let googleInitialized = false;

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener('load', resolve, { once: true });
      existingScript.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login');      // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { toast, showToast } = useToast();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', phone: '', password: '' });

  const googleButtonRef = useRef(null);
  const onLoginRef = useRef(onLogin);
  const showToastRef = useRef(showToast);

  const isLogin = mode === 'login';

  useEffect(() => {
    onLoginRef.current = onLogin;
    showToastRef.current = showToast;
  }, [onLogin, showToast]);

  // Google button is rendered once into a div that's always mounted
  // (outside the conditional login/register blocks), so it survives mode switches.
  useEffect(() => {
    let cancelled = false;
    const googleButton = googleButtonRef.current;

    const renderGoogleButton = () => {
      if (!googleButtonRef.current || !window.google?.accounts?.id) return;
      if (!googleInitialized) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            setLoading(true);
            try {
              const result = await fetch(`${AUTH_API}/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: response.credential }),
              });
              const data = await result.json();
              if (!result.ok) throw new Error(data.message || 'Google authentication failed');
              onLoginRef.current(data.user, data.token);
            } catch (error) {
              showToastRef.current(error.message, 'error');
            } finally {
              setLoading(false);
            }
          },
        });
        googleInitialized = true;
      }
      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        width: 360,
      });
    };

    loadGoogleScript()
      .then(() => {
        if (!cancelled) renderGoogleButton();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (googleButton) googleButton.innerHTML = '';
    };
  }, []);

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      showToast('Please enter email and password', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${AUTH_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      onLogin(data.user, data.token);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── REGISTER ───────────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regForm.name || !regForm.email || !regForm.phone || !regForm.password) {
      showToast('All fields are required', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${AUTH_API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      onLogin(data.user, data.token);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF0] flex flex-col items-center justify-center px-6 py-10 font-['Inter',sans-serif]">

      {/* Logo / Brand */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-[#2E7D32] rounded-[20px] flex items-center justify-center mb-4 shadow-[0_8px_20px_rgba(46,125,50,0.3)]">
          <ShieldCheck size={32} color="white" strokeWidth={2} />
        </div>
        <h1 className="text-[28px] font-bold text-[#0A3D0A] tracking-[-0.02em]">Seva</h1>
        <p className="text-[13px] font-medium text-gray-500 mt-1">Trusted home services near you</p>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-white border border-gray-100 rounded-[16px] p-1 mb-6 w-full max-w-[340px] shadow-sm">
        {['login', 'register'].map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2.5 rounded-[12px] text-[14px] font-bold transition-all capitalize ${
              mode === m ? 'bg-[#2E7D32] text-white shadow-sm' : 'text-gray-500'
            }`}>
            {m === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        ))}
      </div>

      {/* ── LOGIN FORM ── */}
      {isLogin && (
        <form onSubmit={handleLogin} className="w-full max-w-[340px] flex flex-col gap-4">
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Email Address</label>
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-[14px] px-4 py-3.5 focus-within:border-[#2E7D32] transition-colors">
              <Mail size={17} className="text-gray-400 shrink-0" />
              <input
                type="email"
                value={loginForm.email}
                onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                required
                className="flex-1 outline-none bg-transparent text-[14px] font-medium text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Password</label>
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-[14px] px-4 py-3.5 focus-within:border-[#2E7D32] transition-colors">
              <Lock size={17} className="text-gray-400 shrink-0" />
              <input
                type={showPass ? 'text' : 'password'}
                value={loginForm.password}
                onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Your password"
                required
                className="flex-1 outline-none bg-transparent text-[14px] font-medium text-gray-800 placeholder-gray-400"
              />
              <button type="button" onClick={() => setShowPass(v => !v)} className="text-gray-400">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-[#FF7A00] text-white rounded-[16px] text-[15px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_16px_rgba(255,111,0,0.3)] active:scale-[0.98] transition-all disabled:opacity-60 mt-2">
            {loading
              ? <Loader2 size={20} className="animate-spin" />
              : <><span>Sign In</span><ArrowRight size={18} strokeWidth={2.5} /></>
            }
          </button>
        </form>
      )}

      {/* ── REGISTER FORM ── */}
      {!isLogin && (
        <form onSubmit={handleRegister} className="w-full max-w-[340px] flex flex-col gap-4">
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Full Name</label>
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-[14px] px-4 py-3.5 focus-within:border-[#2E7D32] transition-colors">
              <User size={17} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={regForm.name}
                onChange={e => setRegForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Your full name"
                required
                className="flex-1 outline-none bg-transparent text-[14px] font-medium text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Email Address</label>
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-[14px] px-4 py-3.5 focus-within:border-[#2E7D32] transition-colors">
              <Mail size={17} className="text-gray-400 shrink-0" />
              <input
                type="email"
                value={regForm.email}
                onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                required
                className="flex-1 outline-none bg-transparent text-[14px] font-medium text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Phone Number</label>
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-[14px] px-4 py-3.5 focus-within:border-[#2E7D32] transition-colors">
              <Phone size={17} className="text-gray-400 shrink-0" />
              <input
                type="tel"
                value={regForm.phone}
                onChange={e => setRegForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+91 98765 43210"
                required
                className="flex-1 outline-none bg-transparent text-[14px] font-medium text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Password</label>
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-[14px] px-4 py-3.5 focus-within:border-[#2E7D32] transition-colors">
              <Lock size={17} className="text-gray-400 shrink-0" />
              <input
                type={showPass ? 'text' : 'password'}
                value={regForm.password}
                onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Create a password"
                required
                className="flex-1 outline-none bg-transparent text-[14px] font-medium text-gray-800 placeholder-gray-400"
              />
              <button type="button" onClick={() => setShowPass(v => !v)} className="text-gray-400">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-[#FF7A00] text-white rounded-[16px] text-[15px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_16px_rgba(255,111,0,0.3)] active:scale-[0.98] transition-all disabled:opacity-60 mt-2">
            {loading
              ? <Loader2 size={20} className="animate-spin" />
              : <><span>Create Account</span><ArrowRight size={18} strokeWidth={2.5} /></>
            }
          </button>
        </form>
      )}

      {/* ── GOOGLE SIGN-IN (always mounted so the ref persists across mode switches) ── */}
      <div className="w-full max-w-[340px] mt-5">
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[12px] font-medium text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div ref={googleButtonRef} className="flex justify-center mt-3" />
      </div>

      {/* Trust badge */}
      <aside className="mt-8 bg-[#E8F5E9] border border-[#C8E6C9] rounded-[18px] p-4 flex gap-3 items-start w-full max-w-[340px]">
        <ShieldCheck size={20} className="text-[#2E7D32] shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] font-bold text-[#0A3D0A] mb-0.5">Verified & Secure</p>
          <p className="text-[11px] font-medium text-[#4A6B4A] leading-snug">
            Access 1000+ background-verified experts across Kerala. Your data is always protected.
          </p>
        </div>
      </aside>

      <p className="text-[10px] font-bold text-gray-400 tracking-[0.15em] uppercase mt-8">
        TRUSTED BY 50,000+ HOUSEHOLDS IN KERALA
      </p>

      <Toast toast={toast} />
    </div>
  );
}