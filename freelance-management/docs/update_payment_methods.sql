-- Update payment_method constraint to include modern payment methods
-- Run this in your Supabase SQL editor

-- First, check what payment methods currently exist in the table
SELECT DISTINCT payment_method FROM invoices;

-- Update existing payment methods to match new constraint values
-- Map old payment methods to new ones
UPDATE invoices 
SET payment_method = CASE 
    WHEN payment_method = 'Online Transfer' THEN 'Bank Transfer'
    WHEN payment_method = 'Wire transfer' THEN 'Wire Transfer'
    WHEN payment_method = 'wire transfer' THEN 'Wire Transfer'
    WHEN payment_method = 'online transfer' THEN 'Bank Transfer'
    WHEN payment_method = 'bank transfer' THEN 'Bank Transfer'
    WHEN payment_method = 'upi' THEN 'UPI'
    WHEN payment_method = 'paypal' THEN 'PayPal'
    WHEN payment_method = 'cash' THEN 'Cash'
    WHEN payment_method = 'cheque' THEN 'Cheque'
    ELSE payment_method
END
WHERE payment_method NOT IN (
    'UPI', 'Bank Transfer', 'PayPal', 'Stripe', 'Razorpay', 'Paytm', 'PhonePe',
    'Google Pay', 'Apple Pay', 'Crypto (USDT)', 'Crypto (Bitcoin)', 'Crypto (Ethereum)',
    'Wire Transfer', 'Western Union', 'MoneyGram', 'Wise (formerly TransferWise)',
    'Payoneer', 'Skrill', 'Neteller', 'MPesa', 'Bkash', 'Cash', 'Cheque', 'Other'
);

-- If there are still any unmatched payment methods, set them to 'Other'
UPDATE invoices 
SET payment_method = 'Other'
WHERE payment_method NOT IN (
    'UPI', 'Bank Transfer', 'PayPal', 'Stripe', 'Razorpay', 'Paytm', 'PhonePe',
    'Google Pay', 'Apple Pay', 'Crypto (USDT)', 'Crypto (Bitcoin)', 'Crypto (Ethereum)',
    'Wire Transfer', 'Western Union', 'MoneyGram', 'Wise (formerly TransferWise)',
    'Payoneer', 'Skrill', 'Neteller', 'MPesa', 'Bkash', 'Cash', 'Cheque', 'Other'
);

-- Now drop the existing constraint
ALTER TABLE invoices 
DROP CONSTRAINT IF EXISTS invoices_payment_method_check;

-- Add the new constraint with expanded payment methods
ALTER TABLE invoices 
ADD CONSTRAINT invoices_payment_method_check 
CHECK (payment_method IN (
    'UPI',
    'Bank Transfer', 
    'PayPal',
    'Stripe',
    'Razorpay',
    'Paytm',
    'PhonePe',
    'Google Pay',
    'Apple Pay',
    'Crypto (USDT)',
    'Crypto (Bitcoin)',
    'Crypto (Ethereum)',
    'Wire Transfer',
    'Western Union',
    'MoneyGram',
    'Wise (formerly TransferWise)',
    'Payoneer',
    'Skrill',
    'Neteller',
    'MPesa',
    'Bkash',
    'Cash',
    'Cheque',
    'Other'
));

-- Update the comment for documentation
COMMENT ON COLUMN invoices.payment_method IS 'Payment method for the invoice - supports traditional, digital, and crypto payments';

-- Update clients table payment_mode constraint if it exists
-- First check if clients table has a payment_mode constraint
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'clients'::regclass 
        AND conname LIKE '%payment_mode%'
    ) THEN
        ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_payment_mode_check;
    END IF;
    
    -- Add new constraint for clients payment_mode if column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'payment_mode'
    ) THEN
        ALTER TABLE clients 
        ADD CONSTRAINT clients_payment_mode_check 
        CHECK (payment_mode IN (
            'UPI', 'Bank Transfer', 'PayPal', 'Stripe', 'Razorpay', 'Paytm', 'PhonePe',
            'Google Pay', 'Apple Pay', 'Crypto (USDT)', 'Crypto (Bitcoin)', 'Crypto (Ethereum)',
            'Wire Transfer', 'Western Union', 'MoneyGram', 'Wise (formerly TransferWise)',
            'Payoneer', 'Skrill', 'Neteller', 'MPesa', 'Bkash', 'Cash', 'Cheque', 'Other'
        ));
    END IF;
END $$;

-- Verify the constraints were added successfully
SELECT 
    t.table_name,
    c.conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition 
FROM pg_constraint c
JOIN pg_class r ON c.conrelid = r.oid
JOIN information_schema.tables t ON r.relname = t.table_name
WHERE t.table_name IN ('invoices', 'clients') 
AND c.conname LIKE '%payment%';