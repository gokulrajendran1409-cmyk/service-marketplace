import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Camera, X } from 'lucide-react';

export default function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be under 5MB');
      return;
    }
    setError('');
    setProfilePhoto(file);
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
  };

  const handleRemovePhoto = (e) => {
    e.stopPropagation();
    setProfilePhoto(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('full_name', `${formData.first_name.trim()} ${formData.last_name.trim()}`.trim());
      data.append('email', formData.email.trim());
      data.append('password', formData.password);
      if (profilePhoto) {
        data.append('profile_photo', profilePhoto);
      }

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
          {/* Profile Photo Picker */}
          <div className="full-width" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                border: '2.5px dashed var(--accent-primary)',
                position: 'relative',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-surface-hover, rgba(0,0,0,0.03))',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                boxShadow: photoPreview ? '0 4px 14px rgba(0,0,0,0.12)' : 'none',
              }}
              title="Click to choose profile photo"
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--accent-primary)' }}>
                  <Camera size={26} />
                  <span style={{ fontSize: '10px', fontWeight: 700, marginTop: '4px' }}>Add Photo</span>
                </div>
              )}

              {photoPreview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: 'rgba(239, 68, 68, 0.9)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}
                  title="Remove photo"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', fontWeight: 500 }}>
              {photoPreview ? 'Profile photo set ✓' : 'Upload professional profile photo'}
            </div>
          </div>

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

