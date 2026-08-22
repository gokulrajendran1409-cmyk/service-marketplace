import { useEffect, useRef, useState, useCallback } from "react";

const MAX_STORED = 50; // keep at most 50 notifications in memory

/**
 * Connects to the server's SSE stream and returns:
 *   notifications  – array of received notification objects (newest first)
 *   unreadCount    – number of unread notifications
 *   markAllRead    – function to clear the unread badge
 *   clearAll       – function to wipe the notification list
 */
export function useProfessionalNotifications(professionalId) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount]     = useState(0);
    const esRef = useRef(null);
    const retryTimer = useRef(null);

    const connect = useCallback(() => {
        // Close any old connection first
        if (esRef.current) esRef.current.close();
        if (!professionalId) return;

        const SSE_URL = `https://service-marketplace-af7p.onrender.com/api/professionals/notifications/stream/${professionalId}`;
        const es = new EventSource(SSE_URL);
        esRef.current = es;

        // New service request
        es.addEventListener("new_service_request", (e) => {
            try {
                const data = JSON.parse(e.data);
                const notification = {
                    id:        Date.now(),
                    type:      "new_service_request",
                    title:     "New Service Request",
                    message:   `${data.customer_name} requested your service!`,
                    timestamp: data.timestamp || new Date().toISOString(),
                    read:      false,
                    raw:       data,
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
