-- MES Equipment Monitoring System - Sample Data Population
-- Run this SQL script in your PostgreSQL database to populate with realistic data

-- Clear existing data (optional - remove if you want to keep existing data)
-- TRUNCATE TABLE equipment, production_order, alerts, activities, shifts, shift_messages RESTART IDENTITY CASCADE;

-- 1. Insert Equipment Data
INSERT INTO equipment (name, code, location, status, ideal_cycle_time, created_at, updated_at) VALUES
('CNC Machine A1', 'CNC-001', 'Floor A - Zone 1', 'RUNNING', 120, NOW(), NOW()),
('CNC Machine A2', 'CNC-002', 'Floor A - Zone 1', 'RUNNING', 115, NOW(), NOW()),
('Assembly Line B1', 'ASM-001', 'Floor B - Zone 2', 'RUNNING', 90, NOW(), NOW()),
('Assembly Line B2', 'ASM-002', 'Floor B - Zone 2', 'IDLE', 95, NOW(), NOW()),
('Quality Station C1', 'QC-001', 'Floor C - Zone 3', 'RUNNING', 60, NOW(), NOW()),
('Quality Station C2', 'QC-002', 'Floor C - Zone 3', 'IDLE', 65, NOW(), NOW()),
('Packaging Unit D1', 'PKG-001', 'Floor D - Zone 4', 'RUNNING', 45, NOW(), NOW()),
('Packaging Unit D2', 'PKG-002', 'Floor D - Zone 4', 'RUNNING', 50, NOW(), NOW()),
('Welding Robot E1', 'WLD-001', 'Floor A - Zone 5', 'DOWN', 180, NOW(), NOW()),
('Welding Robot E2', 'WLD-002', 'Floor A - Zone 5', 'MAINTENANCE', 175, NOW(), NOW()),
('Paint Booth F1', 'PNT-001', 'Floor B - Zone 6', 'RUNNING', 240, NOW(), NOW()),
('Paint Booth F2', 'PNT-002', 'Floor B - Zone 6', 'IDLE', 235, NOW(), NOW()),
('Injection Molding G1', 'INJ-001', 'Floor C - Zone 7', 'RUNNING', 300, NOW(), NOW()),
('Injection Molding G2', 'INJ-002', 'Floor C - Zone 7', 'RUNNING', 295, NOW(), NOW()),
('Laser Cutter H1', 'LSR-001', 'Floor D - Zone 8', 'IDLE', 150, NOW(), NOW());

-- 2. Insert Production Orders
INSERT INTO production_order (order_number, product_name, target_quantity, produced_quantity, status, equipment_id, start_time, end_time, created_at, updated_at) VALUES
('ORD-2024-001', 'Widget Alpha', 500, 342, 'IN_PROGRESS', 1, NOW() - INTERVAL '4 hours', NULL, NOW(), NOW()),
('ORD-2024-002', 'Component Beta', 300, 156, 'IN_PROGRESS', 3, NOW() - INTERVAL '2 hours', NULL, NOW(), NOW()),
('ORD-2024-003', 'Assembly Gamma', 200, 89, 'IN_PROGRESS', 5, NOW() - INTERVAL '1 hour', NULL, NOW(), NOW()),
('ORD-2024-004', 'Part Delta', 750, 623, 'IN_PROGRESS', 7, NOW() - INTERVAL '6 hours', NULL, NOW(), NOW()),
('ORD-2024-005', 'Module Epsilon', 400, 267, 'IN_PROGRESS', 11, NOW() - INTERVAL '3 hours', NULL, NOW(), NOW()),
('ORD-2024-006', 'Housing Zeta', 150, 98, 'IN_PROGRESS', 13, NOW() - INTERVAL '2.5 hours', NULL, NOW(), NOW()),
('ORD-2024-007', 'Bracket Eta', 600, 445, 'IN_PROGRESS', 14, NOW() - INTERVAL '5 hours', NULL, NOW(), NOW()),
('ORD-2024-008', 'Cover Theta', 250, 0, 'PENDING', NULL, NULL, NULL, NOW(), NOW()),
('ORD-2024-009', 'Base Iota', 350, 350, 'COMPLETED', 1, NOW() - INTERVAL '8 hours', NOW() - INTERVAL '1 hour', NOW(), NOW()),
('ORD-2024-010', 'Frame Kappa', 180, 134, 'IN_PROGRESS', 3, NOW() - INTERVAL '1.5 hours', NULL, NOW(), NOW());

