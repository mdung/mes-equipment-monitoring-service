-- Create maintenance schedules table
CREATE TABLE maintenance_schedules (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    schedule_name VARCHAR(255) NOT NULL,
    description TEXT,
    frequency VARCHAR(50) NOT NULL, -- DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY
    frequency_value INTEGER NOT NULL, -- e.g., every 2 weeks
    last_maintenance_date TIMESTAMP,
    next_maintenance_date TIMESTAMP NOT NULL,
    estimated_duration_minutes INTEGER,
    priority VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create maintenance tasks table
CREATE TABLE maintenance_tasks (
    id BIGSERIAL PRIMARY KEY,
    schedule_id BIGINT REFERENCES maintenance_schedules(id) ON DELETE SET NULL,
    equipment_id BIGINT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    task_title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL, -- PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    priority VARCHAR(20) NOT NULL,
    scheduled_date TIMESTAMP NOT NULL,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    actual_duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spare parts table
CREATE TABLE spare_parts (
    id BIGSERIAL PRIMARY KEY,
    part_number VARCHAR(100) UNIQUE NOT NULL,
    part_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit_price DECIMAL(10, 2),
    quantity_in_stock INTEGER NOT NULL DEFAULT 0,
    minimum_stock_level INTEGER DEFAULT 0,
    location VARCHAR(255),
    supplier VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create maintenance task parts (many-to-many)
CREATE TABLE maintenance_task_parts (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES maintenance_tasks(id) ON DELETE CASCADE,
    part_id BIGINT NOT NULL REFERENCES spare_parts(id) ON DELETE CASCADE,
    quantity_used INTEGER NOT NULL,
    cost DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create maintenance costs table
CREATE TABLE maintenance_costs (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES maintenance_tasks(id) ON DELETE CASCADE,
    cost_type VARCHAR(50) NOT NULL, -- LABOR, PARTS, EXTERNAL_SERVICE, OTHER
    description VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1, -- Added from V9 migration
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_maintenance_schedules_equipment ON maintenance_schedules(equipment_id);
CREATE INDEX idx_maintenance_schedules_next_date ON maintenance_schedules(next_maintenance_date);
CREATE INDEX idx_maintenance_tasks_equipment ON maintenance_tasks(equipment_id);
CREATE INDEX idx_maintenance_tasks_assigned ON maintenance_tasks(assigned_to_user_id);
CREATE INDEX idx_maintenance_tasks_status ON maintenance_tasks(status);
CREATE INDEX idx_maintenance_tasks_scheduled ON maintenance_tasks(scheduled_date);
CREATE INDEX idx_spare_parts_number ON spare_parts(part_number);
CREATE INDEX idx_spare_parts_stock ON spare_parts(quantity_in_stock);
CREATE INDEX idx_maintenance_task_parts_task ON maintenance_task_parts(task_id);
CREATE INDEX idx_maintenance_costs_task ON maintenance_costs(task_id);


