import { useEffect, useState, useCallback } from 'react';
import { Bell, Check, CheckCheck, Clock, Trash2 } from 'lucide-react';
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
                console.log('Notifications SSE connection established');
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
            <div className="notification-page-header">
                <div>
                    <h1 className="page-title">Notifications</h1>
                    <p className="page-subtitle">Stay updated with your service requests.</p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="mark-all-read-btn"
                    >
                        <CheckCheck size={14} />
                        Mark all read
                    </button>
                )}
            </div>

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
                <div className="empty-state" style={{ marginTop: 24 }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <Bell size={32} />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
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
                <div className="notifications-list">
                    {filteredNotifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`notification-card ${!notification.is_read ? 'unread' : ''}`}
                        >
                            <div className="notification-icon">
                                {NOTIFICATION_ICONS[notification.type] || '🔔'}
                            </div>

                            <div className="notification-content">
                                <div className="notification-header">
                                    <h4 className="notification-title">
                                        {notification.title}
                                    </h4>
                                    {!notification.is_read && (
                                        <span className="notification-unread-dot" />
                                    )}
                                </div>
                                <p className="notification-message">
                                    {notification.message}
                                </p>
                                <div className="notification-meta">
                                    <Clock size={12} />
                                    <span className="notification-time">
                                        {formatTime(notification.created_at)}
                                    </span>
                                </div>
                            </div>

                            <div className="notification-actions">
                                {!notification.is_read && (
                                    <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="notification-action-btn mark-read"
                                        title="Mark as read"
                                    >
                                        <Check size={14} />
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteNotification(notification.id)}
                                    className="notification-action-btn"
                                    title="Delete"
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