-- 3. Insert Shifts
INSERT INTO shifts (name, start_time, end_time, supervisor, status, created_at, updated_at) VALUES
('Day Shift', '06:00:00', '14:00:00', 'John Smith', 'ACTIVE', NOW(), NOW()),
('Evening Shift', '14:00:00', '22:00:00', 'Sarah Johnson', 'SCHEDULED', NOW(), NOW()),
('Night Shift', '22:00:00', '06:00:00', 'Mike Wilson', 'SCHEDULED', NOW(), NOW());

-- 4. Insert Alerts
INSERT INTO alerts (title, message, severity, status, equipment_id, triggered_at, acknowledged_at, created_at, updated_at) VALUES
('High Temperature Warning', 'CNC Machine A1 temperature exceeds normal operating range (85°C)', 'HIGH', 'ACTIVE', 1, NOW() - INTERVAL '15 minutes', NULL, NOW(), NOW()),
('Maintenance Required', 'Welding Robot E2 scheduled maintenance overdue by 2 days', 'MEDIUM', 'ACTIVE', 10, NOW() - INTERVAL '2 hours', NULL, NOW(), NOW()),
('Production Target Behind', 'Assembly Line B2 is 15% behind production target', 'MEDIUM', 'ACTIVE', 4, NOW() - INTERVAL '30 minutes', NULL, NOW(), NOW()),
('Equipment Offline', 'Welding Robot E1 has been offline for 45 minutes', 'HIGH', 'ACTIVE', 9, NOW() - INTERVAL '45 minutes', NULL, NOW(), NOW()),
('Quality Check Failed', 'Quality Station C2 detected 3 defective parts in last batch', 'HIGH', 'ACKNOWLEDGED', 6, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '30 minutes', NOW(), NOW()),
('Low Material Level', 'Paint Booth F1 paint level below 20%', 'LOW', 'ACTIVE', 11, NOW() - INTERVAL '20 minutes', NULL, NOW(), NOW()),
('Cycle Time Exceeded', 'Injection Molding G1 cycle time 15% above target', 'MEDIUM', 'ACTIVE', 13, NOW() - INTERVAL '10 minutes', NULL, NOW(), NOW()),
('Operator Break Overdue', 'Packaging Unit D1 operator break overdue by 30 minutes', 'LOW', 'ACTIVE', 7, NOW() - INTERVAL '35 minutes', NULL, NOW(), NOW());

-- 5. Insert Activities (for activity feed)
INSERT INTO activities (message, type, equipment_id, user_id, timestamp, created_at, updated_at) VALUES
('CNC Machine A1 started production run ORD-2024-001', 'INFO', 1, 1, NOW() - INTERVAL '4 hours', NOW(), NOW()),
('Quality check completed for batch QC-2024-156', 'SUCCESS', 5, 1, NOW() - INTERVAL '3 hours', NOW(), NOW()),
('Welding Robot E1 emergency stop activated', 'ERROR', 9, 1, NOW() - INTERVAL '45 minutes', NOW(), NOW()),
('Assembly Line B1 reached 50% production target', 'SUCCESS', 3, 1, NOW() - INTERVAL '2 hours', NOW(), NOW()),
('Maintenance completed on Paint Booth F2', 'INFO', 12, 1, NOW() - INTERVAL '1 hour', NOW(), NOW()),
('Production order ORD-2024-009 completed successfully', 'SUCCESS', 1, 1, NOW() - INTERVAL '1 hour', NOW(), NOW()),
('Temperature alert triggered on CNC Machine A1', 'WARNING', 1, 1, NOW() - INTERVAL '15 minutes', NOW(), NOW()),
('Shift handover completed - Day to Evening', 'INFO', NULL, 1, NOW() - INTERVAL '30 minutes', NOW(), NOW()),
('Quality inspection started for batch QC-2024-157', 'INFO', 6, 1, NOW() - INTERVAL '10 minutes', NOW(), NOW()),
('Packaging Unit D2 cycle time optimized', 'SUCCESS', 8, 1, NOW() - INTERVAL '5 minutes', NOW(), NOW());

