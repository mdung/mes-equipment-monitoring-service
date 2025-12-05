-- OEE Calculation Records
CREATE TABLE oee_calculation (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    production_order_id BIGINT REFERENCES production_order(id),
    shift_id BIGINT REFERENCES shifts(id),
    calculation_period_start TIMESTAMP NOT NULL,
    calculation_period_end TIMESTAMP NOT NULL,
    
    -- Time Components (in minutes)
    planned_production_time DECIMAL(10, 2) NOT NULL,
    downtime DECIMAL(10, 2) DEFAULT 0,
    operating_time DECIMAL(10, 2) NOT NULL,
    
    -- Availability
    availability_percentage DECIMAL(5, 2) NOT NULL,
    
    -- Performance
    ideal_cycle_time DECIMAL(10, 4), -- seconds per unit
    total_pieces_produced INTEGER NOT NULL,
    ideal_production_quantity INTEGER,
    performance_percentage DECIMAL(5, 2) NOT NULL,
    
    -- Quality
    good_pieces INTEGER NOT NULL,
    rejected_pieces INTEGER DEFAULT 0,
    quality_percentage DECIMAL(5, 2) NOT NULL,
    
    -- OEE
    oee_percentage DECIMAL(5, 2) NOT NULL,
    
    -- Additional Metrics
    target_oee_percentage DECIMAL(5, 2),
    variance_from_target DECIMAL(5, 2),
    world_class_oee DECIMAL(5, 2) DEFAULT 85.0,
    
    -- Metadata
    calculation_type VARCHAR(20) DEFAULT 'REAL_TIME', -- REAL_TIME, SHIFT, DAILY, WEEKLY, MONTHLY
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    calculated_by VARCHAR(100),
    notes TEXT,
    
    CONSTRAINT chk_availability CHECK (availability_percentage >= 0 AND availability_percentage <= 100),
    CONSTRAINT chk_performance CHECK (performance_percentage >= 0 AND performance_percentage <= 200),
    CONSTRAINT chk_quality CHECK (quality_percentage >= 0 AND quality_percentage <= 100),
    CONSTRAINT chk_oee CHECK (oee_percentage >= 0 AND oee_percentage <= 100)
);

-- OEE Targets and Benchmarks
CREATE TABLE oee_target (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT REFERENCES equipment(id) ON DELETE CASCADE,
    equipment_type VARCHAR(100),
    
    -- Target Values
    target_availability DECIMAL(5, 2) NOT NULL,
    target_performance DECIMAL(5, 2) NOT NULL,
    target_quality DECIMAL(5, 2) NOT NULL,
    target_oee DECIMAL(5, 2) NOT NULL,
    
    -- Benchmark Values
    industry_benchmark_oee DECIMAL(5, 2),
    world_class_oee DECIMAL(5, 2) DEFAULT 85.0,
    company_average_oee DECIMAL(5, 2),
    
    -- Period
    effective_from DATE NOT NULL,
    effective_to DATE,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    notes TEXT
);

-- OEE Loss Categories
CREATE TABLE oee_loss_category (
    id BIGSERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    loss_type VARCHAR(20) NOT NULL, -- AVAILABILITY, PERFORMANCE, QUALITY
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OEE Loss Events
CREATE TABLE oee_loss_event (
    id BIGSERIAL PRIMARY KEY,
    oee_calculation_id BIGINT REFERENCES oee_calculation(id) ON DELETE CASCADE,
    equipment_id BIGINT NOT NULL REFERENCES equipment(id),
    loss_category_id BIGINT NOT NULL REFERENCES oee_loss_category(id),
    
    loss_type VARCHAR(20) NOT NULL, -- AVAILABILITY, PERFORMANCE, QUALITY
    loss_duration_minutes DECIMAL(10, 2),
    loss_quantity INTEGER,
    loss_percentage DECIMAL(5, 2),
    
    event_start TIMESTAMP NOT NULL,
    event_end TIMESTAMP,
    
    description TEXT,
    root_cause TEXT,
    corrective_action TEXT,
    
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recorded_by VARCHAR(100)
);

-- OEE Trends and Analytics
CREATE TABLE oee_trend (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    trend_period VARCHAR(20) NOT NULL, -- HOURLY, DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    
    -- Aggregated Metrics
    avg_oee DECIMAL(5, 2) NOT NULL,
    avg_availability DECIMAL(5, 2) NOT NULL,
    avg_performance DECIMAL(5, 2) NOT NULL,
    avg_quality DECIMAL(5, 2) NOT NULL,
    
    min_oee DECIMAL(5, 2),
    max_oee DECIMAL(5, 2),
    
    total_production_time DECIMAL(10, 2),
    total_downtime DECIMAL(10, 2),
    total_pieces_produced INTEGER,
    total_good_pieces INTEGER,
    
    -- Trend Analysis
    trend_direction VARCHAR(20), -- IMPROVING, DECLINING, STABLE
    trend_percentage DECIMAL(5, 2),
    
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(equipment_id, trend_period, period_start)
);

-- OEE Forecasting
CREATE TABLE oee_forecast (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    forecast_period VARCHAR(20) NOT NULL, -- DAILY, WEEKLY, MONTHLY
    forecast_date DATE NOT NULL,
    
    -- Forecasted Values
    forecasted_oee DECIMAL(5, 2) NOT NULL,
    forecasted_availability DECIMAL(5, 2),
    forecasted_performance DECIMAL(5, 2),
    forecasted_quality DECIMAL(5, 2),
    
    -- Confidence Metrics
    confidence_level DECIMAL(5, 2), -- 0-100
    prediction_model VARCHAR(50), -- LINEAR_REGRESSION, MOVING_AVERAGE, EXPONENTIAL_SMOOTHING
    
    -- Actual vs Forecast (filled after period)
    actual_oee DECIMAL(5, 2),
    forecast_accuracy DECIMAL(5, 2),
    
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(equipment_id, forecast_period, forecast_date)
);

-- OEE Comparison and Benchmarking
CREATE TABLE oee_comparison (
    id BIGSERIAL PRIMARY KEY,
    comparison_name VARCHAR(255) NOT NULL,
    comparison_type VARCHAR(50) NOT NULL, -- EQUIPMENT_VS_EQUIPMENT, SHIFT_VS_SHIFT, PERIOD_VS_PERIOD
    
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    
    equipment_ids BIGINT[],
    shift_ids BIGINT[],
    
    comparison_data JSONB NOT NULL,
    summary_statistics JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id)
);

