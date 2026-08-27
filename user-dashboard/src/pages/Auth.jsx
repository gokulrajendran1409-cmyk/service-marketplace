import { useState } from 'react';
import { Wrench, Loader2 } from 'lucide-react';
import { useToast, Toast } from '../components/Toast';

const API = 'http://localhost:5000/api/auth';

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

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
