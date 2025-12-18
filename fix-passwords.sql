-- OPTION 1: If using Docker (start Docker Desktop first)
-- docker exec -i mes_postgres psql -U mes_user -d mes_db < fix-passwords.sql

-- OPTION 2: If PostgreSQL is installed locally
-- psql -U postgres -d mes_db -f fix-passwords.sql

-- OPTION 3: Easiest - Drop and recreate database (all migrations will run fresh)
-- This will reset everything including the passwords
-- DROP DATABASE mes_db;
-- CREATE DATABASE mes_db;
-- Then restart your Spring Boot application

-- Quick fix: Update passwords directly
UPDATE users SET password = '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG' WHERE username = 'admin';
UPDATE users SET password = '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG' WHERE username = 'supervisor';
UPDATE users SET password = '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG' WHERE username = 'operator';
UPDATE users SET password = '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG' WHERE username = 'viewer';

SELECT username, email, role, 'password' as password_hint FROM users;
