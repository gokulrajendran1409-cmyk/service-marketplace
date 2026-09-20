-- Migration 019: Persist notification read status and ensure uniqueness

-- 1. Create unique index on user_id, request_id, and type for idempotent upserts
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_user_request_type 
ON notifications(user_id, request_id, type);

-- 2. Mark existing past completed requests as read so they are not repeatedly shown on user login
INSERT INTO notifications (user_id, request_id, type, title, message, is_read, created_at)
SELECT 
  sr.customer_id, 
  sr.id, 
  'task_completed', 
  'Task Completed! 🎉', 
  'Service completed', 
  true, 
  sr.updated_at
FROM service_requests sr
WHERE sr.status = 'completed' OR sr.journey_status = 'completed'
ON CONFLICT (user_id, request_id, type) 
DO UPDATE SET is_read = true;