-- OEE Alerts and Thresholds
CREATE TABLE oee_alert_threshold (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT REFERENCES equipment(id) ON DELETE CASCADE,
    
    metric_type VARCHAR(20) NOT NULL, -- OEE, AVAILABILITY, PERFORMANCE, QUALITY
    threshold_type VARCHAR(20) NOT NULL, -- MIN, MAX, TARGET_DEVIATION
    threshold_value DECIMAL(5, 2) NOT NULL,
    
    alert_severity VARCHAR(20) DEFAULT 'WARNING', -- INFO, WARNING, CRITICAL
    is_active BOOLEAN DEFAULT true,
    
    notification_enabled BOOLEAN DEFAULT true,
    notification_recipients TEXT[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_oee_calculation_equipment ON oee_calculation(equipment_id);
CREATE INDEX idx_oee_calculation_period ON oee_calculation(calculation_period_start, calculation_period_end);
CREATE INDEX idx_oee_calculation_type ON oee_calculation(calculation_type);
CREATE INDEX idx_oee_calculation_order ON oee_calculation(production_order_id);
CREATE INDEX idx_oee_calculation_shift ON oee_calculation(shift_id);

CREATE INDEX idx_oee_target_equipment ON oee_target(equipment_id);
CREATE INDEX idx_oee_target_active ON oee_target(is_active);
CREATE INDEX idx_oee_target_dates ON oee_target(effective_from, effective_to);

CREATE INDEX idx_oee_loss_event_calculation ON oee_loss_event(oee_calculation_id);
CREATE INDEX idx_oee_loss_event_equipment ON oee_loss_event(equipment_id);
CREATE INDEX idx_oee_loss_event_category ON oee_loss_event(loss_category_id);
CREATE INDEX idx_oee_loss_event_type ON oee_loss_event(loss_type);
CREATE INDEX idx_oee_loss_event_time ON oee_loss_event(event_start, event_end);

CREATE INDEX idx_oee_trend_equipment ON oee_trend(equipment_id);
CREATE INDEX idx_oee_trend_period ON oee_trend(trend_period);
CREATE INDEX idx_oee_trend_dates ON oee_trend(period_start, period_end);

CREATE INDEX idx_oee_forecast_equipment ON oee_forecast(equipment_id);
CREATE INDEX idx_oee_forecast_date ON oee_forecast(forecast_date);
CREATE INDEX idx_oee_forecast_period ON oee_forecast(forecast_period);

CREATE INDEX idx_oee_comparison_type ON oee_comparison(comparison_type);
CREATE INDEX idx_oee_comparison_dates ON oee_comparison(period_start, period_end);

CREATE INDEX idx_oee_alert_threshold_equipment ON oee_alert_threshold(equipment_id);
CREATE INDEX idx_oee_alert_threshold_active ON oee_alert_threshold(is_active);

-- Insert default OEE loss categories
INSERT INTO oee_loss_category (category_name, loss_type, description) VALUES
('Breakdown', 'AVAILABILITY', 'Equipment breakdown or failure'),
('Setup/Changeover', 'AVAILABILITY', 'Time spent on setup and changeover'),
('Planned Maintenance', 'AVAILABILITY', 'Scheduled maintenance downtime'),
('Unplanned Maintenance', 'AVAILABILITY', 'Unscheduled maintenance'),
('Material Shortage', 'AVAILABILITY', 'Waiting for materials'),
('Operator Absence', 'AVAILABILITY', 'No operator available'),

('Minor Stops', 'PERFORMANCE', 'Short stops under 5 minutes'),
('Reduced Speed', 'PERFORMANCE', 'Running below ideal speed'),
('Startup Loss', 'PERFORMANCE', 'Time to reach full speed'),
('Idling', 'PERFORMANCE', 'Equipment idle but available'),

('Scrap', 'QUALITY', 'Parts scrapped during production'),
('Rework', 'QUALITY', 'Parts requiring rework'),
('Startup Rejects', 'QUALITY', 'Rejects during startup'),
('Quality Defects', 'QUALITY', 'Quality-related defects');
