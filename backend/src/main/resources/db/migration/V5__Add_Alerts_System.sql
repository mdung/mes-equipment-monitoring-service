-- Alert Rules Configuration
CREATE TABLE alert_rules (
    id BIGSERIAL PRIMARY KEY,
    rule_name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(50) NOT NULL, -- EQUIPMENT_DOWN, HIGH_TEMPERATURE, HIGH_VIBRATION, LOW_STOCK, QUALITY_FAILURE, PRODUCTION_DELAY
    severity VARCHAR(20) NOT NULL, -- CRITICAL, HIGH, MEDIUM, LOW
    condition_field VARCHAR(100), -- temperature, vibration, stock_level, etc.
    condition_operator VARCHAR(20), -- GT, LT, EQ, GTE, LTE
    condition_value DECIMAL(10, 2),
    equipment_id BIGINT REFERENCES equipment(id),
    is_active BOOLEAN DEFAULT true,
    notification_email BOOLEAN DEFAULT true,
    notification_sms BOOLEAN DEFAULT false,
    notification_websocket BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alert History
CREATE TABLE alert_history (
    id BIGSERIAL PRIMARY KEY,
    alert_rule_id BIGINT REFERENCES alert_rules(id),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    equipment_id BIGINT REFERENCES equipment(id),
    equipment_name VARCHAR(255),
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by VARCHAR(100),
    acknowledged_at TIMESTAMP,
    resolved BOOLEAN DEFAULT false,
    resolved_by VARCHAR(100),
    resolved_at TIMESTAMP,
    notes TEXT
);

-- Alert Escalation Rules
CREATE TABLE alert_escalations (
    id BIGSERIAL PRIMARY KEY,
    alert_rule_id BIGINT NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
    escalation_level INTEGER NOT NULL,
    escalation_delay_minutes INTEGER NOT NULL,
    notify_email VARCHAR(255),
    notify_sms VARCHAR(20),
    notify_user_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alert Notifications Log
CREATE TABLE alert_notifications (
    id BIGSERIAL PRIMARY KEY,
    alert_history_id BIGINT NOT NULL REFERENCES alert_history(id) ON DELETE CASCADE,
    notification_type VARCHAR(20) NOT NULL, -- EMAIL, SMS, WEBSOCKET
    recipient VARCHAR(255) NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL, -- SENT, FAILED, PENDING
    error_message TEXT
);

-- Notification Preferences
CREATE TABLE notification_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    websocket_enabled BOOLEAN DEFAULT true,
    email_address VARCHAR(255),
    phone_number VARCHAR(20),
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_alert_rules_type ON alert_rules(rule_type);
CREATE INDEX idx_alert_rules_active ON alert_rules(is_active);
CREATE INDEX idx_alert_history_triggered ON alert_history(triggered_at);
CREATE INDEX idx_alert_history_acknowledged ON alert_history(acknowledged);
CREATE INDEX idx_alert_history_resolved ON alert_history(resolved);
CREATE INDEX idx_alert_history_equipment ON alert_history(equipment_id);
CREATE INDEX idx_alert_escalations_rule ON alert_escalations(alert_rule_id);
CREATE INDEX idx_alert_notifications_history ON alert_notifications(alert_history_id);
CREATE INDEX idx_notification_prefs_user ON notification_preferences(user_id);
