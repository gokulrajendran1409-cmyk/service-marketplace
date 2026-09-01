import { useEffect, useRef, useState } from 'react';
import { Wrench, Loader2 } from 'lucide-react';
import { useToast, Toast } from '../components/Toast';

const API = `${import.meta.env.DEV ? 'http://localhost:5000' : 'https://service-marketplace-af7p.onrender.com'}/api/auth`;
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

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const googleButtonRef = useRef(null);
  const onLoginRef = useRef(onLogin);
  const showToastRef = useRef(showToast);

  useEffect(() => {
    onLoginRef.current = onLogin;
    showToastRef.current = showToast;
  }, [onLogin, showToast]);

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
              const result = await fetch(`${API}/google`, {
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

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/login' : '/register';
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : form;

      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      onLogin(data.user, data.token);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-wrapper">
      <div className="registration-card fade-up">
        <div className="brand-header">
          <div className="brand-icon">
            <Wrench size={24} />
          </div>
          <h1>{isLogin ? 'Welcome back' : 'Create an account'}</h1>
          <p>{isLogin ? 'Sign in to book and manage services' : 'Join ServiceHub to find the best professionals'}</p>
        </div>

        <form onSubmit={handleSubmit} className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input className="form-input" name="name" type="text" required value={form.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input className="form-input" name="phone" type="tel" required value={form.phone} onChange={handleChange} />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input className="form-input" name="email" type="email" required value={form.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input className="form-input" name="password" type="password" required value={form.password} onChange={handleChange} />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" style={{ display: 'inline' }} /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>
        <div className="google-signin-wrap" ref={googleButtonRef} />

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: '600', cursor: 'pointer' }}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
      <Toast toast={toast} />
    </div>
  );
}

export default Auth;
