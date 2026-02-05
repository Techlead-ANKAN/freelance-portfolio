-- Add currency column to invoices table
-- Copy and paste this into your Supabase SQL Editor

ALTER TABLE invoices 
ADD COLUMN currency varchar(10) DEFAULT 'INR' CHECK (currency IN ('INR', 'USD'));

-- Update existing records to have INR as default currency
UPDATE invoices SET currency = 'INR' WHERE currency IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN invoices.currency IS 'Currency for the invoice amount (INR or USD)';

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'invoices' AND column_name = 'currency';