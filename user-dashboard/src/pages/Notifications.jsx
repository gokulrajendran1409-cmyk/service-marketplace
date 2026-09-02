import { useEffect, useState, useCallback } from 'react';
import { Bell, BellOff, Check, CheckCheck, Clock, Trash2 } from 'lucide-react';
import { API } from '../constants';

const NOTIFICATION_ICONS = {
    request_accepted: '✅',
    journey_update: '🚗',
    arrival: '📍',
    work_started: '🔧',
    work_completed: '✨',
    payment_ready: '💰',
    payment_confirmed: '💳',
    professional_review: '⭐'
};

function Notifications({ navigate }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filter, setFilter] = useState('all');

    const fetchNotifications = useCallback(async () => {
        try {
            const token = localStorage.getItem('userToken');
            const res = await fetch(`${API}/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch notifications');
            const data = await res.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Real-time updates via SSE
    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) return;

        let eventSource = null;

        try {
            eventSource = new EventSource(`${API}/notifications/stream?token=${token}`);

            eventSource.addEventListener('requestUpdate', () => {
                fetchNotifications();
            });

            eventSource.addEventListener('open', () => {
                console.log('✅ Notifications SSE connection established');
            });

            eventSource.addEventListener('error', () => {
                if (eventSource.readyState === EventSource.CLOSED) {
                    eventSource.close();
                }
            });
        } catch (e) {
            console.error('Failed to create EventSource:', e);
        }

        return () => {
            if (eventSource) {
                eventSource.close();
            }
        };
    }, [fetchNotifications]);

    const markAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem('userToken');
            const res = await fetch(`${API}/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to mark as read');
            setNotifications(current =>
                current.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const res = await fetch(`${API}/notifications/read-all`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to mark all as read');
            setNotifications(current => current.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            const token = localStorage.getItem('userToken');
            const res = await fetch(`${API}/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete notification');
            const notification = notifications.find(n => n.id === notificationId);
            setNotifications(current => current.filter(n => n.id !== notificationId));
            if (notification && !notification.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.is_read;
        return true;
    });

    return (
        <div className="page-container">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h1 className="page-title">Notifications</h1>
                        <p className="page-subtitle">Stay updated with your service requests.</p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="btn-hire"
                            style={{ width: 'auto', padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                            <CheckCheck size={14} />
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="request-filter-bar" role="tablist" aria-label="Filter notifications">
                <button
                    className={`filter-btn-all ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                    role="tab"
                    aria-selected={filter === 'all'}
                >
                    All
                    <span>{notifications.length}</span>
                </button>
                <button
                    className={`filter-btn-active ${filter === 'unread' ? 'active' : ''}`}
                    onClick={() => setFilter('unread')}
                    role="tab"
                    aria-selected={filter === 'unread'}
                >
                    Unread
                    <span>{unreadCount}</span>
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <div className="spin" style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid var(--accent-light)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%' }} />
                </div>
            ) : filteredNotifications.length === 0 ? (
                <div className="empty-state" style={{ marginTop: 60 }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <Bell size={32} />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                        {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {filter === 'unread'
                            ? 'All caught up! You have no unread notifications.'
                            : "When professionals respond to your requests or update their status, you'll see it here."
                        }
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {filteredNotifications.map(notification => (
                        <div
                            key={notification.id}
                            style={{
                                background: notification.is_read ? 'var(--bg-secondary)' : 'var(--accent-light)',
                                borderRadius: 12,
                                padding: '16px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 12,
                                transition: 'all 0.2s ease',
                                border: notification.is_read ? '1px solid var(--border-color)' : '1px solid var(--accent-primary)'
                            }}
                        >
                            {/* Icon */}
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: 'var(--bg-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 18,
                                flexShrink: 0
                            }}>
                                {NOTIFICATION_ICONS[notification.type] || '🔔'}
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                                    <h4 style={{
                                        fontSize: 14,
                                        fontWeight: notification.is_read ? 500 : 700,
                                        color: 'var(--text-primary)',
                                        marginBottom: 4
                                    }}>
                                        {notification.title}
                                    </h4>
                                    {!notification.is_read && (
                                        <span style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background: 'var(--accent-primary)',
                                            flexShrink: 0,
                                            marginTop: 6
                                        }} />
                                    )}
                                </div>
                                <p style={{
                                    fontSize: 13,
                                    color: 'var(--text-secondary)',
                                    lineHeight: 1.4,
                                    marginBottom: 8
                                }}>
                                    {notification.message}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Clock size={12} color="var(--text-muted)" />
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        {formatTime(notification.created_at)}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                {!notification.is_read && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                                        title="Mark as read"
                                        style={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: 6,
                                            border: 'none',
                                            background: 'var(--accent-light)',
                                            color: 'var(--accent-primary)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Check size={14} />
                                    </button>
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                                    title="Delete"
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: 6,
                                        border: 'none',
                                        background: 'transparent',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Notifications;
