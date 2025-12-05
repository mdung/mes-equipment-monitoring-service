-- External System Integrations
CREATE TABLE external_system (
    id BIGSERIAL PRIMARY KEY,
    system_name VARCHAR(255) NOT NULL UNIQUE,
    system_type VARCHAR(50) NOT NULL, -- ERP, SCADA, PLC, SENSOR, WEBHOOK, CUSTOM
    description TEXT,
    base_url VARCHAR(500),
    api_key VARCHAR(500),
    api_secret VARCHAR(500),
    authentication_type VARCHAR(50), -- API_KEY, OAUTH2, BASIC, TOKEN
    is_active BOOLEAN DEFAULT true,
    connection_status VARCHAR(20) DEFAULT 'DISCONNECTED', -- CONNECTED, DISCONNECTED, ERROR
    last_sync TIMESTAMP,
    sync_interval_minutes INTEGER DEFAULT 5,
    retry_count INTEGER DEFAULT 3,
    timeout_seconds INTEGER DEFAULT 30,
    configuration JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id)
);

-- Integration Endpoints
CREATE TABLE integration_endpoint (
    id BIGSERIAL PRIMARY KEY,
    external_system_id BIGINT NOT NULL REFERENCES external_system(id) ON DELETE CASCADE,
    endpoint_name VARCHAR(255) NOT NULL,
    endpoint_path VARCHAR(500) NOT NULL,
    http_method VARCHAR(10) NOT NULL, -- GET, POST, PUT, DELETE, PATCH
    description TEXT,
    request_format VARCHAR(20) DEFAULT 'JSON', -- JSON, XML, FORM_DATA
    response_format VARCHAR(20) DEFAULT 'JSON',
    is_active BOOLEAN DEFAULT true,
    requires_authentication BOOLEAN DEFAULT true,
    rate_limit_per_minute INTEGER,
    headers JSONB,
    query_parameters JSONB,
    request_body_template TEXT,
    response_mapping JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ERP Integration
CREATE TABLE erp_integration (
    id BIGSERIAL PRIMARY KEY,
    external_system_id BIGINT NOT NULL REFERENCES external_system(id) ON DELETE CASCADE,
    erp_type VARCHAR(50) NOT NULL, -- SAP, ORACLE, MICROSOFT_DYNAMICS, CUSTOM
    company_code VARCHAR(50),
    plant_code VARCHAR(50),
    sync_production_orders BOOLEAN DEFAULT true,
    sync_materials BOOLEAN DEFAULT true,
    sync_inventory BOOLEAN DEFAULT true,
    sync_quality_data BOOLEAN DEFAULT false,
    auto_sync_enabled BOOLEAN DEFAULT true,
    last_sync_timestamp TIMESTAMP,
    sync_status VARCHAR(20) DEFAULT 'IDLE', -- IDLE, SYNCING, SUCCESS, ERROR
    error_message TEXT,
    configuration JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SCADA/PLC Integration
CREATE TABLE scada_plc_integration (
    id BIGSERIAL PRIMARY KEY,
    external_system_id BIGINT NOT NULL REFERENCES external_system(id) ON DELETE CASCADE,
    plc_type VARCHAR(50) NOT NULL, -- SIEMENS, ALLEN_BRADLEY, MODBUS, OPCUA, CUSTOM
    ip_address VARCHAR(45) NOT NULL,
    port INTEGER NOT NULL,
    protocol VARCHAR(20) NOT NULL, -- MODBUS_TCP, OPCUA, ETHERNET_IP, PROFINET
    equipment_id BIGINT REFERENCES equipment(id),
    polling_interval_ms INTEGER DEFAULT 1000,
    is_connected BOOLEAN DEFAULT false,
    last_data_received TIMESTAMP,
    data_points JSONB, -- Configuration of data points to read
    tag_mapping JSONB, -- Mapping of PLC tags to system fields
    connection_status VARCHAR(20) DEFAULT 'DISCONNECTED',
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sensor Integration
CREATE TABLE sensor_integration (
    id BIGSERIAL PRIMARY KEY,
    external_system_id BIGINT NOT NULL REFERENCES external_system(id) ON DELETE CASCADE,
    sensor_name VARCHAR(255) NOT NULL,
    sensor_type VARCHAR(50) NOT NULL, -- TEMPERATURE, PRESSURE, VIBRATION, HUMIDITY, FLOW, LEVEL, CUSTOM
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    equipment_id BIGINT REFERENCES equipment(id),
    communication_protocol VARCHAR(50), -- MQTT, HTTP, MODBUS, OPCUA, CUSTOM
    data_format VARCHAR(20) DEFAULT 'JSON',
    measurement_unit VARCHAR(20),
    min_value DECIMAL(10, 2),
    max_value DECIMAL(10, 2),
    threshold_warning DECIMAL(10, 2),
    threshold_critical DECIMAL(10, 2),
    sampling_rate_seconds INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    last_reading DECIMAL(10, 2),
    last_reading_timestamp TIMESTAMP,
    calibration_date DATE,
    next_calibration_date DATE,
    configuration JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Webhook Configuration
CREATE TABLE webhook_config (
    id BIGSERIAL PRIMARY KEY,
    webhook_name VARCHAR(255) NOT NULL UNIQUE,
    webhook_url VARCHAR(500) NOT NULL,
    webhook_secret VARCHAR(500),
    event_type VARCHAR(100) NOT NULL, -- EQUIPMENT_STATUS_CHANGE, PRODUCTION_ORDER_COMPLETE, QUALITY_CHECK_FAIL, ALERT_TRIGGERED, etc.
    http_method VARCHAR(10) DEFAULT 'POST',
    content_type VARCHAR(50) DEFAULT 'application/json',
    is_active BOOLEAN DEFAULT true,
    retry_on_failure BOOLEAN DEFAULT true,
    max_retries INTEGER DEFAULT 3,
    timeout_seconds INTEGER DEFAULT 30,
    headers JSONB,
    payload_template TEXT,
    last_triggered TIMESTAMP,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id)
);

-- Integration Logs
CREATE TABLE integration_log (
    id BIGSERIAL PRIMARY KEY,
    external_system_id BIGINT REFERENCES external_system(id) ON DELETE SET NULL,
    integration_type VARCHAR(50) NOT NULL, -- ERP, SCADA, PLC, SENSOR, WEBHOOK
    operation VARCHAR(100) NOT NULL,
    direction VARCHAR(10) NOT NULL, -- INBOUND, OUTBOUND
    status VARCHAR(20) NOT NULL, -- SUCCESS, FAILURE, PARTIAL
    request_data TEXT,
    response_data TEXT,
    error_message TEXT,
    duration_ms INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- API Keys for External Access
CREATE TABLE api_key (
    id BIGSERIAL PRIMARY KEY,
    key_name VARCHAR(255) NOT NULL,
    api_key VARCHAR(500) NOT NULL UNIQUE,
    api_secret VARCHAR(500),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    permissions JSONB, -- Array of allowed endpoints/operations
    rate_limit_per_minute INTEGER DEFAULT 60,
    rate_limit_per_hour INTEGER DEFAULT 1000,
    allowed_ip_addresses TEXT[], -- Array of allowed IPs
    expires_at TIMESTAMP,
    last_used TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id)
);

-- Data Ingestion Queue
CREATE TABLE data_ingestion_queue (
    id BIGSERIAL PRIMARY KEY,
    source_system VARCHAR(100) NOT NULL,
    data_type VARCHAR(50) NOT NULL, -- EQUIPMENT_DATA, PRODUCTION_DATA, SENSOR_DATA, etc.
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED
    priority INTEGER DEFAULT 5, -- 1-10, higher is more urgent
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Webhook Delivery Log
CREATE TABLE webhook_delivery_log (
    id BIGSERIAL PRIMARY KEY,
    webhook_config_id BIGINT NOT NULL REFERENCES webhook_config(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload TEXT NOT NULL,
    http_status_code INTEGER,
    response_body TEXT,
    delivery_status VARCHAR(20) NOT NULL, -- SUCCESS, FAILED, PENDING, RETRYING
    attempt_number INTEGER DEFAULT 1,
    error_message TEXT,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_external_system_type ON external_system(system_type);
CREATE INDEX idx_external_system_active ON external_system(is_active);
CREATE INDEX idx_external_system_status ON external_system(connection_status);

CREATE INDEX idx_integration_endpoint_system ON integration_endpoint(external_system_id);
CREATE INDEX idx_integration_endpoint_active ON integration_endpoint(is_active);

CREATE INDEX idx_erp_integration_system ON erp_integration(external_system_id);
CREATE INDEX idx_erp_integration_status ON erp_integration(sync_status);

CREATE INDEX idx_scada_plc_system ON scada_plc_integration(external_system_id);
CREATE INDEX idx_scada_plc_equipment ON scada_plc_integration(equipment_id);
CREATE INDEX idx_scada_plc_status ON scada_plc_integration(connection_status);

CREATE INDEX idx_sensor_integration_system ON sensor_integration(external_system_id);
CREATE INDEX idx_sensor_integration_equipment ON sensor_integration(equipment_id);
CREATE INDEX idx_sensor_integration_type ON sensor_integration(sensor_type);
CREATE INDEX idx_sensor_integration_active ON sensor_integration(is_active);

CREATE INDEX idx_webhook_config_event ON webhook_config(event_type);
CREATE INDEX idx_webhook_config_active ON webhook_config(is_active);

CREATE INDEX idx_integration_log_system ON integration_log(external_system_id);
CREATE INDEX idx_integration_log_type ON integration_log(integration_type);
CREATE INDEX idx_integration_log_timestamp ON integration_log(timestamp);
CREATE INDEX idx_integration_log_status ON integration_log(status);

CREATE INDEX idx_api_key_key ON api_key(api_key);
CREATE INDEX idx_api_key_active ON api_key(is_active);

CREATE INDEX idx_data_ingestion_status ON data_ingestion_queue(status);
CREATE INDEX idx_data_ingestion_priority ON data_ingestion_queue(priority DESC);
CREATE INDEX idx_data_ingestion_created ON data_ingestion_queue(created_at);

CREATE INDEX idx_webhook_delivery_config ON webhook_delivery_log(webhook_config_id);
CREATE INDEX idx_webhook_delivery_status ON webhook_delivery_log(delivery_status);
CREATE INDEX idx_webhook_delivery_created ON webhook_delivery_log(created_at);
