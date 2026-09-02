import { useEffect, useRef, useState, useCallback } from "react";

const MAX_STORED = 50; // keep at most 50 notifications in memory

// Match the base URL used by every other fetch in the professional dashboard.
const API_BASE = import.meta.env.DEV
    ? "http://localhost:5000"
    : "https://service-marketplace-af7p.onrender.com";

/**
 * Connects to the server's SSE stream and returns:
 *   notifications  – array of received notification objects (newest first)
 *   unreadCount    – number of unread notifications
 *   markAllRead    – function to clear the unread badge
 *   clearAll       – function to wipe the notification list
 */
export function useProfessionalNotifications(professionalId) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const esRef = useRef(null);
    const retryTimer = useRef(null);

    const connect = useCallback(() => {
        // Close any old connection first
        if (esRef.current) esRef.current.close();
        if (!professionalId) return;

        // Native browser EventSource does NOT support custom Authorization headers.
        // To keep SSE authenticated, we pass the JWT via the ?token= query param.
        // The backend `protect` middleware extracts and JWT-verifies it exactly like
        // a Bearer header; the param is then stripped from req.query so it never
        // leaks into generic request logs / error renders.
        const token = localStorage.getItem("professionalToken");
        if (!token) return;

        const SSE_URL = `${API_BASE}/api/professionals/notifications/stream/${professionalId}?token=${token}`;
        const es = new EventSource(SSE_URL);
        esRef.current = es;

        // New service request
        es.addEventListener("new_service_request", (e) => {
            try {
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

        es.onerror = () => {
            es.close();
            // Reconnect after 5 s
            retryTimer.current = setTimeout(connect, 5_000);
        };
    }, [professionalId]);

    useEffect(() => {
        connect();
        return () => {
            esRef.current?.close();
            clearTimeout(retryTimer.current);
        };
    }, [connect]);

    const markAllRead = useCallback(() => {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    return { notifications, unreadCount, markAllRead, clearAll };
}

