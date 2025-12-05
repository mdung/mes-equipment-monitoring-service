-- Audit Trail Table
CREATE TABLE audit_trail (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL, -- Equipment, ProductionOrder, User, etc.
    entity_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.
    user_id BIGINT REFERENCES users(id),
    username VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    old_values JSONB,
    new_values JSONB,
    changes_summary TEXT,
    session_id VARCHAR(255)
);

-- User Activity Logs
CREATE TABLE user_activity_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    username VARCHAR(100) NOT NULL,
    activity_type VARCHAR(50) NOT NULL, -- LOGIN, LOGOUT, VIEW, EXPORT, PRINT, etc.
    activity_description TEXT,
    resource_type VARCHAR(100), -- Equipment, Report, Order, etc.
    resource_id BIGINT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(255),
    duration_seconds INTEGER,
    status VARCHAR(20) DEFAULT 'SUCCESS', -- SUCCESS, FAILED, PARTIAL
    error_message TEXT
);

-- Compliance Reports
CREATE TABLE compliance_report (
    id BIGSERIAL PRIMARY KEY,
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL, -- AUDIT_TRAIL, USER_ACTIVITY, DATA_RETENTION, CHANGE_HISTORY
    generated_by BIGINT REFERENCES users(id),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    filters JSONB,
    total_records INTEGER,
    file_path VARCHAR(500),
    file_format VARCHAR(20), -- PDF, CSV, EXCEL
    status VARCHAR(20) DEFAULT 'COMPLETED', -- PENDING, COMPLETED, FAILED
    notes TEXT
);

-- Data Retention Policy
CREATE TABLE data_retention_policy (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    retention_days INTEGER NOT NULL,
    archive_enabled BOOLEAN DEFAULT false,
    archive_location VARCHAR(500),
    delete_after_archive BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_execution TIMESTAMP,
    next_execution TIMESTAMP
);

-- Change History (Detailed tracking for critical entities)
CREATE TABLE change_history (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    entity_id BIGINT NOT NULL,
    entity_name VARCHAR(255),
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by BIGINT REFERENCES users(id),
    changed_by_username VARCHAR(100) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_reason TEXT,
    approval_required BOOLEAN DEFAULT false,
    approved_by BIGINT REFERENCES users(id),
    approved_at TIMESTAMP,
    approval_status VARCHAR(20) -- PENDING, APPROVED, REJECTED
);

-- Archived Data (For data retention)
CREATE TABLE archived_data (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    entity_id BIGINT NOT NULL,
    archived_data JSONB NOT NULL,
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_by BIGINT REFERENCES users(id),
    original_created_at TIMESTAMP,
    retention_policy_id BIGINT REFERENCES data_retention_policy(id),
    can_restore BOOLEAN DEFAULT true,
    restored_at TIMESTAMP,
    restored_by BIGINT REFERENCES users(id)
);

-- Compliance Violations (Track policy violations)
CREATE TABLE compliance_violation (
    id BIGSERIAL PRIMARY KEY,
    violation_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- CRITICAL, HIGH, MEDIUM, LOW
    description TEXT NOT NULL,
    entity_type VARCHAR(100),
    entity_id BIGINT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detected_by VARCHAR(100), -- System or username
    user_id BIGINT REFERENCES users(id),
    resolved BOOLEAN DEFAULT false,
    resolved_by BIGINT REFERENCES users(id),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    action_taken TEXT
);

-- Indexes for performance
CREATE INDEX idx_audit_trail_entity ON audit_trail(entity_type, entity_id);
CREATE INDEX idx_audit_trail_user ON audit_trail(user_id);
CREATE INDEX idx_audit_trail_timestamp ON audit_trail(timestamp);
CREATE INDEX idx_audit_trail_action ON audit_trail(action);
CREATE INDEX idx_audit_trail_session ON audit_trail(session_id);

CREATE INDEX idx_user_activity_user ON user_activity_log(user_id);
CREATE INDEX idx_user_activity_timestamp ON user_activity_log(timestamp);
CREATE INDEX idx_user_activity_type ON user_activity_log(activity_type);
CREATE INDEX idx_user_activity_resource ON user_activity_log(resource_type, resource_id);
CREATE INDEX idx_user_activity_session ON user_activity_log(session_id);

CREATE INDEX idx_compliance_report_type ON compliance_report(report_type);
CREATE INDEX idx_compliance_report_generated ON compliance_report(generated_at);
CREATE INDEX idx_compliance_report_dates ON compliance_report(start_date, end_date);

CREATE INDEX idx_retention_policy_entity ON data_retention_policy(entity_type);
CREATE INDEX idx_retention_policy_active ON data_retention_policy(is_active);
CREATE INDEX idx_retention_policy_execution ON data_retention_policy(next_execution);

CREATE INDEX idx_change_history_entity ON change_history(entity_type, entity_id);
CREATE INDEX idx_change_history_changed_by ON change_history(changed_by);
CREATE INDEX idx_change_history_timestamp ON change_history(changed_at);
CREATE INDEX idx_change_history_approval ON change_history(approval_status);

CREATE INDEX idx_archived_data_entity ON archived_data(entity_type, entity_id);
CREATE INDEX idx_archived_data_timestamp ON archived_data(archived_at);
CREATE INDEX idx_archived_data_policy ON archived_data(retention_policy_id);

CREATE INDEX idx_compliance_violation_type ON compliance_violation(violation_type);
CREATE INDEX idx_compliance_violation_resolved ON compliance_violation(resolved);
CREATE INDEX idx_compliance_violation_detected ON compliance_violation(detected_at);
