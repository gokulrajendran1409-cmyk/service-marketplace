const db = require('../db');

const NOTIFICATION_TYPES = {
    REQUEST_ACCEPTED: 'request_accepted',
    JOURNEY_UPDATE: 'journey_update',
    ARRIVAL: 'arrival',
    WORK_STARTED: 'work_started',
    WORK_COMPLETED: 'work_completed',
    PAYMENT_READY: 'payment_ready',
    PAYMENT_CONFIRMED: 'payment_confirmed',
    PROFESSIONAL_REVIEW: 'professional_review'
};

const JOURNEY_MESSAGES = {
    start_navigation: { title: 'Professional Started Navigation', message: (name) => `${name} has started navigating to your location.` },
    on_the_way: { title: 'Professional On The Way', message: (name) => `${name} is on the way to your location.` },
    arrived: { title: 'Professional Has Arrived', message: (name) => `${name} has arrived at your location.` },
    working: { title: 'Work In Progress', message: (name) => `${name} has started working on your request.` },
    completed: { title: 'Work Completed', message: (name) => `${name} has completed the work.` }
};

async function createNotification({ userId, type, title, message, requestId = null, professionalId = null, metadata = {} }) {
    try {
        console.log('Creating notification:', { userId, type, title, message, requestId, professionalId });
        const result = await db.query(
            `INSERT INTO notifications (user_id, type, title, message, request_id, professional_id, metadata)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [userId, type, title, message, requestId, professionalId, JSON.stringify(metadata)]
        );
        console.log('Notification created successfully:', result.rows[0]);
        return result.rows[0];
    } catch (err) {
        console.error('Error creating notification:', err);
        return null;
    }
}

async function createJourneyNotification({ userId, professionalName, journeyStatus, requestId, professionalId }) {
    const journeyInfo = JOURNEY_MESSAGES[journeyStatus];
    if (!journeyInfo) return null;

    return createNotification({
        userId,
        type: NOTIFICATION_TYPES.JOURNEY_UPDATE,
        title: journeyInfo.title,
        message: journeyInfo.message(professionalName),
        requestId,
        professionalId,
        metadata: { journey_status: journeyStatus }
    });
}

async function getNotificationsByUserId(userId, { limit = 50, offset = 0, unreadOnly = false } = {}) {
    try {
        let query = `SELECT * FROM notifications WHERE user_id = $1`;
        const params = [userId];

        if (unreadOnly) {
            query += ` AND is_read = FALSE`;
        }

        query += ` ORDER BY created_at DESC`;

        if (limit) {
            params.push(limit);
            query += ` LIMIT $${params.length}`;
        }

        if (offset) {
            params.push(offset);
            query += ` OFFSET $${params.length}`;
        }

        const result = await db.query(query, params);
        return result.rows;
    } catch (err) {
        console.error('Error fetching notifications:', err);
        return [];
    }
}

async function getUnreadCount(userId) {
    try {
        const result = await db.query(
            `SELECT COUNT(*)::int as count FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
            [userId]
        );
        return result.rows[0]?.count || 0;
    } catch (err) {
        console.error('Error fetching unread count:', err);
        return 0;
    }
}

async function markAsRead(notificationId, userId) {
    try {
        const result = await db.query(
            `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *`,
            [notificationId, userId]
        );
        return result.rows[0] || null;
    } catch (err) {
        console.error('Error marking notification as read:', err);
        return null;
    }
}

async function markAllAsRead(userId) {
    try {
        await db.query(
            `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`,
            [userId]
        );
        return true;
    } catch (err) {
        console.error('Error marking all notifications as read:', err);
        return false;
    }
}

async function deleteNotification(notificationId, userId) {
    try {
        const result = await db.query(
            `DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id`,
            [notificationId, userId]
        );
        return result.rows.length > 0;
    } catch (err) {
        console.error('Error deleting notification:', err);
        return false;
    }
}

module.exports = {
    NOTIFICATION_TYPES,
    JOURNEY_MESSAGES,
    createNotification,
    createJourneyNotification,
    getNotificationsByUserId,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
};
