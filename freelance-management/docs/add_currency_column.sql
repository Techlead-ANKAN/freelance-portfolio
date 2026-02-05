-- Add currency column to invoices table
-- Run this in your Supabase SQL editor

ALTER TABLE invoices 
ADD COLUMN currency varchar(10) DEFAULT 'INR' CHECK (currency IN ('INR', 'USD'));

-- Update existing records to have INR as default currency
UPDATE invoices SET currency = 'INR' WHERE currency IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN invoices.currency IS 'Currency for the invoice amount (INR or USD)';