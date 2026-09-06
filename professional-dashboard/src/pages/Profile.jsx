import { useEffect, useState } from "react";
import { 
  CheckCircle2, ChevronRight, CircleDollarSign, Clock, HelpCircle, 
  LogOut, User, X, Save, Phone, Mail, MapPin, Briefcase, RefreshCw,
  Menu, Settings, Bell, Shield, Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.DEV
  ? 'http://localhost:5000'
  : 'https://service-marketplace-af7p.onrender.com';

function Profile() {
  const navigate = useNavigate();
  const professional = JSON.parse(localStorage.getItem("professional") || "{}");
  const [stats, setStats] = useState({ total_earnings: 0 });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: professional.full_name || "",
    email: professional.email || "",
    phone: professional.phone || "",
    service_category: professional.service_category || "",
    location: professional.location || "",
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [language, setLanguage] = useState(localStorage.getItem('pro_language') || 'en');
  const [theme, setTheme] = useState(localStorage.getItem('pro_theme') || 'Light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme === 'Dark' ? 'dark' : 'light';
  }, [theme]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API}/api/professionals/dashboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("professionalToken")}` }
      });
      if (response.status === 401) { handleLogout(); return; }
      if (response.ok) { const data = await response.json(); setStats(data); }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const handleLogout = () => {
    localStorage.removeItem("professionalToken");
    localStorage.removeItem("professional");
    navigate("/login");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update localStorage with new values
      const updated = { ...professional, ...editForm };
      localStorage.setItem("professional", JSON.stringify(updated));
      setSaveMsg("Profile updated successfully!");
      setTimeout(() => {
        setShowEditModal(false);
        setSaveMsg("");
        window.location.reload(); // reload to reflect changes in header
      }, 1200);
    } catch {
      setSaveMsg("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "P";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="pro-profile-root">
      
      {/* ── TOP HEADER WITH MENU ── */}
      <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 10 }}>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          style={{ background: 'transparent', border: 'none', padding: '8px', color: '#fff', cursor: 'pointer' }}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* ── SIDEBAR DRAWER ── */}
      {isSidebarOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setIsSidebarOpen(false)} />
          
          <div style={{ position: 'relative', width: '280px', height: '100%', background: 'var(--bg-surface)', boxShadow: '4px 0 24px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', animation: 'slideInLeft 0.3s ease' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>Menu</div>
              <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                <Settings size={20} color="var(--text-secondary)" /> App Settings
              </button>
              <button onClick={() => { setIsSidebarOpen(false); navigate('/setup-profile?edit=1'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                <User size={20} color="var(--text-secondary)" /> Edit Profile
              </button>
              <button onClick={() => navigate('/reviews')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                <Star size={20} color="var(--text-secondary)" /> My Reviews
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                <Shield size={20} color="var(--text-secondary)" /> Privacy Policy
              </button>
            </div>
            
            <div style={{ padding: '24px', borderTop: '1px solid var(--border-light)' }}>
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', border: 'none', background: '#fee2e2', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: 15, fontWeight: 700, color: '#dc2626' }}>
                <LogOut size={20} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PROFILE HERO ── */}
      <div className="pro-profile-hero">
        <div className="pro-profile-hero-bg" />
        <div className="pro-profile-avatar-wrap">
          <div className="pro-profile-avatar">{getInitials(professional.full_name)}</div>
          {professional.verification_status === "verified" && (
            <div className="pro-profile-verified-badge">
              <CheckCircle2 size={13} />
            </div>
          )}
        </div>
        <h1 className="pro-profile-name">{professional.full_name || "Professional"}</h1>
        <p className="pro-profile-role">
          {[professional.category, professional.sub_category].filter(Boolean).join(' / ') || "Service Provider"}
        </p>
        {professional.verification_status === "verified" && (
          <span className="pro-profile-verified-tag">✓ Verified Professional</span>
        )}
      </div>

      {/* ── QUICK INFO ── */}
      <div className="pro-profile-info-row">
        {professional.phone && (
          <div className="pro-info-chip">
            <Phone size={14} />
            <span>{professional.phone}</span>
          </div>
        )}
      </div>

      {/* ── SETTINGS SECTIONS ── */}
      <div className="pro-profile-settings">

        {/* Language */}
        <div className="pro-settings-group-label">Language</div>
        <div className="pro-setting-row" style={{ cursor: 'default' }}>
          <div className="pro-setting-row-left">
            <div className="pro-setting-icon-box" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
              <span style={{ fontSize: 18 }}>🌐</span>
            </div>
            <div>
              <div className="pro-setting-title">Select Language</div>
              <div className="pro-setting-subtitle">Choose your preferred language</div>
            </div>
          </div>
          <select
            value={language}
            onChange={e => { setLanguage(e.target.value); localStorage.setItem('pro_language', e.target.value); }}
            style={{
              border: '1.5px solid var(--border-light)',
              borderRadius: 10,
              padding: '6px 10px',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary)',
              background: 'var(--bg-surface)',
              cursor: 'pointer',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          >
            <option value="en">English</option>
            <option value="ta">Tamil</option>
            <option value="hi">Hindi</option>
            <option value="te">Telugu</option>
            <option value="kn">Kannada</option>
            <option value="ml">Malayalam</option>
          </select>
        </div>

        {/* Theme */}
        <div className="pro-settings-group-label" style={{ marginTop: 8 }}>Appearance</div>
        <div className="pro-setting-row" style={{ cursor: 'default' }}>
          <div className="pro-setting-row-left">
            <div className="pro-setting-icon-box" style={{ background: '#FEF9C3', color: '#92400E' }}>
              <span style={{ fontSize: 18 }}>🎨</span>
            </div>
            <div>
              <div className="pro-setting-title">Select Theme</div>
              <div className="pro-setting-subtitle">Light or dark mode</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Light', 'Dark'].map(t => (
              <button
                key={t}
                onClick={() => {
                  setTheme(t);
                  localStorage.setItem('pro_theme', t);
                  document.documentElement.dataset.theme = t === 'Dark' ? 'dark' : 'light';
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 10,
                  border: '1.5px solid',
                  borderColor: theme === t ? 'var(--accent-primary)' : 'var(--border-light)',
                  background: theme === t ? 'var(--accent-primary)' : 'transparent',
                  color: theme === t ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                  fontFamily: 'inherit'
                }}
              >
                {t === 'Light' ? '☀️' : '🌙'} {t}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ── EDIT MODAL ── */}
      {showEditModal && (
        <div className="pro-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
          <div className="pro-modal-card">
            <div className="pro-modal-header">
              <h2>Edit Profile</h2>
              <button className="pro-modal-close" onClick={() => setShowEditModal(false)}><X size={20} /></button>
            </div>

            <div className="pro-modal-body">
              <div className="pro-modal-field">
                <label><User size={14} /> Full Name</label>
                <input
                  className="pro-modal-input"
                  value={editForm.full_name}
                  onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>
              <div className="pro-modal-field">
                <label><Phone size={14} /> Phone Number</label>
                <input
                  className="pro-modal-input"
                  value={editForm.phone}
                  onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="Your phone number"
                />
              </div>
              <div className="pro-modal-field">
                <label><Mail size={14} /> Email</label>
                <input
                  className="pro-modal-input"
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="Your email address"
                />
              </div>
              <div className="pro-modal-field">
                <label><Briefcase size={14} /> Service Category</label>
                <input
                  className="pro-modal-input"
                  value={editForm.service_category}
                  onChange={e => setEditForm(f => ({ ...f, service_category: e.target.value }))}
                  placeholder="e.g. Plumber, Electrician"
                />
              </div>
              <div className="pro-modal-field">
                <label><MapPin size={14} /> Location</label>
                <input
                  className="pro-modal-input"
                  value={editForm.location}
                  onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Your service area"
                />
              </div>

              {saveMsg && (
                <div className={`pro-modal-msg ${saveMsg.includes('success') ? 'success' : 'error'}`}>
                  {saveMsg}
                </div>
              )}

              <button className="pro-modal-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}

export default Profile;

