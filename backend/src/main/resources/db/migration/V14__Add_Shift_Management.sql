-- Create shifts table
CREATE TABLE shifts (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    shift_type VARCHAR(20) NOT NULL, -- DAY, NIGHT, SWING
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create shift assignments table
CREATE TABLE shift_assignments (
    id BIGSERIAL PRIMARY KEY,
    shift_id BIGINT NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    equipment_id BIGINT REFERENCES equipment(id) ON DELETE SET NULL,
    assignment_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(shift_id, user_id, assignment_date)
);

-- Create shift handovers table
CREATE TABLE shift_handovers (
    id BIGSERIAL PRIMARY KEY,
    from_shift_id BIGINT NOT NULL REFERENCES shifts(id),
    to_shift_id BIGINT NOT NULL REFERENCES shifts(id),
    from_user_id BIGINT NOT NULL REFERENCES users(id),
    to_user_id BIGINT REFERENCES users(id),
    handover_date DATE NOT NULL,
    handover_time TIMESTAMP NOT NULL,
    production_summary TEXT,
    quality_issues TEXT,
    equipment_status TEXT,
    pending_tasks TEXT,
    notes TEXT,
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create shift production logs table
CREATE TABLE shift_production_logs (
    id BIGSERIAL PRIMARY KEY,
    shift_id BIGINT NOT NULL REFERENCES shifts(id),
    production_order_id BIGINT NOT NULL REFERENCES production_order(id),
    shift_date DATE NOT NULL,
    quantity_produced INTEGER DEFAULT 0,
    quality_passed INTEGER DEFAULT 0,
    quality_rejected INTEGER DEFAULT 0,
    downtime_minutes INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_shifts_type ON shifts(shift_type);
CREATE INDEX idx_shift_assignments_date ON shift_assignments(assignment_date);
CREATE INDEX idx_shift_assignments_user ON shift_assignments(user_id);
CREATE INDEX idx_shift_assignments_shift ON shift_assignments(shift_id);
CREATE INDEX idx_shift_handovers_date ON shift_handovers(handover_date);
CREATE INDEX idx_shift_handovers_from_shift ON shift_handovers(from_shift_id);
CREATE INDEX idx_shift_handovers_to_shift ON shift_handovers(to_shift_id);
CREATE INDEX idx_shift_production_logs_date ON shift_production_logs(shift_date);
CREATE INDEX idx_shift_production_logs_shift ON shift_production_logs(shift_id);

-- Insert default shifts
INSERT INTO shifts (name, shift_type, start_time, end_time, description, active) VALUES
('Day Shift', 'DAY', '07:00:00', '15:00:00', 'Morning shift - 7 AM to 3 PM', true),
('Night Shift', 'NIGHT', '23:00:00', '07:00:00', 'Night shift - 11 PM to 7 AM', true),
('Swing Shift', 'SWING', '15:00:00', '23:00:00', 'Evening shift - 3 PM to 11 PM', true);


