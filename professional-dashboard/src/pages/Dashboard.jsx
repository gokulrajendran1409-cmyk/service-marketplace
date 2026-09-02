import { useEffect, useState, useRef } from "react";
import { 
  ClipboardList, CheckCheck, RefreshCw, XCircle, 
  DollarSign, Clock, Bell, Power, ChevronRight, 
  Star, TrendingUp, Zap, ShieldCheck, ArrowUpRight,
  User, MapPin, Calendar
} from 'lucide-react';
import { useProfessionalNotifications } from "../hooks/useProfessionalNotifications";
import { useNavigate } from "react-router-dom";

const API = "https://service-marketplace-af7p.onrender.com";

function Dashboard() {
  const navigate = useNavigate();
  const professional = JSON.parse(localStorage.getItem("professional") || "{}");
  const professionalId = professional.id;
  const [showNotifications, setShowNotifications] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const { notifications, unreadCount, markAllRead } = useProfessionalNotifications(professionalId);
  const dropdownRef = useRef(null);
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("professionalToken");
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [statsRes, requestsRes] = await Promise.all([
        fetch(`${API}/api/professionals/dashboard`, { headers }),
        fetch(`${API}/api/professionals/requests`, { headers }),
      ]);
      if (statsRes.status === 401 || requestsRes.status === 401) {
        localStorage.removeItem("professionalToken");
        localStorage.removeItem("professional");
        navigate("/login");
        return;
      }
      if (statsRes.ok) setStats(await statsRes.json());
      if (requestsRes.ok) {
        const allRequests = await requestsRes.json();
        // Sort by newest first, take first 3
        const sorted = [...allRequests].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setRecentRequests(sorted.slice(0, 3));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getInitials = (name) => {
    if (!name) return "P";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const completionRate = stats && stats.total_requests > 0
    ? Math.round((stats.completed_requests / stats.total_requests) * 100)
    : 0;

  const getStatusStyle = (status) => {
    const map = {
      pending:    { bg: '#FFFBEB', color: '#B45309', label: 'Pending' },
      accepted:   { bg: '#EFF6FF', color: '#1D4ED8', label: 'Accepted' },
      in_progress:{ bg: '#F0F9FF', color: '#0369A1', label: 'In Progress' },
      completed:  { bg: '#ECFDF5', color: '#065F46', label: 'Done' },
      rejected:   { bg: '#FEF2F2', color: '#991B1B', label: 'Rejected' },
      cancelled:  { bg: '#F9FAFB', color: '#4B5563', label: 'Cancelled' },
    };
    return map[status] || map.pending;
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', gap: 16 }}>
      <RefreshCw className="spin" size={28} color="var(--accent-primary)" />
      <span style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>Loading dashboard...</span>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', gap: 12, padding: '0 32px', textAlign: 'center' }}>
      <XCircle size={36} color="var(--error)" />
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{error}</p>
      <button onClick={fetchData} style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: 12, padding: '10px 24px', fontWeight: 700, cursor: 'pointer' }}>Retry</button>
    </div>
  );

  return (
    <div className="pro-dashboard-root">

      {/* ── HERO HEADER ── */}
      <div className="pro-hero-header">
        <div className="pro-hero-bg" />
        <div className="pro-hero-content">
          <div className="pro-hero-left">
            <div className="pro-hero-avatar">{getInitials(professional.full_name)}</div>
            <div>
              <div className="pro-hero-greeting">Welcome back 👋</div>
              <h1 className="pro-hero-name">{professional.full_name?.split(' ')[0] || "Professional"}</h1>
              <button
                className={`pro-online-pill ${isOnline ? 'online' : 'offline'}`}
                onClick={() => setIsOnline(!isOnline)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 5 }}
              >
                <span className="pro-online-dot" />
                {isOnline ? "Online · Tap to go offline" : "Offline · Tap to go online"}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                className="pro-bell-btn"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (unreadCount > 0 && !showNotifications) markAllRead();
                }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="pro-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    {notifications.length > 0 && <button onClick={markAllRead}>Mark all read</button>}
                  </div>
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="notification-empty">No new notifications</div>
                    ) : notifications.map(n => (
                      <div key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                        <div className="notification-title">{n.title}</div>
                        <div className="notification-message">{n.message}</div>
                        <div className="notification-time">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── EARNINGS SPOTLIGHT CARD ── */}
      <div className="pro-earnings-card">
        <div className="pro-earnings-left">
          <div className="pro-earnings-label">Total Earnings</div>
          <div className="pro-earnings-amount">₹{(stats?.total_earnings || 0).toLocaleString()}</div>
          <button className="pro-earnings-cta" onClick={() => navigate('/profile')}>
            Withdraw <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="pro-earnings-right">
          <div className="pro-completion-ring">
            <svg viewBox="0 0 80 80" width="80" height="80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="8" />
              <circle
                cx="40" cy="40" r="32" fill="none"
                stroke="var(--accent-primary)" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - completionRate / 100)}`}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="pro-ring-label">
              <span className="pro-ring-val">{completionRate}%</span>
              <span className="pro-ring-sub">Done</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS ROW (clickable → navigate to requests) ── */}
      <div className="pro-stats-row">
        <button className="pro-stat-chip blue" onClick={() => navigate('/requests')} style={{ border: 'none', cursor: 'pointer' }}>
          <div className="pro-stat-chip-icon"><ClipboardList size={18} /></div>
          <div className="pro-stat-chip-val">{stats?.total_requests || 0}</div>
          <div className="pro-stat-chip-label">Total</div>
        </button>
        <button className="pro-stat-chip amber" onClick={() => navigate('/requests')} style={{ border: 'none', cursor: 'pointer' }}>
          <div className="pro-stat-chip-icon"><Clock size={18} /></div>
          <div className="pro-stat-chip-val">{stats?.pending_requests || 0}</div>
          <div className="pro-stat-chip-label">Pending</div>
        </button>
        <button className="pro-stat-chip green" onClick={() => navigate('/requests')} style={{ border: 'none', cursor: 'pointer' }}>
          <div className="pro-stat-chip-icon"><CheckCheck size={18} /></div>
          <div className="pro-stat-chip-val">{stats?.completed_requests || 0}</div>
          <div className="pro-stat-chip-label">Done</div>
        </button>
        <button className="pro-stat-chip purple" style={{ border: 'none', cursor: 'default' }}>
          <div className="pro-stat-chip-icon"><Star size={18} fill="currentColor" /></div>
          <div className="pro-stat-chip-val">4.9</div>
          <div className="pro-stat-chip-label">Rating</div>
        </button>
      </div>

      {/* ── ACHIEVEMENT BADGES ── */}
      <div className="pro-section">
        <div className="pro-section-head">
          <h2>Highlights</h2>
        </div>
        <div className="pro-badges-row">
          <div className="pro-badge-card">
            <div className="pro-badge-icon" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
              <ShieldCheck size={20} />
            </div>
            <div className="pro-badge-info">
              <div className="pro-badge-title">Verified Professional</div>
              <div className="pro-badge-sub">Identity & documents confirmed</div>
            </div>
          </div>
          <div className="pro-badge-card">
            <div className="pro-badge-icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}>
              <Star size={20} fill="currentColor" />
            </div>
            <div className="pro-badge-info">
              <div className="pro-badge-title">Top Rated</div>
              <div className="pro-badge-sub">4.9 average across all jobs</div>
            </div>
          </div>
          <div className="pro-badge-card">
            <div className="pro-badge-icon" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
              <Zap size={20} />
            </div>
            <div className="pro-badge-info">
              <div className="pro-badge-title">Fast Responder</div>
              <div className="pro-badge-sub">Replies in under 5 minutes</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RECENT JOBS (real DB data) ── */}
      <div className="pro-section" style={{ paddingBottom: 100 }}>
        <div className="pro-section-head">
          <h2>Recent Jobs</h2>
          <button className="pro-view-all-btn" onClick={() => navigate('/requests')}>
            View all <ChevronRight size={14} />
          </button>
        </div>

        {recentRequests.length === 0 ? (
          <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 16, padding: '32px 20px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>No jobs yet</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>When customers book your service, they'll show up here.</div>
          </div>
        ) : (
          <div className="pro-jobs-list">
            {recentRequests.map(req => {
              const statusStyle = getStatusStyle(req.status);
              const initials = (req.customer_name || 'C').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
              const isPending = req.status === 'pending' && req.offer_status === 'pending';
              const isPaid = req.payment_status === 'paid';
              return (
                <div key={req.id} className={`pro-job-card ${req.status}`} onClick={() => navigate('/requests')} style={{ cursor: 'pointer' }}>
                  <div className="pro-job-left">
                    <div className="pro-job-avatar" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                      {initials}
                    </div>
                    <div>
                      <div className="pro-job-title">{req.title || req.customer_name}</div>
                      <div className="pro-job-meta">
                        {req.customer_name}
                        {req.requested_at && ` · ${new Date(req.requested_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                      </div>
                    </div>
                  </div>
                  <div className="pro-job-right">
                    {isPaid ? (
                      <span className="pro-job-status" style={{ background: '#D1FAE5', color: '#065F46' }}>Paid</span>
                    ) : (
                      <span className="pro-job-status" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                        {statusStyle.label}
                      </span>
                    )}
                    {req.wage && (
                      <div className="pro-job-earnings">₹{Number(req.wage).toLocaleString()}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
