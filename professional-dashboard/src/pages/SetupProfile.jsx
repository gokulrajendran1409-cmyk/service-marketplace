import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, ChevronRight, CheckCircle2, ChevronLeft, MapPin, Briefcase, Info, Search } from 'lucide-react';

const API = import.meta.env.DEV
  ? 'http://localhost:5000'
  : 'https://service-marketplace-af7p.onrender.com';

function SetupProfile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditing = searchParams.get('edit') === '1';
  const professional = JSON.parse(localStorage.getItem('professional') || '{}');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [fullName, setFullName] = useState(professional.full_name || '');
  const [phone, setPhone] = useState(professional.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState(professional.date_of_birth || '');
  const [address, setAddress] = useState(professional.address || '');
  const [pincode, setPincode] = useState(professional.pincode || '');
  const [bio, setBio] = useState(professional.bio || '');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePreview, setProfilePreview] = useState(professional.profile_photo ? `${API}/uploads/${professional.profile_photo}` : null);

  const [category, setCategory] = useState(professional.category || '');
  const [subCategory, setSubCategory] = useState(professional.sub_category || '');
  const [experienceYears, setExperienceYears] = useState(professional.experience_years || '');

  const [transportMode, setTransportMode] = useState(professional.transport_mode || 'bike');
  const [identityType, setIdentityType] = useState(professional.identity_type || 'Aadhaar');
  const [identityPhoto, setIdentityPhoto] = useState(null);
  const [identityPreview, setIdentityPreview] = useState(professional.identity_photo ? `${API}/uploads/${professional.identity_photo}` : null);

  // Categories & Subcategories fetched from DB
  const [dbCategories, setDbCategories] = useState([]);
  const [dbSubcategories, setDbSubcategories] = useState([]);

  useEffect(() => {
    // Fetch categories and subcategories
    const fetchCats = async () => {
      try {
        const catRes = await fetch(`${API}/api/user/categories`);
        const catData = await catRes.json();
        setDbCategories(catData);

        const subRes = await fetch(`${API}/api/user/subcategories`);
        const subData = await subRes.json();
        setDbSubcategories(subData);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    if (!isEditing) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API}/api/professionals/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('professionalToken')}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to load profile');

        setFullName(data.full_name || '');
        setPhone(data.phone || '');
        setDateOfBirth(data.date_of_birth ? data.date_of_birth.slice(0, 10) : '');
        setAddress(data.address || '');
        setPincode(data.pincode || '');
        setBio(data.bio || '');
        setCategory(data.category || '');
        setSubCategory(data.sub_category || '');
        setExperienceYears(data.experience_years ?? '');
        setTransportMode(data.transport_mode || 'bike');
        setIdentityType(data.identity_type || 'Aadhaar');
        setProfilePreview(data.profile_photo ? `${API}/uploads/${data.profile_photo}` : null);
        setIdentityPreview(data.identity_photo ? `${API}/uploads/${data.identity_photo}` : null);
        localStorage.setItem('professional', JSON.stringify({ ...professional, ...data }));
      } catch (fetchError) {
        setError(fetchError.message);
      }
    };

    fetchProfile();
  }, [isEditing]);

  const handleProfilePhoto = (e) => {
    if (e.target.files[0]) {
      setProfilePhoto(e.target.files[0]);
      setProfilePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleIdentityPhoto = (e) => {
    if (e.target.files[0]) {
      setIdentityPhoto(e.target.files[0]);
      setIdentityPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleNext = () => {
    const validPhone = /^\+?[0-9\s-]{7,15}$/.test(phone.trim());
    const birthDate = dateOfBirth ? new Date(`${dateOfBirth}T00:00:00`) : null;
    const validBirthDate = birthDate && !Number.isNaN(birthDate.getTime()) && birthDate <= new Date();

    if (step === 1 && !fullName.trim()) return setError('Full name is required');
    if (step === 1 && !validPhone) return setError('Enter a valid phone number');
    if (step === 1 && !validBirthDate) return setError('Enter a valid date of birth');
    if (step === 1 && address.trim().length < 5) return setError('Enter a complete address');
    if (step === 1 && !/^\d{6}$/.test(pincode.trim())) return setError('Pincode must contain 6 digits');
    if (step === 2 && !category) return setError('Category is required');
    if (step === 2 && !experienceYears) return setError('Experience is required');
    if (step === 3 && !identityType) return setError('Identity Type is required');
    
    // Identity photo is required if they don't already have one
    if (step === 3 && !identityPhoto && !identityPreview) {
      return setError('Identity Document Photo is required');
    }

    setError('');
    if (step < 3) setStep(step + 1);
    else submitProfile();
  };

  const submitProfile = async () => {
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('full_name', fullName);
    formData.append('phone', phone);
    formData.append('date_of_birth', dateOfBirth);
    formData.append('address', address);
    formData.append('pincode', pincode);
    formData.append('bio', bio);
    formData.append('category', category);
    formData.append('sub_category', subCategory);
    formData.append('experience_years', experienceYears);
    formData.append('transport_mode', transportMode);
    formData.append('identity_type', identityType);

    if (profilePhoto) formData.append('profile_photo', profilePhoto);
    if (identityPhoto) formData.append('identity_photo', identityPhoto);

    try {
      const res = await fetch(`${API}/api/professionals/setup-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('professionalToken')}`
        },
        body: formData
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to setup profile');

      // Update local storage
      localStorage.setItem('professional', JSON.stringify(data.professional));
      
      // Navigate to dashboard
      navigate(isEditing ? '/profile' : '/');
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pro-dashboard-root" style={{ background: 'var(--bg-base)' }}>
      <header style={{ padding: '24px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '16px', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} style={{ background: 'var(--bg-surface-hover)', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={20} color="var(--text-primary)" />
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{isEditing ? 'Edit Profile' : 'Set Up Profile'}</h2>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '2px' }}>Step {step} of 3</div>
        </div>
      </header>

      <div style={{ padding: '24px', flex: 1, paddingBottom: '100px' }}>
        
        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          {[1,2,3].map(s => (
            <div key={s} style={{ height: '4px', flex: 1, background: s <= step ? 'var(--accent-primary)' : '#E2E8F0', borderRadius: '4px', transition: 'all 0.3s' }} />
          ))}
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: '#FEE2E2', color: '#DC2626', borderRadius: '12px', fontSize: '13px', fontWeight: 600, marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {/* STEP 1: Personal Info */}
        {step === 1 && (
          <div className="animation-fade-in">
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>Personal Details</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
              <label style={{ position: 'relative', cursor: 'pointer', display: 'block' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#E2E8F0', border: '3px solid #fff', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {profilePreview ? (
                    <img src={profilePreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Camera size={32} color="#94A3B8" />
                  )}
                </div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--accent-primary)', color: 'white', padding: '6px', borderRadius: '50%', border: '2px solid #fff' }}>
                  <Camera size={14} />
                </div>
                <input type="file" accept="image/*" onChange={handleProfilePhoto} style={{ display: 'none' }} />
              </label>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', fontWeight: 500 }}>Upload Photo (Optional)</span>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>Full Name *</label>
              <input 
                type="text" 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Enter your full name"
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '15px', outline: 'none', background: 'var(--bg-surface)', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>Phone Number *</label>
              <input
                type="tel"
                maxLength="15"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '15px', outline: 'none', background: 'var(--bg-surface)', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>Date of Birth *</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={e => setDateOfBirth(e.target.value)}
                  style={{ width: '100%', padding: '14px 10px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '14px', outline: 'none', background: 'var(--bg-surface)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>Pincode *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  value={pincode}
                  onChange={e => setPincode(e.target.value)}
                  placeholder="Pincode"
                  style={{ width: '100%', padding: '14px 10px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '14px', outline: 'none', background: 'var(--bg-surface)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>Address *</label>
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Enter your full address"
                rows={3}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '15px', outline: 'none', background: 'var(--bg-surface)', color: 'var(--text-primary)', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>About Me (Bio)</label>
              <textarea 
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tell customers a bit about yourself and your skills..."
                rows={4}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '15px', outline: 'none', background: 'var(--bg-surface)', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        )}

        {/* STEP 2: Work Details */}
        {step === 2 && (
          <div className="animation-fade-in">
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>Work Details</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>Main Job Category *</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '15px', outline: 'none', background: 'var(--bg-surface)', boxSizing: 'border-box' }}
              >
                <option value="">Select a category</option>
                {dbCategories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {category && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>Specialization / Sub-Category (Optional)</label>
                <select 
                  value={subCategory}
                  onChange={e => setSubCategory(e.target.value)}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '15px', outline: 'none', background: 'var(--bg-surface)', boxSizing: 'border-box' }}
                >
                  <option value="">General / None</option>
                  {dbSubcategories.filter(s => s.category_name === category).map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>Years of Experience *</label>
              <input 
                type="number"
                min="0"
                value={experienceYears}
                onChange={e => setExperienceYears(e.target.value)}
                placeholder="e.g. 3"
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '15px', outline: 'none', background: 'var(--bg-surface)', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        )}

        {/* STEP 3: Verification & Logistics */}
        {step === 3 && (
          <div className="animation-fade-in">
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>Verification & Travel</h3>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px' }}>How do you travel for work?</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {['bike', 'car', 'public_transport', 'walking'].map(mode => (
                  <button 
                    key={mode}
                    onClick={() => setTransportMode(mode)}
                    style={{ 
                      padding: '12px', borderRadius: '12px', 
                      border: `1.5px solid ${transportMode === mode ? 'var(--accent-primary)' : 'var(--border-light)'}`,
                      background: transportMode === mode ? 'var(--bg-light-green)' : 'var(--bg-surface)',
                      color: transportMode === mode ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      fontWeight: 600, fontSize: '13px', cursor: 'pointer', textTransform: 'capitalize'
                    }}
                  >
                    {mode.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>Identity Document Type *</label>
              <select 
                value={identityType}
                onChange={e => setIdentityType(e.target.value)}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '15px', outline: 'none', background: 'var(--bg-surface)', boxSizing: 'border-box' }}
              >
                <option value="Aadhaar">Aadhaar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="Driving License">Driving License</option>
                <option value="Voter ID">Voter ID</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>Upload Identity Document Photo *</label>
              <label style={{ display: 'block', width: '100%', border: '2px dashed var(--border-light)', borderRadius: '16px', background: 'var(--bg-surface)', padding: '24px', textAlign: 'center', cursor: 'pointer', boxSizing: 'border-box' }}>
                {identityPreview ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src={identityPreview} alt="Identity Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', marginBottom: '12px' }} />
                    <span style={{ fontSize: '13px', color: 'var(--accent-primary)', fontWeight: 600 }}>Change Document</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ background: 'var(--bg-surface-hover)', padding: '12px', borderRadius: '50%', marginBottom: '12px' }}>
                      <Camera size={24} color="var(--text-secondary)" />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Tap to upload photo</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Must be clear and readable</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleIdentityPhoto} style={{ display: 'none' }} />
              </label>
            </div>
            
            <div style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '12px', display: 'flex', gap: '10px', marginTop: '24px' }}>
              <Info size={18} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Your identity document is securely stored and used only for verification purposes to ensure safety on our platform.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Fixed Bottom Button */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '20px 24px', background: 'color-mix(in srgb, var(--bg-surface) 94%, transparent)', backdropFilter: 'blur(10px)', borderTop: '1px solid var(--border-light)' }}>
        <button 
          onClick={handleNext}
          disabled={loading}
          style={{ width: '100%', background: 'var(--accent-gradient)', color: 'white', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: 800, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Saving...' : step === 3 ? 'Complete Setup' : 'Continue'}
          {!loading && step < 3 && <ChevronRight size={18} />}
          {!loading && step === 3 && <CheckCircle2 size={18} />}
        </button>
      </div>
    </div>
  );
}

export default SetupProfile;
