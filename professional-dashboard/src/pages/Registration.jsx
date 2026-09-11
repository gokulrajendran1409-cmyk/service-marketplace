import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export default function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('full_name', `${formData.first_name.trim()} ${formData.last_name.trim()}`.trim());
      data.append('email', formData.email);
      data.append('password', formData.password);

      const api = import.meta.env.DEV ? 'http://localhost:5000' : 'https://service-marketplace-af7p.onrender.com';
      const response = await fetch(`${api}/api/professionals/register`, {
        method: 'POST',
        body: data
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Registration failed');

      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-wrapper">
      <div className="registration-card">
        <div className="brand-header">
          <div className="brand-icon">
            <Briefcase size={24} />
          </div>
          <h1>Professional Registration</h1>
          <p>Join our platform to offer your services</p>
          <p>Already registered? <Link to="/login">Log in</Link></p>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--error)' }}>{error}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name</label>
            <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} className="form-input" placeholder="John" required />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} className="form-input" placeholder="Doe" required />
          </div>
          <div className="form-group full-width">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" placeholder="you@example.com" required />
          </div>
          <div className="form-group full-width">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="form-input" minLength="6" placeholder="At least 6 characters" required />
          </div>

          <button type="submit" className="submit-btn" style={{ marginTop: '24px' }} disabled={loading}>
            {loading ? 'Submitting...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}

