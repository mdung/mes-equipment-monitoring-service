-- Update all user passwords to "password"
-- Run this in your PostgreSQL database tool (the one shown in your screenshot)

UPDATE users 
SET password = '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG' 
WHERE username IN ('admin', 'supervisor', 'operator', 'viewer');

-- Verify the update
SELECT username, email, role, 'password' as password_hint FROM users;
