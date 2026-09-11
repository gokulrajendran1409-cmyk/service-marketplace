import { Bell } from 'lucide-react';

function Notifications({ navigate }) {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">Stay updated with your service requests.</p>
      </div>

      <div className="empty-state" style={{ marginTop: 60 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Bell size={32} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No notifications yet</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          When professionals respond to your requests or update their status, you'll see it here.
        </p>
      </div>
    </div>
  );
}

export default Notifications;
