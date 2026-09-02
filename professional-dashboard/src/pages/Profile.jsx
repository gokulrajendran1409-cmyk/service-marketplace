import { useEffect, useState } from "react";
import { 
  CheckCircle2, ChevronRight, CircleDollarSign, Clock, HelpCircle, 
  LogOut, User, X, Save, Phone, Mail, MapPin, Briefcase, RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";



function Profile() {
  const navigate = useNavigate();
  const professional = JSON.parse(localStorage.getItem("professional") || "{}");
  const [stats, setStats] = useState({ total_earnings: 0 });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: professional.full_name || "",
    email: professional.email || "",
    phone: professional.phone || "",
    service_category: professional.service_category || "",
    location: professional.location || "",
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const fetchStats = async () => {
    try {
      const response = await fetch("https://service-marketplace-af7p.onrender.com/api/professionals/dashboard", {
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
        <p className="pro-profile-role">{professional.service_category || "Service Provider"}</p>
        {professional.verification_status === "verified" && (
          <span className="pro-profile-verified-tag">✓ Verified Professional</span>
        )}
      </div>

      {/* ── WALLET CARD ── */}
      <div className="pro-profile-wallet">
        <div className="pro-wallet-glow" />
        <div className="pro-wallet-top">
          <div>
            <div className="pro-wallet-label">Total Earnings</div>
            <div className="pro-wallet-amount">
              {loading ? <span className="pro-wallet-loading">···</span> : `₹${(stats.total_earnings || 0).toLocaleString()}`}
            </div>
          </div>
          <div className="pro-wallet-chip">
            <CheckCircle2 size={14} color="#34D399" />
            <span>Last: Completed</span>
          </div>
        </div>
        <button
          className="pro-wallet-withdraw-btn"
          onClick={() => alert("Withdrawal system coming soon! Contact support for manual payout.")}
        >
          <CircleDollarSign size={18} />
          <span>Request Cash Withdrawal</span>
        </button>
      </div>

      {/* ── QUICK INFO ── */}
      <div className="pro-profile-info-row">
        {professional.phone && (
          <div className="pro-info-chip">
            <Phone size={14} />
            <span>{professional.phone}</span>
          </div>
        )}
        {professional.email && (
          <div className="pro-info-chip">
            <Mail size={14} />
            <span>{professional.email}</span>
          </div>
        )}
      </div>

      {/* ── SETTINGS LIST ── */}
      <div className="pro-profile-settings">
        <div className="pro-settings-group-label">Account</div>

        <button className="pro-setting-row" onClick={() => setShowEditModal(true)}>
          <div className="pro-setting-row-left">
            <div className="pro-setting-icon-box" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
              <User size={18} />
            </div>
            <div>
              <div className="pro-setting-title">Edit Personal Details</div>
              <div className="pro-setting-subtitle">Name, phone, location</div>
            </div>
          </div>
          <ChevronRight size={16} color="var(--text-muted)" />
        </button>

        <button className="pro-setting-row" onClick={() => {}}>
          <div className="pro-setting-row-left">
            <div className="pro-setting-icon-box" style={{ background: '#FEF3C7', color: '#B45309' }}>
              <Clock size={18} />
            </div>
            <div>
              <div className="pro-setting-title">Withdrawal History</div>
              <div className="pro-setting-subtitle">View past transactions</div>
            </div>
          </div>
          <ChevronRight size={16} color="var(--text-muted)" />
        </button>

        <div className="pro-settings-group-label" style={{ marginTop: 8 }}>More</div>

        <button className="pro-setting-row" onClick={() => {}}>
          <div className="pro-setting-row-left">
            <div className="pro-setting-icon-box" style={{ background: '#F0FDF4', color: '#16A34A' }}>
              <HelpCircle size={18} />
            </div>
            <div>
              <div className="pro-setting-title">Help & Support</div>
              <div className="pro-setting-subtitle">Contact us anytime</div>
            </div>
          </div>
          <ChevronRight size={16} color="var(--text-muted)" />
        </button>

        <button className="pro-setting-row danger" onClick={handleLogout}>
          <div className="pro-setting-row-left">
            <div className="pro-setting-icon-box" style={{ background: '#FEE2E2', color: '#DC2626' }}>
              <LogOut size={18} />
            </div>
            <div>
              <div className="pro-setting-title">Log Out</div>
              <div className="pro-setting-subtitle">Sign out of your account</div>
            </div>
          </div>
        </button>
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

