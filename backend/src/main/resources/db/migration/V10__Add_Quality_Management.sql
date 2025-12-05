-- Create quality control plans table
CREATE TABLE quality_control_plans (
    id BIGSERIAL PRIMARY KEY,
    plan_name VARCHAR(255) NOT NULL,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    description TEXT,
    version VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_by_user_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inspection checklists table
CREATE TABLE inspection_checklists (
    id BIGSERIAL PRIMARY KEY,
    plan_id BIGINT REFERENCES quality_control_plans(id) ON DELETE CASCADE,
    checklist_name VARCHAR(255) NOT NULL,
    inspection_type VARCHAR(50) NOT NULL, -- INCOMING, IN_PROCESS, FINAL, AUDIT
    sequence_order INTEGER,
    is_mandatory BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inspection checklist items table
CREATE TABLE inspection_checklist_items (
    id BIGSERIAL PRIMARY KEY,
    checklist_id BIGINT NOT NULL REFERENCES inspection_checklists(id) ON DELETE CASCADE,
    item_description TEXT NOT NULL,
    specification VARCHAR(255),
    measurement_method VARCHAR(255),
    acceptance_criteria TEXT,
    sequence_order INTEGER,
    is_critical BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inspection results table
CREATE TABLE inspection_results (
    id BIGSERIAL PRIMARY KEY,
    checklist_id BIGINT NOT NULL REFERENCES inspection_checklists(id),
    production_order_id BIGINT REFERENCES production_order(id),
    batch_id BIGINT REFERENCES batches(id),
    inspector_user_id BIGINT REFERENCES users(id),
    inspection_date TIMESTAMP NOT NULL,
    overall_result VARCHAR(20) NOT NULL, -- PASS, FAIL, CONDITIONAL
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inspection result items table
CREATE TABLE inspection_result_items (
    id BIGSERIAL PRIMARY KEY,
    result_id BIGINT NOT NULL REFERENCES inspection_results(id) ON DELETE CASCADE,
    checklist_item_id BIGINT NOT NULL REFERENCES inspection_checklist_items(id),
    measured_value VARCHAR(255),
    result_status VARCHAR(20) NOT NULL, -- PASS, FAIL, NA
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create defect categories table
CREATE TABLE defect_categories (
    id BIGSERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    category_code VARCHAR(20) UNIQUE,
    description TEXT,
    severity VARCHAR(20) NOT NULL, -- CRITICAL, MAJOR, MINOR
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create defect records table
CREATE TABLE defect_records (
    id BIGSERIAL PRIMARY KEY,
    production_order_id BIGINT REFERENCES production_order(id),
    batch_id BIGINT REFERENCES batches(id),
    equipment_id BIGINT REFERENCES equipment(id),
    defect_category_id BIGINT NOT NULL REFERENCES defect_categories(id),
    defect_description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    detected_by_user_id BIGINT REFERENCES users(id),
    detected_at TIMESTAMP NOT NULL,
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'OPEN', -- OPEN, INVESTIGATING, RESOLVED, CLOSED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create root cause analysis table
CREATE TABLE root_cause_analysis (
    id BIGSERIAL PRIMARY KEY,
    defect_record_id BIGINT REFERENCES defect_records(id) ON DELETE CASCADE,
    analysis_date TIMESTAMP NOT NULL,
    analyst_user_id BIGINT REFERENCES users(id),
    problem_statement TEXT NOT NULL,
    root_cause TEXT,
    why_1 TEXT,
    why_2 TEXT,
    why_3 TEXT,
    why_4 TEXT,
    why_5 TEXT,
    corrective_action TEXT,
    preventive_action TEXT,
    action_owner_user_id BIGINT REFERENCES users(id),
    target_completion_date DATE,
    actual_completion_date DATE,
    verification_notes TEXT,
    status VARCHAR(20) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, COMPLETED, VERIFIED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create SPC (Statistical Process Control) data table
CREATE TABLE spc_data_points (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT REFERENCES equipment(id),
    production_order_id BIGINT REFERENCES production_order(id),
    parameter_name VARCHAR(100) NOT NULL,
    measured_value DECIMAL(15, 6) NOT NULL,
    unit_of_measure VARCHAR(50),
    upper_control_limit DECIMAL(15, 6),
    lower_control_limit DECIMAL(15, 6),
    upper_spec_limit DECIMAL(15, 6),
    lower_spec_limit DECIMAL(15, 6),
    target_value DECIMAL(15, 6),
    sample_size INTEGER,
    measured_by_user_id BIGINT REFERENCES users(id),
    measured_at TIMESTAMP NOT NULL,
    is_out_of_control BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add defect tracking columns to quality_check table
ALTER TABLE quality_check ADD COLUMN IF NOT EXISTS inspector_user_id BIGINT REFERENCES users(id);
ALTER TABLE quality_check ADD COLUMN IF NOT EXISTS inspection_type VARCHAR(50);
ALTER TABLE quality_check ADD COLUMN IF NOT EXISTS notes TEXT;

-- Indexes for performance
CREATE INDEX idx_quality_control_plans_product ON quality_control_plans(product_id);
CREATE INDEX idx_quality_control_plans_active ON quality_control_plans(is_active);
CREATE INDEX idx_inspection_checklists_plan ON inspection_checklists(plan_id);
CREATE INDEX idx_inspection_checklist_items_checklist ON inspection_checklist_items(checklist_id);
CREATE INDEX idx_inspection_results_checklist ON inspection_results(checklist_id);
CREATE INDEX idx_inspection_results_order ON inspection_results(production_order_id);
CREATE INDEX idx_inspection_results_date ON inspection_results(inspection_date);
CREATE INDEX idx_inspection_result_items_result ON inspection_result_items(result_id);
CREATE INDEX idx_defect_categories_code ON defect_categories(category_code);
CREATE INDEX idx_defect_records_order ON defect_records(production_order_id);
CREATE INDEX idx_defect_records_category ON defect_records(defect_category_id);
CREATE INDEX idx_defect_records_detected_at ON defect_records(detected_at);
CREATE INDEX idx_root_cause_analysis_defect ON root_cause_analysis(defect_record_id);
CREATE INDEX idx_root_cause_analysis_status ON root_cause_analysis(status);
CREATE INDEX idx_spc_data_equipment ON spc_data_points(equipment_id);
CREATE INDEX idx_spc_data_order ON spc_data_points(production_order_id);
CREATE INDEX idx_spc_data_parameter ON spc_data_points(parameter_name);
CREATE INDEX idx_spc_data_measured_at ON spc_data_points(measured_at);

-- Insert default defect categories
INSERT INTO defect_categories (category_name, category_code, description, severity) VALUES
('Dimensional Defect', 'DIM', 'Parts outside dimensional specifications', 'MAJOR'),
('Surface Defect', 'SUR', 'Surface finish or appearance issues', 'MINOR'),
('Material Defect', 'MAT', 'Material composition or quality issues', 'CRITICAL'),
('Assembly Defect', 'ASM', 'Incorrect assembly or missing components', 'MAJOR'),
('Functional Defect', 'FUN', 'Product does not function as intended', 'CRITICAL'),
('Cosmetic Defect', 'COS', 'Aesthetic issues that do not affect function', 'MINOR'),
('Packaging Defect', 'PKG', 'Packaging damage or incorrect packaging', 'MINOR'),
('Labeling Defect', 'LBL', 'Incorrect or missing labels', 'MAJOR');
