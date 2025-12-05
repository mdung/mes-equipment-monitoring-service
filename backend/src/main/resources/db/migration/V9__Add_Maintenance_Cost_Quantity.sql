-- Add quantity column to maintenance_costs table
ALTER TABLE maintenance_costs ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1;
