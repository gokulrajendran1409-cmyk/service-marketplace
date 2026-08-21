import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, CheckCircle } from 'lucide-react';

export default function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    date_of_birth: '',
    category: '',
    experience_years: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    bio: ''
  });

  const [idProof, setIdProof] = useState(null);
  const [certificate, setCertificate] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const idInputRef = useRef(null);
  const certInputRef = useRef(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, setter) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      // append text fields
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      // append files
      if (idProof) data.append('id_proof', idProof);
      if (certificate) data.append('certificate', certificate);

      const response = await fetch('http://localhost:5000/api/professionals/register', {
        method: 'POST',
        body: data
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Registration failed');

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="registration-wrapper">
        <div className="registration-card" style={{ textAlign: 'center' }}>
           <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 20px' }} />
           <h2>Registration Complete!</h2>
           <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>Status: Pending admin approval. The dashboard will be available after the admin accepts your registration.</p>
           <button className="submit-btn" onClick={() => navigate('/login')}>Go to login</button>
        </div>
      </div>
    );
  }

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
          <div className="form-group full-width">
            <label>Full Name</label>
            <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} className="form-input" placeholder="John Doe" required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="form-input" placeholder="9876543210" required />
          </div>
          <div className="form-group full-width">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="form-input" minLength="6" placeholder="At least 6 characters" required />
          </div>

          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} className="form-input" required />
          </div>

          <div className="form-group">
            <label>Professional Category</label>
            <select name="category" value={formData.category} onChange={handleInputChange} className="form-input" required>
              <option value="">Select Category...</option>
              <option value="Plumbing">🔧 Plumbing</option>
              <option value="Electrical">⚡ Electrical</option>
              <option value="AC & Appliance Repair">❄️ AC & Appliance Repair</option>
              <option value="Carpentry">🪚 Carpentry</option>
              <option value="Painting">🎨 Painting</option>
              <option value="Cleaning">🧹 Cleaning</option>
              <option value="Home Repair & Maintenance">🔨 Home Repair & Maintenance</option>
              <option value="CCTV & Security">📹 CCTV & Security</option>
              <option value="Vehicle Services">🚗 Vehicle Services</option>
              <option value="Gardening & Landscaping">🌳 Gardening & Landscaping</option>
              <option value="Computer & Mobile Repair">💻 Computer & Mobile Repair</option>
              <option value="Photography & Videography">📷 Photography & Videography</option>
            </select>
          </div>

          <div className="form-group">
            <label>Experience (Years)</label>
            <input type="number" name="experience_years" value={formData.experience_years} onChange={handleInputChange} min="0" className="form-input" placeholder="5" required />
          </div>

          <div className="form-group full-width">
            <label>Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="form-input" placeholder="123 Main St" />
          </div>

          <div className="form-group">
            <label>City</label>
            <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="form-input" placeholder="New York" />
          </div>

          <div className="form-group">
            <label>State</label>
            <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="form-input" placeholder="NY" />
          </div>

          <div className="form-group">
            <label>Pincode</label>
            <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="form-input" placeholder="10001" />
          </div>

          <div className="form-group full-width">
            <label>Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleInputChange} className="form-input" placeholder="Tell us about your professional background..."></textarea>
          </div>

          <div className="form-group full-width" style={{ marginTop: '16px', paddingTop: '24px', borderTop: '1px solid var(--border-light)' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Verification Documents</h3>
          </div>

          <div className="form-group">
            <label>Upload ID Proof</label>
            <div 
              onClick={() => idInputRef.current.click()}
              style={{
                border: idProof ? '2px solid var(--success)' : '2px dashed var(--border-light)',
                borderRadius: '10px',
                padding: '24px',
                textAlign: 'center',
                background: idProof ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-base)',
                cursor: 'pointer',
                color: idProof ? 'var(--success)' : 'var(--text-secondary)'
              }}
            >
              <p style={{ fontSize: '14px', margin: 0 }}>{idProof ? idProof.name : 'Click to upload ID Proof'}</p>
              <input type="file" ref={idInputRef} onChange={(e) => handleFileChange(e, setIdProof)} style={{ display: 'none' }} accept="image/*,.pdf" />
            </div>
          </div>

          <div className="form-group">
            <label>Professional Certificate</label>
            <div 
              onClick={() => certInputRef.current.click()}
              style={{
                border: certificate ? '2px solid var(--success)' : '2px dashed var(--border-light)',
                borderRadius: '10px',
                padding: '24px',
                textAlign: 'center',
                background: certificate ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-base)',
                cursor: 'pointer',
                color: certificate ? 'var(--success)' : 'var(--text-secondary)'
              }}
            >
              <p style={{ fontSize: '14px', margin: 0 }}>{certificate ? certificate.name : 'Click to upload Certificate'}</p>
              <input type="file" ref={certInputRef} onChange={(e) => handleFileChange(e, setCertificate)} style={{ display: 'none' }} accept="image/*,.pdf" />
            </div>
          </div>

          <button type="submit" className="submit-btn" style={{ marginTop: '24px' }} disabled={loading}>
            {loading ? 'Submitting...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}
