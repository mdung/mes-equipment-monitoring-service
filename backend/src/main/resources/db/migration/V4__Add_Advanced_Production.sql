-- Bill of Materials (BOM)
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    unit_of_measure VARCHAR(20),
    standard_cost DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE materials (
    id BIGSERIAL PRIMARY KEY,
    material_code VARCHAR(50) UNIQUE NOT NULL,
    material_name VARCHAR(255) NOT NULL,
    description TEXT,
    unit_of_measure VARCHAR(20),
    unit_cost DECIMAL(10, 2),
    current_stock DECIMAL(10, 2) DEFAULT 0,
    minimum_stock DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bom_items (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    material_id BIGINT NOT NULL REFERENCES materials(id),
    quantity DECIMAL(10, 4) NOT NULL,
    unit_of_measure VARCHAR(20),
    scrap_percentage DECIMAL(5, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Work Instructions
CREATE TABLE work_instructions (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_title VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_duration_minutes INTEGER,
    required_equipment VARCHAR(255),
    safety_notes TEXT,
    quality_checkpoints TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Material Consumption
CREATE TABLE material_consumption (
    id BIGSERIAL PRIMARY KEY,
    production_order_id BIGINT NOT NULL REFERENCES production_order(id),
    material_id BIGINT NOT NULL REFERENCES materials(id),
    quantity_consumed DECIMAL(10, 4) NOT NULL,
    unit_of_measure VARCHAR(20),
    consumption_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recorded_by VARCHAR(100),
    notes TEXT
);

-- Batch/Lot Tracking
CREATE TABLE batches (
    id BIGSERIAL PRIMARY KEY,
    batch_number VARCHAR(50) UNIQUE NOT NULL,
    product_id BIGINT NOT NULL REFERENCES products(id),
    production_order_id BIGINT REFERENCES production_order(id),
    quantity DECIMAL(10, 2) NOT NULL,
    manufacturing_date TIMESTAMP,
    expiry_date TIMESTAMP,
    status VARCHAR(20) NOT NULL, -- IN_PRODUCTION, COMPLETED, QUARANTINE, RELEASED, REJECTED
    quality_status VARCHAR(20), -- PASSED, FAILED, PENDING
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE batch_materials (
    id BIGSERIAL PRIMARY KEY,
    batch_id BIGINT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    material_id BIGINT NOT NULL REFERENCES materials(id),
    material_batch_number VARCHAR(50),
    quantity_used DECIMAL(10, 4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Production Scheduling
CREATE TABLE production_schedules (
    id BIGSERIAL PRIMARY KEY,
    schedule_name VARCHAR(255) NOT NULL,
    production_order_id BIGINT REFERENCES production_order(id),
    equipment_id BIGINT REFERENCES equipment(id),
    scheduled_start TIMESTAMP NOT NULL,
    scheduled_end TIMESTAMP NOT NULL,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    priority INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL, -- SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, DELAYED
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Multi-step Production Workflows
CREATE TABLE workflow_templates (
    id BIGSERIAL PRIMARY KEY,
    template_name VARCHAR(255) NOT NULL,
    product_id BIGINT REFERENCES products(id),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workflow_steps (
    id BIGSERIAL PRIMARY KEY,
    workflow_template_id BIGINT NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    step_type VARCHAR(50), -- PROCESSING, INSPECTION, ASSEMBLY, PACKAGING
    equipment_id BIGINT REFERENCES equipment(id),
    estimated_duration_minutes INTEGER,
    required_skills TEXT,
    quality_checks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE production_workflow_instances (
    id BIGSERIAL PRIMARY KEY,
    production_order_id BIGINT NOT NULL REFERENCES production_order(id),
    workflow_template_id BIGINT NOT NULL REFERENCES workflow_templates(id),
    current_step INTEGER DEFAULT 1,
    status VARCHAR(20) NOT NULL, -- NOT_STARTED, IN_PROGRESS, COMPLETED, PAUSED, CANCELLED
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workflow_step_executions (
    id BIGSERIAL PRIMARY KEY,
    workflow_instance_id BIGINT NOT NULL REFERENCES production_workflow_instances(id) ON DELETE CASCADE,
    workflow_step_id BIGINT NOT NULL REFERENCES workflow_steps(id),
    status VARCHAR(20) NOT NULL, -- PENDING, IN_PROGRESS, COMPLETED, SKIPPED, FAILED
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    operator VARCHAR(100),
    notes TEXT,
    quality_passed BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_bom_items_product ON bom_items(product_id);
CREATE INDEX idx_bom_items_material ON bom_items(material_id);
CREATE INDEX idx_work_instructions_product ON work_instructions(product_id);
CREATE INDEX idx_material_consumption_order ON material_consumption(production_order_id);
CREATE INDEX idx_material_consumption_material ON material_consumption(material_id);
CREATE INDEX idx_batches_product ON batches(product_id);
CREATE INDEX idx_batches_order ON batches(production_order_id);
CREATE INDEX idx_batches_status ON batches(status);
CREATE INDEX idx_schedules_equipment ON production_schedules(equipment_id);
CREATE INDEX idx_schedules_order ON production_schedules(production_order_id);
CREATE INDEX idx_schedules_start ON production_schedules(scheduled_start);
CREATE INDEX idx_workflow_steps_template ON workflow_steps(workflow_template_id);
CREATE INDEX idx_workflow_instances_order ON production_workflow_instances(production_order_id);
CREATE INDEX idx_step_executions_instance ON workflow_step_executions(workflow_instance_id);
