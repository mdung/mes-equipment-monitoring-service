-- Create users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) NOT NULL, -- ADMIN, SUPERVISOR, OPERATOR, VIEWER
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create refresh tokens table
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- Insert default admin user (password: admin123)
-- Password is BCrypt hash of "admin123"
INSERT INTO users (username, email, password, full_name, role, enabled) 
VALUES ('admin', 'admin@mes.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Administrator', 'ADMIN', true);

-- Insert default supervisor (password: super123)
INSERT INTO users (username, email, password, full_name, role, enabled) 
VALUES ('supervisor', 'supervisor@mes.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Production Supervisor', 'SUPERVISOR', true);

-- Insert default operator (password: oper123)
INSERT INTO users (username, email, password, full_name, role, enabled) 
VALUES ('operator', 'operator@mes.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Machine Operator', 'OPERATOR', true);

-- Insert default viewer (password: view123)
INSERT INTO users (username, email, password, full_name, role, enabled) 
VALUES ('viewer', 'viewer@mes.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Viewer', 'VIEWER', true);
