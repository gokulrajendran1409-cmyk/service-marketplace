const pool = require('../config/database');
const { notifyCustomer } = require('../utils/customerSseClients');
const { notifyPro } = require('../utils/proSseClients');
const { broadcast } = require('../utils/sseClients');

let schedulerInterval = null;

/**
 * Checks for upcoming service bookings starting in ~1 hour (within 60 minutes)
 * and sends reminder notifications to both the customer and the selected professional.
 * All reminder notifications are persisted into the `notifications` table with deduplication.
 */
async function checkAndSend1HourReminders() {
    try {
        // Query active requests scheduled within the next 60 minutes that have not passed over 15 minutes ago
        const eligibleRequests = await pool.query(`
            SELECT sr.id, sr.title, sr.customer_id, sr.location, sr.requested_at, sr.status, sr.journey_status,
                   u.name as customer_name,
                   selected_pro.id as professional_id,
                   selected_pro.user_id as professional_user_id,
                   selected_pro.full_name as professional_name
            FROM service_requests sr
            JOIN users u ON u.id = sr.customer_id
            LEFT JOIN LATERAL (
                SELECT p.id, p.user_id, p.full_name
                FROM service_offers so
                JOIN professionals p ON p.id = so.professional_id
                WHERE so.request_id = sr.id AND (so.status = 'accepted' OR so.status = 'pending')
                ORDER BY CASE WHEN so.status = 'accepted' THEN 0 ELSE 1 END, so.id
                LIMIT 1
            ) selected_pro ON true
            WHERE sr.status NOT IN ('cancelled', 'completed')
              AND sr.journey_status NOT IN ('working', 'awaiting_payment', 'completed')
              AND sr.requested_at IS NOT NULL
              AND sr.requested_at <= (CURRENT_TIMESTAMP + INTERVAL '60 minutes')
              AND sr.requested_at >= (CURRENT_TIMESTAMP - INTERVAL '15 minutes')
        `);

        for (const req of eligibleRequests.rows) {
            const formattedTime = new Date(req.requested_at).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            const formattedDate = new Date(req.requested_at).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric'
            });

            const proName = req.professional_name || 'Your Assigned Specialist';
            const customerName = req.customer_name || 'Customer';
            const serviceTitle = req.title || 'Service';

            // 1. Customer Reminder Notification (Reminding user about the pre-booked service)
            const customerTitle = 'Service Reminder: Starting in 1 Hour ⏰';
            const customerMessage = `Reminder: Your pre-booked service "${serviceTitle}" is scheduled in 1 hour (at ${formattedTime}) with ${proName}. Please be available at your location (${req.location}).`;
            const customerMetadata = {
                requestId: req.id,
                serviceTitle: serviceTitle,
                requestedAt: req.requested_at,
                location: req.location,
                professionalName: proName,
                reminderType: '1_hour_prior',
                formattedTime: `${formattedDate}, ${formattedTime}`
            };

            const customerNotifRes = await pool.query(`
                INSERT INTO notifications (user_id, request_id, type, title, message, is_read, professional_id, metadata, created_at)
                VALUES ($1, $2, 'service_reminder_customer', $3, $4, false, $5, $6, CURRENT_TIMESTAMP)
                ON CONFLICT (user_id, request_id, type) DO NOTHING
                RETURNING id, created_at
            `, [
                req.customer_id,
                req.id,
                customerTitle,
                customerMessage,
                req.professional_id || null,
                JSON.stringify(customerMetadata)
            ]);

            // If newly inserted into database, dispatch real-time SSE to customer
            if (customerNotifRes.rows.length > 0) {
                const notifId = customerNotifRes.rows[0].id;
                notifyCustomer(req.customer_id, 'serviceReminder', {
                    id: `notif_${notifId}`,
                    type: 'service_reminder_customer',
                    request_id: req.id,
                    title: customerTitle,
                    message: customerMessage,
                    metadata: customerMetadata,
                    timestamp: customerNotifRes.rows[0].created_at
                });
                notifyCustomer(req.customer_id, 'notification', {
                    id: `notif_${notifId}`,
                    type: 'service_reminder_customer',
                    request_id: req.id,
                    title: customerTitle,
                    message: customerMessage,
                    metadata: customerMetadata,
                    timestamp: customerNotifRes.rows[0].created_at
                });
                console.log(`[ReminderService] Stored & dispatched 1-hr reminder to customer #${req.customer_id} for request #${req.id}`);
            }

            // 2. Selected Provider Reminder Notification (Reminding provider not to be late)
            if (req.professional_id && req.professional_user_id) {
                const proTitle = 'Upcoming Job Reminder: Starting in 1 Hour ⏰';
                const proMessage = `Reminder: Your scheduled service "${serviceTitle}" for ${customerName} starts in 1 hour (at ${formattedTime}) at ${req.location}. Please prepare and travel on time to avoid being late!`;
                const proMetadata = {
                    requestId: req.id,
                    serviceTitle: serviceTitle,
                    requestedAt: req.requested_at,
                    location: req.location,
                    customerName: customerName,
                    reminderType: '1_hour_prior',
                    formattedTime: `${formattedDate}, ${formattedTime}`
                };

                const proNotifRes = await pool.query(`
                    INSERT INTO notifications (user_id, request_id, type, title, message, is_read, professional_id, metadata, created_at)
                    VALUES ($1, $2, 'service_reminder_pro', $3, $4, false, $5, $6, CURRENT_TIMESTAMP)
                    ON CONFLICT (user_id, request_id, type) DO NOTHING
                    RETURNING id, created_at
                `, [
                    req.professional_user_id,
                    req.id,
                    proTitle,
                    proMessage,
                    req.professional_id,
                    JSON.stringify(proMetadata)
                ]);

                // If newly inserted into database, dispatch real-time SSE to professional
                if (proNotifRes.rows.length > 0) {
                    const proNotifId = proNotifRes.rows[0].id;
                    notifyPro(Number(req.professional_id), 'job_reminder', {
                        id: `notif_${proNotifId}`,
                        type: 'service_reminder_pro',
                        request_id: req.id,
                        title: proTitle,
                        message: proMessage,
                        metadata: proMetadata,
                        timestamp: proNotifRes.rows[0].created_at
                    });
                    console.log(`[ReminderService] Stored & dispatched 1-hr reminder to provider #${req.professional_id} for request #${req.id}`);
                }
            }
        }
    } catch (err) {
        console.error('[ReminderService] Error checking 1-hour reminders:', err);
    }
}

/**
 * Starts the periodic background checker for 1-hour service reminders
 * @param {number} intervalMs - Polling interval in milliseconds (defaults to 30s)
 */
function startReminderScheduler(intervalMs = 30000) {
    if (schedulerInterval) {
        clearInterval(schedulerInterval);
    }

    // Run once immediately on startup
    checkAndSend1HourReminders();

    // Schedule regular polling
    schedulerInterval = setInterval(checkAndSend1HourReminders, intervalMs);
    console.log(`[ReminderService] 1-hour service reminder scheduler started (interval: ${intervalMs / 1000}s)`);
}

function stopReminderScheduler() {
    if (schedulerInterval) {
        clearInterval(schedulerInterval);
        schedulerInterval = null;
    }
}

module.exports = {
    checkAndSend1HourReminders,
    startReminderScheduler,
    stopReminderScheduler
};
