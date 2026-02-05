-- Add currency and actual_received_amount columns to projects table
-- This allows tracking payment currency and actual amount received after conversion

-- Add currency column (defaults to INR)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'INR';

-- Add actual_received_amount column for storing converted amount in INR
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS actual_received_amount DECIMAL(15, 2) DEFAULT NULL;

-- Add comment to explain the purpose
COMMENT ON COLUMN projects.currency IS 'Currency code for project payments (INR, USD, EUR, GBP, AED, KES)';
COMMENT ON COLUMN projects.actual_received_amount IS 'Actual amount received in INR after currency conversion (optional)';

-- Update existing projects to have INR as default currency if null
UPDATE projects 
SET currency = 'INR' 
WHERE currency IS NULL;

-- Create index for currency filtering
CREATE INDEX IF NOT EXISTS idx_projects_currency ON projects(currency);
