import { useEffect, useState } from "react";
import { UserCheck, MapPin, Briefcase } from "lucide-react";

export default function Professionals() {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfessionals = async () => {
    try {
      const response = await fetch("https://service-marketplace-af7p.onrender.com/api/admin/professionals");
      if (!response.ok) throw new Error("Failed to fetch professionals");
      const data = await response.json();
      setProfessionals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  if (loading) return <div className="section-container">Loading professionals...</div>;
  if (error) return <div className="section-container" style={{ color: "var(--error)" }}>Error: {error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Verified Professionals</h1>
        <p className="page-subtitle">View and manage all active professionals on the platform.</p>
      </div>

      {professionals.length === 0 ? (
        <div className="section-container" style={{ textAlign: 'center', padding: '40px' }}>
          <UserCheck size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <h3>No verified professionals yet</h3>
          <p style={{ color: "var(--text-muted)" }}>When you approve registrations in the Verification tab, they will appear here.</p>
        </div>
      ) : (
        <div className="stats-grid">
          {professionals.map((prof) => (
            <div key={prof.id} className="stat-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {prof.full_name}
                  </h3>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                    <UserCheck size={14} /> Verified
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={16} /> 
                  <span style={{ fontWeight: '500', color: 'var(--accent-primary)' }}>{prof.category || 'Uncategorized'}</span>
                  <span>&bull; {prof.experience_years} yrs exp</span>
                </div>
                {(prof.city || prof.state) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} /> 
                    <span>{[prof.city, prof.state].filter(Boolean).join(", ")}</span>
                  </div>
                )}
              </div>
              
              <div style={{ background: 'var(--bg-base)', padding: '12px', borderRadius: '8px', fontSize: '14px', flexGrow: 1, border: '1px solid var(--border-light)' }}>
                <p style={{ margin: 0 }}>{prof.bio || 'No bio provided.'}</p>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right', marginTop: 'auto' }}>
                Joined: {new Date(prof.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}