-- Create report templates table
CREATE TABLE report_templates (
    id BIGSERIAL PRIMARY KEY,
    template_name VARCHAR(255) NOT NULL UNIQUE,
    template_code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- PRODUCTION, QUALITY, MAINTENANCE, EQUIPMENT, CUSTOM
    report_type VARCHAR(50) NOT NULL, -- TABLE, CHART, DASHBOARD
    query_definition TEXT,
    chart_config JSONB,
    parameters JSONB,
    is_active BOOLEAN DEFAULT true,
    created_by_user_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create scheduled reports table
CREATE TABLE scheduled_reports (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES report_templates(id) ON DELETE CASCADE,
    schedule_name VARCHAR(255) NOT NULL,
    schedule_frequency VARCHAR(20) NOT NULL, -- DAILY, WEEKLY, MONTHLY
    schedule_time TIME NOT NULL,
    schedule_day_of_week INTEGER, -- 0-6 for weekly
    schedule_day_of_month INTEGER, -- 1-31 for monthly
    parameters JSONB,
    is_active BOOLEAN DEFAULT true,
    created_by_user_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create report recipients table
CREATE TABLE report_recipients (
    id BIGSERIAL PRIMARY KEY,
    scheduled_report_id BIGINT NOT NULL REFERENCES scheduled_reports(id) ON DELETE CASCADE,
    recipient_user_id BIGINT REFERENCES users(id),
    recipient_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create report execution history table
CREATE TABLE report_execution_history (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT REFERENCES report_templates(id),
    scheduled_report_id BIGINT REFERENCES scheduled_reports(id),
    executed_by_user_id BIGINT REFERENCES users(id),
    execution_date TIMESTAMP NOT NULL,
    parameters JSONB,
    status VARCHAR(20) NOT NULL, -- SUCCESS, FAILED, PENDING
    error_message TEXT,
    file_path VARCHAR(500),
    file_format VARCHAR(10), -- PDF, EXCEL, CSV
    execution_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create custom report builder table
CREATE TABLE custom_reports (
    id BIGSERIAL PRIMARY KEY,
    report_name VARCHAR(255) NOT NULL,
    description TEXT,
    data_source VARCHAR(50) NOT NULL, -- PRODUCTION, QUALITY, MAINTENANCE, EQUIPMENT
    selected_fields JSONB NOT NULL,
    filters JSONB,
    grouping JSONB,
    sorting JSONB,
    chart_type VARCHAR(50), -- BAR, LINE, PIE, TABLE
    chart_config JSONB,
    created_by_user_id BIGINT REFERENCES users(id),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_report_templates_category ON report_templates(category);
CREATE INDEX idx_report_templates_active ON report_templates(is_active);
CREATE INDEX idx_scheduled_reports_template ON scheduled_reports(template_id);
CREATE INDEX idx_scheduled_reports_active ON scheduled_reports(is_active);
CREATE INDEX idx_report_recipients_scheduled ON report_recipients(scheduled_report_id);
CREATE INDEX idx_report_execution_history_template ON report_execution_history(template_id);
CREATE INDEX idx_report_execution_history_date ON report_execution_history(execution_date);
CREATE INDEX idx_custom_reports_user ON custom_reports(created_by_user_id);

-- Insert pre-built report templates
INSERT INTO report_templates (template_name, template_code, description, category, report_type, is_active) VALUES
('Production Efficiency Report', 'PROD_EFFICIENCY', 'Overall production efficiency metrics and trends', 'PRODUCTION', 'DASHBOARD', true),
('Equipment Utilization Report', 'EQUIP_UTIL', 'Equipment usage and availability analysis', 'EQUIPMENT', 'CHART', true),
('Downtime Analysis Report', 'DOWNTIME_ANALYSIS', 'Equipment downtime breakdown and root causes', 'EQUIPMENT', 'TABLE', true),
('Quality Trends Report', 'QUALITY_TRENDS', 'Quality metrics and defect trends over time', 'QUALITY', 'CHART', true),
('OEE Performance Report', 'OEE_PERFORMANCE', 'Overall Equipment Effectiveness detailed analysis', 'EQUIPMENT', 'DASHBOARD', true),
('Maintenance Summary Report', 'MAINT_SUMMARY', 'Maintenance activities and costs summary', 'MAINTENANCE', 'TABLE', true),
('Defect Pareto Report', 'DEFECT_PARETO', 'Top defect categories by frequency and impact', 'QUALITY', 'CHART', true),
('Production Order Status Report', 'ORDER_STATUS', 'Current status of all production orders', 'PRODUCTION', 'TABLE', true),
('Shift Performance Report', 'SHIFT_PERFORMANCE', 'Performance metrics by shift', 'PRODUCTION', 'DASHBOARD', true),
('Equipment Maintenance History', 'EQUIP_MAINT_HISTORY', 'Complete maintenance history by equipment', 'MAINTENANCE', 'TABLE', true);
