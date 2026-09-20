import { useEffect, useState } from "react";
import { CheckCircle, XCircle, FileText, User, Clock, ShieldCheck, ShieldX, Phone, Mail, MapPin, Briefcase } from "lucide-react";

const API = import.meta.env.DEV ? 'http://localhost:5000' : 'https://service-marketplace-af7p.onrender.com';

function Verification() {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingList, setPendingList] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPending = async () => {
    try {
      const response = await fetch(`${API}/api/admin/verifications`);
      if (!response.ok) throw new Error("Failed to fetch verifications");
      const data = await response.json();
      setPendingList(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API}/api/admin/verifications/history`);
      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();
      setHistoryList(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    Promise.all([fetchPending(), fetchHistory()]).finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this professional?")) return;
    try {
      const response = await fetch(`${API}/api/admin/verifications/${id}/approve`, {
        method: "POST"
      });
      if (response.ok) {
        setPendingList(pendingList.filter(v => v.id !== id));
        fetchHistory(); // Refresh history
      } else {
        alert("Failed to approve");
      }
    } catch (err) {
      console.error(err);
      alert("Error approving");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this professional?")) return;
    const reason = "Rejected by administrator.";
    try {
      const response = await fetch(`${API}/api/admin/verifications/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason })
      });
      if (response.ok) {
        setPendingList(pendingList.filter(v => v.id !== id));
        fetchHistory(); // Refresh history
      } else {
        alert("Failed to reject");
      }
    } catch (err) {
      console.error(err);
      alert("Error rejecting");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', icon: <Clock size={14} />, label: 'Pending' },
      under_review: { bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', icon: <Clock size={14} />, label: 'Under Review' },
      verified: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', icon: <ShieldCheck size={14} />, label: 'Verified' },
      rejected: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', icon: <ShieldX size={14} />, label: 'Rejected' }
    };
    const s = styles[status] || styles.pending;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: s.bg, color: s.color, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
        {s.icon} {s.label}
      </span>
    );
  };

  const tabStyle = (tab) => ({
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease',
    background: activeTab === tab ? 'var(--accent-primary)' : 'transparent',
    color: activeTab === tab ? 'white' : 'var(--text-secondary)',
  });

  // Filter history by tab
  const filteredList = activeTab === "pending"
    ? pendingList
    : historyList.filter(p => p.verification_status === activeTab);

  if (loading) return <div className="section-container">Loading verifications...</div>;
  if (error) return <div className="section-container" style={{ color: "var(--error)" }}>Error: {error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Professional Verification</h1>
        <p className="page-subtitle">Review, approve, or reject professional registrations.</p>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', padding: '6px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-light)', width: 'fit-content' }}>
        <button onClick={() => setActiveTab("pending")} style={tabStyle("pending")}>
          Pending {pendingList.length > 0 && <span style={{ marginLeft: '6px', background: activeTab === 'pending' ? 'rgba(255,255,255,0.3)' : 'rgba(245, 158, 11, 0.15)', color: activeTab === 'pending' ? 'white' : '#f59e0b', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>{pendingList.length}</span>}
        </button>
        <button onClick={() => setActiveTab("verified")} style={tabStyle("verified")}>
          Verified
        </button>
        <button onClick={() => setActiveTab("rejected")} style={tabStyle("rejected")}>
          Rejected
        </button>
      </div>

      {/* Content */}
      {filteredList.length === 0 ? (
        <div className="section-container" style={{ textAlign: 'center', padding: '40px' }}>
          {activeTab === "pending" && <><CheckCircle size={48} style={{ color: 'var(--success)', margin: '0 auto 16px' }} /><h3>All caught up!</h3><p style={{ color: "var(--text-muted)" }}>No pending registrations to review.</p></>}
          {activeTab === "verified" && <><ShieldCheck size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} /><h3>No verified professionals</h3><p style={{ color: "var(--text-muted)" }}>Approved professionals will appear here.</p></>}
          {activeTab === "rejected" && <><ShieldX size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} /><h3>No rejected applications</h3><p style={{ color: "var(--text-muted)" }}>Rejected applications will appear here.</p></>}
        </div>
      ) : (
        <div className="stats-grid" style={{ gridTemplateColumns: '1fr' }}>
          {filteredList.map((prof) => (
            <div key={prof.id} className="stat-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', width: 48, height: 48, padding: 0, overflow: 'hidden', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {prof.profile_photo ? (
                      <img 
                        src={prof.profile_photo.startsWith('http') ? prof.profile_photo : `${API}/uploads/${prof.profile_photo}`} 
                        alt="Profile" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div style={{ display: prof.profile_photo ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {(prof.full_name || 'U').charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {prof.full_name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      <span style={{ fontWeight: '500', color: 'var(--accent-primary)' }}>{prof.category || 'Uncategorized'}</span>
                      &bull; {prof.experience_years} years experience
                      &bull; {new Date(prof.created_at).toLocaleDateString()}
                      {activeTab !== "pending" && <>{getStatusBadge(prof.verification_status)}</>}
                    </div>
                  </div>
                </div>
                {/* Show action buttons only on Pending tab */}
                {activeTab === "pending" && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleApprove(prof.id)}
                      style={{ background: 'var(--success)', color: 'white', padding: '8px 16px', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button 
                      onClick={() => handleReject(prof.id)}
                      style={{ background: 'var(--error)', color: 'white', padding: '8px 16px', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div style={{ padding: '16px', background: 'var(--bg-base)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> Contact Info</h4>
                  <p style={{ fontSize: '14px', marginBottom: '4px' }}>{prof.email || 'No email'}</p>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{prof.phone || 'No phone'}</p>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-base)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> Location</h4>
                  <p style={{ fontSize: '14px', marginBottom: '4px' }}>{prof.address || 'No address'}</p>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Pincode: {prof.pincode || 'N/A'}</p>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-base)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Briefcase size={14} /> Work Details</h4>
                  <p style={{ fontSize: '14px', marginBottom: '4px' }}>Sub: {prof.sub_category || 'N/A'}</p>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Transport: {prof.transport_mode ? prof.transport_mode.replace('_', ' ') : 'N/A'}</p>
                </div>
              </div>
              
              <div style={{ padding: '16px', background: 'var(--bg-base)', borderRadius: '8px', border: '1px solid var(--border-light)', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Professional Bio</h4>
                <p style={{ fontSize: '15px' }}>{prof.bio || 'No bio provided.'}</p>
              </div>

              {/* Show rejection reason for rejected tab */}
              {activeTab === "rejected" && prof.rejection_reason && (
                <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--error)' }}>Rejection Reason</h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{prof.rejection_reason}</p>
                </div>
              )}

              {/* Show verified date for verified tab */}
              {activeTab === "verified" && prof.verified_at && (
                <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '16px', fontSize: '14px', color: 'var(--success)' }}>
                  Verified on {new Date(prof.verified_at).toLocaleDateString()} at {new Date(prof.verified_at).toLocaleTimeString()}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Identity & Documents</h4>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {prof.identity_photo && (
                    <a 
                      href={prof.identity_photo.startsWith('http') ? prof.identity_photo : `${API}/uploads/${prof.identity_photo}`} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: '1px solid var(--border-focus)', borderRadius: '6px', color: 'var(--accent-primary)', background: 'var(--bg-base)', textDecoration: 'none', fontWeight: '500' }}
                    >
                      <FileText size={18} /> {prof.identity_type ? prof.identity_type.replace('_', ' ').toUpperCase() : 'ID Proof'}
                    </a>
                  )}
                  {prof.documents && prof.documents.map((doc, idx) => (
                    doc && doc.url ? (
                      <a 
                        key={idx}
                        href={doc.url.startsWith('http') ? doc.url : `${API}/uploads/${doc.url}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: '1px solid var(--border-focus)', borderRadius: '6px', color: 'var(--accent-primary)', background: 'var(--bg-base)', textDecoration: 'none', fontWeight: '500' }}
                      >
                        <FileText size={18} /> {doc.type === 'id_proof' ? 'ID Proof' : 'Certificate'}
                      </a>
                    ) : null
                  ))}
                  {(!prof.identity_photo && (!prof.documents || !prof.documents.some(d => d && d.url))) && (
                    <span style={{ color: 'var(--text-muted)' }}>No documents uploaded.</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Verification;