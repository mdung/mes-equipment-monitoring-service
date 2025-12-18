-- Add ideal_cycle_time column to equipment table for OEE calculations
-- This column stores the ideal cycle time in seconds per unit
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS ideal_cycle_time DECIMAL(10, 4);


