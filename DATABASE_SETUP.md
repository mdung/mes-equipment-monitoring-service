# Database Setup Guide

This guide explains how to set up PostgreSQL for the MES application using Flyway migrations.

## Prerequisites

- PostgreSQL 15+ installed on your system
- Access to PostgreSQL superuser (usually `postgres`)

## Installation

### Windows
Download and install from: https://www.postgresql.org/download/windows/

### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Database Configuration

### Step 1: Create Database and User

Connect to PostgreSQL as superuser:

```bash
psql -U postgres
```

Run the following SQL commands:

```sql
-- Create the database
CREATE DATABASE mes_db;

-- Create the user
CREATE USER mes_user WITH PASSWORD 'mes_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE mes_db TO mes_user;

-- Connect to the new database
\c mes_db

-- Grant schema privileges (PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO mes_user;

-- Grant default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO mes_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO mes_user;

-- Exit psql
\q
```

### Step 2: Verify Database Setup

Test the connection:

```bash
psql -U mes_user -d mes_db -c "SELECT version();"
```

You should see the PostgreSQL version information.

## Flyway Migration

The application uses Flyway for database schema management. The migration will run automatically when you start the backend application.

### Migration File Location

```
backend/src/main/resources/db/migration/V1__Schema.sql
```

### What Flyway Creates

When you first run the backend, Flyway will create:

1. **Tables**:
   - `equipment` - Equipment master data
   - `production_order` - Production orders
   - `equipment_log` - Equipment sensor logs
   - `downtime_event` - Downtime tracking
   - `quality_check` - Quality inspection records

2. **Indexes**:
   - `idx_equipment_status` - For equipment status queries
   - `idx_po_status` - For production order status queries
   - `idx_log_equipment_time` - For equipment log time-series queries
   - `idx_quality_order` - For quality checks by order
   - `idx_downtime_equipment` - For downtime by equipment

3. **Flyway Metadata**:
   - `flyway_schema_history` - Tracks applied migrations

### Flyway Configuration

In `application.properties`:

```properties
# Flyway
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
```

- `enabled=true` - Flyway is active
- `baseline-on-migrate=true` - Allows Flyway to work with existing databases

## Verification

After starting the backend application, verify the schema:

```bash
psql -U mes_user -d mes_db
```

### Check Tables

```sql
\dt

-- Expected output:
--  Schema |         Name          | Type  |  Owner   
-- --------+-----------------------+-------+----------
--  public | downtime_event        | table | mes_user
--  public | equipment             | table | mes_user
--  public | equipment_log         | table | mes_user
--  public | flyway_schema_history | table | mes_user
--  public | production_order      | table | mes_user
--  public | quality_check         | table | mes_user
```

### Check Indexes

```sql
\di

-- Should show all 5 indexes plus primary key indexes
```

### Check Flyway History

```sql
SELECT * FROM flyway_schema_history;

-- Should show V1__Schema.sql as successfully applied
```

### Check Table Structure

```sql
\d equipment
\d production_order
\d equipment_log
\d downtime_event
\d quality_check
```

## Troubleshooting

### Permission Denied Error

If you get permission errors, ensure the user has proper grants:

```sql
-- Connect as postgres
psql -U postgres -d mes_db

-- Grant all privileges
GRANT ALL ON SCHEMA public TO mes_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO mes_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO mes_user;
```

### Flyway Baseline Error

If Flyway complains about existing schema:

```sql
-- Connect as mes_user
psql -U mes_user -d mes_db

-- Drop all tables (WARNING: This deletes all data!)
DROP TABLE IF EXISTS quality_check CASCADE;
DROP TABLE IF EXISTS downtime_event CASCADE;
DROP TABLE IF EXISTS equipment_log CASCADE;
DROP TABLE IF EXISTS production_order CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS flyway_schema_history CASCADE;
```

Then restart the backend application.

### Connection Refused

Check if PostgreSQL is running:

```bash
# Linux/macOS
sudo systemctl status postgresql

# macOS (Homebrew)
brew services list

# Windows
# Check Services app for "postgresql" service
```

### Wrong Password

Update the password in `application.properties`:

```properties
spring.datasource.password=your_actual_password
```

Or reset the user password:

```sql
-- Connect as postgres
psql -U postgres

ALTER USER mes_user WITH PASSWORD 'new_password';
```

## Resetting the Database

To start fresh:

```bash
# Connect as postgres
psql -U postgres

-- Drop and recreate
DROP DATABASE mes_db;
CREATE DATABASE mes_db;
GRANT ALL PRIVILEGES ON DATABASE mes_db TO mes_user;

\c mes_db
GRANT ALL ON SCHEMA public TO mes_user;
\q
```

Then restart the backend application to run migrations again.

## Production Considerations

For production environments:

1. **Use strong passwords**:
   ```sql
   CREATE USER mes_user WITH PASSWORD 'strong_random_password_here';
   ```

2. **Restrict permissions**:
   ```sql
   -- Grant only necessary privileges
   GRANT CONNECT ON DATABASE mes_db TO mes_user;
   GRANT USAGE ON SCHEMA public TO mes_user;
   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO mes_user;
   ```

3. **Enable SSL**:
   Update `application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/mes_db?ssl=true&sslmode=require
   ```

4. **Use environment variables**:
   ```properties
   spring.datasource.username=${DB_USERNAME:mes_user}
   spring.datasource.password=${DB_PASSWORD:mes_password}
   ```

5. **Regular backups**:
   ```bash
   pg_dump -U mes_user mes_db > mes_backup_$(date +%Y%m%d).sql
   ```

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Flyway Documentation](https://flywaydb.org/documentation/)
- [Spring Boot with Flyway](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.data-initialization.migration-tool.flyway)
