-- MES Database Verification Script
-- Run this after starting the backend application to verify everything is set up correctly

-- Connect to the database first:
-- psql -U mes_user -d mes_db -f verify-setup.sql

\echo '=== MES Database Verification ==='
\echo ''

-- Check database connection
\echo '1. Database Connection:'
SELECT current_database() as database, current_user as user, version();
\echo ''

-- Check all tables exist
\echo '2. Tables:'
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
\echo ''

-- Check table row counts
\echo '3. Table Row Counts:'
SELECT 
    'equipment' as table_name, 
    COUNT(*) as row_count 
FROM equipment
UNION ALL
SELECT 'production_order', COUNT(*) FROM production_order
UNION ALL
SELECT 'equipment_log', COUNT(*) FROM equipment_log
UNION ALL
SELECT 'downtime_event', COUNT(*) FROM downtime_event
UNION ALL
SELECT 'quality_check', COUNT(*) FROM quality_check;
\echo ''

-- Check indexes
\echo '4. Indexes:'
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
\echo ''

-- Check foreign keys
\echo '5. Foreign Key Constraints:'
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;
\echo ''

-- Check Flyway migration history
\echo '6. Flyway Migration History:'
SELECT 
    installed_rank,
    version,
    description,
    type,
    script,
    installed_on,
    success
FROM flyway_schema_history
ORDER BY installed_rank;
\echo ''

-- Check table structures
\echo '7. Equipment Table Structure:'
\d equipment
\echo ''

\echo '8. Production Order Table Structure:'
\d production_order
\echo ''

\echo '9. Equipment Log Table Structure:'
\d equipment_log
\echo ''

\echo '10. Downtime Event Table Structure:'
\d downtime_event
\echo ''

\echo '11. Quality Check Table Structure:'
\d quality_check
\echo ''

\echo '=== Verification Complete ==='
\echo ''
\echo 'If you see all tables and indexes listed above, your database is set up correctly!'
\echo 'You can now use the MES application.'
