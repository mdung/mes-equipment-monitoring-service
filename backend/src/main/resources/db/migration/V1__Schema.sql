CREATE TABLE equipment (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL, -- RUNNING, IDLE, DOWN, MAINTENANCE
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE production_order (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    target_quantity INTEGER NOT NULL,
    produced_quantity INTEGER DEFAULT 0,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(20) NOT NULL, -- PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
    equipment_id BIGINT REFERENCES equipment(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipment_log (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT REFERENCES equipment(id),
    status VARCHAR(20),
    output_count INTEGER,
    temperature DOUBLE PRECISION,
    vibration DOUBLE PRECISION,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE downtime_event (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT REFERENCES equipment(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    reason_code VARCHAR(50),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quality_check (
    id BIGSERIAL PRIMARY KEY,
    production_order_id BIGINT REFERENCES production_order(id),
    passed_count INTEGER NOT NULL DEFAULT 0,
    rejected_count INTEGER NOT NULL DEFAULT 0,
    check_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_po_status ON production_order(status);
CREATE INDEX idx_log_equipment_time ON equipment_log(equipment_id, timestamp);
CREATE INDEX idx_quality_order ON quality_check(production_order_id);
CREATE INDEX idx_downtime_equipment ON downtime_event(equipment_id);
