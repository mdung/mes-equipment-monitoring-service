-- Create user notifications table (inbox)
CREATE TABLE user_notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- ALERT, SYSTEM, REPORT, MAINTENANCE, QUALITY
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20), -- INFO, WARNING, ERROR, CRITICAL
    source_type VARCHAR(50), -- ALERT, EQUIPMENT, ORDER, DEFECT, REPORT
    source_id BIGINT,
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Create notification preferences table
CREATE TABLE notification_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    web_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT false,
    min_severity VARCHAR(20) DEFAULT 'INFO', -- INFO, WARNING, ERROR, CRITICAL
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, notification_type)
);

-- Create notification delivery log table
CREATE TABLE notification_delivery_log (
    id BIGSERIAL PRIMARY KEY,
    notification_id BIGINT REFERENCES user_notifications(id) ON DELETE CASCADE,
    delivery_method VARCHAR(20) NOT NULL, -- EMAIL, SMS, WEB, PUSH
    delivery_status VARCHAR(20) NOT NULL, -- PENDING, SENT, DELIVERED, FAILED
    recipient VARCHAR(255),
    error_message TEXT,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add notification preferences to alert rules
ALTER TABLE alert_rules ADD COLUMN IF NOT EXISTS notification_users JSONB;
ALTER TABLE alert_rules ADD COLUMN IF NOT EXISTS notification_roles JSONB;

-- Indexes
CREATE INDEX idx_user_notifications_user ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_read ON user_notifications(is_read);
CREATE INDEX idx_user_notifications_archived ON user_notifications(is_archived);
CREATE INDEX idx_user_notifications_created ON user_notifications(created_at);
CREATE INDEX idx_user_notifications_type ON user_notifications(notification_type);
CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX idx_notification_delivery_log_notification ON notification_delivery_log(notification_id);
CREATE INDEX idx_notification_delivery_log_status ON notification_delivery_log(delivery_status);

-- Insert default notification preferences for existing users
INSERT INTO notification_preferences (user_id, notification_type, email_enabled, web_enabled)
SELECT id, 'ALERT', true, true FROM users
ON CONFLICT (user_id, notification_type) DO NOTHING;

INSERT INTO notification_preferences (user_id, notification_type, email_enabled, web_enabled)
SELECT id, 'SYSTEM', true, true FROM users
ON CONFLICT (user_id, notification_type) DO NOTHING;

INSERT INTO notification_preferences (user_id, notification_type, email_enabled, web_enabled)
SELECT id, 'REPORT', true, false FROM users
ON CONFLICT (user_id, notification_type) DO NOTHING;

INSERT INTO notification_preferences (user_id, notification_type, email_enabled, web_enabled)
SELECT id, 'MAINTENANCE', true, true FROM users
ON CONFLICT (user_id, notification_type) DO NOTHING;

INSERT INTO notification_preferences (user_id, notification_type, email_enabled, web_enabled)
SELECT id, 'QUALITY', true, true FROM users
ON CONFLICT (user_id, notification_type) DO NOTHING;
