import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Award,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  CheckCheck,
  Navigation,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { API } from '../constants';

function Notifications({ navigate }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) return;
      const res = await fetch(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) return;
      await fetch(`${API}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    const unread = notifications.filter((n) => !n.is_read);
    for (const item of unread) {
      await markAsRead(item.id);
    }
    setMarkingAll(false);
  };

  const handleAction = (item) => {
    markAsRead(item.id);
    navigate('requests');
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      const diffMins = Math.round((Date.now() - d.getTime()) / 60000);
      if (diffMins < 2) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
      return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="page-container" style={{ paddingBottom: 80 }}>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Stay updated with your service requests & specialists.</p>
        </div>
        <button
          className="visily-action-circle-btn"
          onClick={fetchNotifications}
          title="Refresh notifications"
          style={{ width: 38, height: 38 }}
        >
          <RefreshCw size={17} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* Filter and Mark All Read Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`notif-filter-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </button>
          <button
            className={`notif-filter-pill ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({notifications.filter((n) => !n.is_read).length})
          </button>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <button
            className="notif-mark-all-btn"
            onClick={markAllAsRead}
            disabled={markingAll}
          >
            <CheckCheck size={14} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading && notifications.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
          <div className="spin" style={{ width: 28, height: 28, border: '3px solid #00796B', borderTopColor: 'transparent', borderRadius: '50%' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(0, 121, 107, 0.1)',
              color: '#00796B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Bell size={32} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#0F172A' }}>
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p style={{ color: '#64748B', maxWidth: 320, margin: '0 auto' }}>
            When professionals accept your bookings, arrive nearby, or complete tasks, you will receive real-time updates here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((item) => {
            const isAccepted = item.type === 'request_accepted';
            const isNearby = item.type === 'nearby_arrival';
            const isCompleted = item.type === 'task_completed';

            return (
              <div
                key={item.id}
                className={`notif-card ${!item.is_read ? 'unread' : ''}`}
                onClick={() => handleAction(item)}
              >
                {/* Notification Icon */}
                <div
                  className="notif-card-icon"
                  style={{
                    background: isCompleted
                      ? '#ECFDF5'
                      : isNearby
                      ? '#FFFBEB'
                      : '#F0FDFA',
                    color: isCompleted
                      ? '#059669'
                      : isNearby
                      ? '#D97706'
                      : '#00796B',
                  }}
                >
                  {isCompleted ? (
                    <Award size={22} />
                  ) : isNearby ? (
                    <MapPin size={22} />
                  ) : (
                    <CheckCircle2 size={22} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                    <strong style={{ fontSize: 14, color: '#0F172A' }}>
                      {item.title || (isCompleted ? 'Service Completed' : isNearby ? 'Specialist Arriving Nearby' : 'Request Accepted')}
                    </strong>
                    <span style={{ fontSize: 11, color: '#94A3B8', whiteSpace: 'nowrap' }}>
                      {formatTimestamp(item.created_at)}
                    </span>
                  </div>

                  <p style={{ fontSize: 12.5, color: '#475569', margin: '4px 0 8px', lineHeight: 1.45 }}>
                    {item.message}
                  </p>

                  {/* Action tag */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="notif-action-tag">
                      {isCompleted
                        ? 'View Invoice & Details →'
                        : isNearby
                        ? 'View Live Location →'
                        : 'Track Specialist Live →'}
                    </span>
                    {!item.is_read && <span className="notif-unread-dot" />}
                  </div>
                </div>

                <ChevronRight size={18} color="#94A3B8" style={{ flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notifications;