-- 6. Insert Shift Messages (for chat functionality)
INSERT INTO shift_messages (shift_id, user_id, username, full_name, message, timestamp, created_at, updated_at) VALUES
(1, 1, 'admin', 'System Administrator', 'Day shift starting - all equipment operational except WLD-001', NOW() - INTERVAL '4 hours', NOW(), NOW()),
(1, 2, 'supervisor', 'Production Supervisor', 'CNC-001 running hot, monitoring temperature closely', NOW() - INTERVAL '3 hours', NOW(), NOW()),
(1, 1, 'admin', 'System Administrator', 'Quality check on batch QC-2024-156 passed all tests', NOW() - INTERVAL '2 hours', NOW(), NOW()),
(1, 3, 'operator', 'Machine Operator', 'WLD-001 emergency stop - investigating cause', NOW() - INTERVAL '1 hour', NOW(), NOW()),
(1, 2, 'supervisor', 'Production Supervisor', 'Maintenance team dispatched to WLD-001', NOW() - INTERVAL '45 minutes', NOW(), NOW()),
(1, 1, 'admin', 'System Administrator', 'ORD-2024-009 completed ahead of schedule', NOW() - INTERVAL '30 minutes', NOW(), NOW()),
(1, 3, 'operator', 'Machine Operator', 'CNC-001 temperature stabilized after coolant adjustment', NOW() - INTERVAL '15 minutes', NOW(), NOW()),
(1, 2, 'supervisor', 'Production Supervisor', 'All stations ready for evening shift handover', NOW() - INTERVAL '5 minutes', NOW(), NOW());

-- 7. Update equipment with some realistic OEE data (if OEE table exists)
-- Note: Adjust table name and columns based on your actual OEE table structure
-- INSERT INTO oee_data (equipment_id, availability, performance, quality, oee, recorded_at) VALUES
-- (1, 95.5, 87.2, 98.1, 81.7, NOW()),
-- (3, 92.3, 89.5, 96.8, 79.9, NOW()),
-- (5, 88.7, 91.2, 99.2, 80.2, NOW()),
-- (7, 96.1, 85.3, 97.5, 79.9, NOW()),
-- (11, 89.4, 88.7, 95.3, 75.6, NOW()),
-- (13, 93.2, 92.1, 98.7, 84.7, NOW()),
-- (14, 91.8, 87.9, 96.2, 77.6, NOW());

-- 8. Insert some quality check records (if quality_checks table exists)
-- INSERT INTO quality_checks (order_id, equipment_id, inspector, status, defects_found, notes, checked_at) VALUES
-- (1, 5, 'Quality Inspector A', 'PASSED', 0, 'All parameters within specification', NOW() - INTERVAL '2 hours'),
-- (2, 6, 'Quality Inspector B', 'FAILED', 3, 'Surface finish below standard on 3 units', NOW() - INTERVAL '1 hour'),
-- (3, 5, 'Quality Inspector A', 'PASSED', 0, 'Excellent quality - zero defects', NOW() - INTERVAL '30 minutes'),
-- (4, 6, 'Quality Inspector C', 'PASSED', 1, 'Minor cosmetic defect on 1 unit - acceptable', NOW() - INTERVAL '15 minutes');

-- 9. Insert maintenance records (if maintenance table exists)
-- INSERT INTO maintenance (equipment_id, type, description, scheduled_date, completed_date, technician, status) VALUES
-- (10, 'PREVENTIVE', 'Monthly welding robot calibration and cleaning', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'Tech Team A', 'COMPLETED'),
-- (9, 'CORRECTIVE', 'Emergency stop system repair', NOW(), NULL, 'Tech Team B', 'IN_PROGRESS'),
-- (12, 'PREVENTIVE', 'Paint booth filter replacement', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 hour', 'Tech Team C', 'COMPLETED'),
-- (2, 'PREVENTIVE', 'CNC machine tool calibration', NOW() + INTERVAL '3 days', NULL, NULL, 'SCHEDULED');

-- Verify the data insertion
SELECT 'Equipment Count' as table_name, COUNT(*) as record_count FROM equipment
UNION ALL
SELECT 'Production Orders', COUNT(*) FROM production_order
UNION ALL
SELECT 'Shifts', COUNT(*) FROM shifts
UNION ALL
SELECT 'Alerts', COUNT(*) FROM alerts
UNION ALL
SELECT 'Activities', COUNT(*) FROM activities
UNION ALL
SELECT 'Shift Messages', COUNT(*) FROM shift_messages;

-- Show sample data
SELECT 'EQUIPMENT SAMPLE:' as info;
SELECT name, code, location, status FROM equipment LIMIT 5;

SELECT 'PRODUCTION ORDERS SAMPLE:' as info;
SELECT order_number, product_name, target_quantity, produced_quantity, status FROM production_order LIMIT 5;

SELECT 'ACTIVE ALERTS SAMPLE:' as info;
SELECT title, severity, status FROM alerts WHERE status = 'ACTIVE' LIMIT 5;