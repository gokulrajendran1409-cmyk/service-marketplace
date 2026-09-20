import { useEffect, useRef, useState, useCallback } from "react";

const MAX_STORED = 50; // keep at most 50 notifications in memory

// Match the base URL used by every other fetch in the professional dashboard.
const API_BASE = import.meta.env.DEV
    ? "http://localhost:5000"
    : "https://service-marketplace-af7p.onrender.com";

/**
 * Connects to the server's SSE stream and loads persistent notifications from the database.
 * Returns:
 *   notifications  – array of received notification objects (newest first)
 *   unreadCount    – number of unread notifications
 *   markAllRead    – function to clear the unread badge and update database
 *   clearAll       – function to wipe the notification list
 */
export function useProfessionalNotifications(professionalId) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const esRef = useRef(null);
    const retryTimer = useRef(null);

    // Fetch persistent notifications stored in the database
    const fetchStoredNotifications = useCallback(async () => {
        const token = localStorage.getItem("professionalToken");
        if (!token || !professionalId) return;

        try {
            const res = await fetch(`${API_BASE}/api/professionals/notifications`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data.notifications)) {
                    setNotifications(data.notifications.slice(0, MAX_STORED));
                    setUnreadCount(data.unreadCount || 0);
                }
            }
        } catch (err) {
            console.warn("Could not fetch stored professional notifications:", err.message);
        }
    }, [professionalId]);

    const connect = useCallback(() => {
        // Close any old connection first
        if (esRef.current) esRef.current.close();
        if (!professionalId) return;

        const token = localStorage.getItem("professionalToken");
        const professional = JSON.parse(localStorage.getItem("professional") || "{}");
        if (!token || professional.verification_status !== 'verified') return;

        // Load stored DB notifications first
        fetchStoredNotifications();

        const SSE_URL = `${API_BASE}/api/professionals/notifications/stream/${professionalId}?token=${token}`;
        const es = new EventSource(SSE_URL);
        esRef.current = es;

        // 1. New service request event
        es.addEventListener("new_service_request", (e) => {
            try {
                const pro = JSON.parse(localStorage.getItem("professional") || "{}");
                if (!pro.is_online) {
                    // Professional is offline - do not receive job notification
                    return;
                }
                const data = JSON.parse(e.data);
                const notification = {
                    id: Date.now(),
                    type: "new_service_request",
                    title: "New Service Request",
                    message: `${data.customer_name} requested your service!`,
                    timestamp: data.timestamp || new Date().toISOString(),
                    read: false,
                    raw: data,
                };
                setNotifications((prev) =>
                    [notification, ...prev].slice(0, MAX_STORED)
                );
                setUnreadCount((n) => n + 1);
            } catch {
                // malformed payload – ignore
            }
        });

        // 2. 1-Hour Prior Job Reminder event
        es.addEventListener("job_reminder", (e) => {
            try {
                const data = JSON.parse(e.data);
                const notification = {
                    id: data.id || Date.now(),
                    type: "service_reminder_pro",
                    title: data.title || "Upcoming Job Reminder: Starting in 1 Hour ⏰",
                    message: data.message || "Your scheduled service starts in 1 hour. Please prepare and travel on time!",
                    timestamp: data.timestamp || new Date().toISOString(),
                    read: false,
                    raw: data,
                };
                setNotifications((prev) => {
                    // Avoid duplicating if notification with same id already exists
                    if (prev.some((n) => n.id === notification.id)) return prev;
                    return [notification, ...prev].slice(0, MAX_STORED);
                });
                setUnreadCount((n) => n + 1);
            } catch (err) {
                console.warn("Could not parse job_reminder event:", err);
            }
        });

        es.onerror = () => {
            es.close();
            // Reconnect after 5 s
            retryTimer.current = setTimeout(connect, 5_000);
        };
    }, [professionalId, fetchStoredNotifications]);

    useEffect(() => {
        connect();
        return () => {
            esRef.current?.close();
            clearTimeout(retryTimer.current);
        };
    }, [connect]);

    const markAllRead = useCallback(async () => {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

        // Persist read status to database for stored notifications
        const token = localStorage.getItem("professionalToken");
        if (!token) return;

        notifications.forEach((n) => {
            if (!n.read && Number.isInteger(Number(n.id))) {
                fetch(`${API_BASE}/api/professionals/notifications/${n.id}/read`, {
                    method: 'PATCH',
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => {});
            }
        });
    }, [notifications]);

    const clearAll = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    return { notifications, unreadCount, markAllRead, clearAll };
}
