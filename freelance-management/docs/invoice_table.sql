-- SQL Table for Invoice Management
-- Copy and paste this into your Supabase SQL editor

CREATE TABLE invoices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Invoice Details
    invoice_number varchar(50) UNIQUE NOT NULL,
    invoice_type varchar(20) NOT NULL CHECK (invoice_type IN ('advance', 'final', 'partial')),
    
    -- Dates
    invoice_date date NOT NULL DEFAULT CURRENT_DATE,
    due_date date NOT NULL,
    
    -- Amounts (in INR)
    amount numeric(10,2) NOT NULL,
    description text,
    
    -- Services/Items (JSON array)
    services jsonb DEFAULT '[]',
    
    -- Status
    status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid', 'overdue', 'cancelled')),
    
    -- Payment Details
    payment_method varchar(50) DEFAULT 'UPI' CHECK (payment_method IN ('UPI', 'Bank Transfer', 'Cash', 'Cheque', 'Online Transfer')),
    payment_terms text DEFAULT '15 days from invoice date',
    
    -- Additional Notes
    notes text,
    
    -- Metadata
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS (Row Level Security)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Users can view their own invoices" ON invoices
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX idx_invoices_project_id ON invoices(project_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);

-- Create a function to auto-generate random invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS varchar(50) AS $$
DECLARE
    random_number varchar(10);
    invoice_num varchar(50);
    exists_check integer;
BEGIN
    LOOP
        -- Generate a random 6-digit number
        random_number := LPAD(FLOOR(RANDOM() * 999999 + 100000)::text, 6, '0');
        
        -- Format as INV-XXXXXX (e.g., INV-847392)
        invoice_num := 'INV-' || random_number;
        
        -- Check if this invoice number already exists
        SELECT COUNT(*) INTO exists_check 
        FROM invoices 
        WHERE invoice_number = invoice_num;
        
        -- If it doesn't exist, we can use it
        IF exists_check = 0 THEN
            EXIT;
        END IF;
        
        -- If it exists, the loop will continue and generate a new random number
    END LOOP;
    
    RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoices_updated_at 
    BEFORE UPDATE ON invoices 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to auto-generate invoice number if not provided
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate if invoice_number is NULL or empty
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        NEW.invoice_number := generate_invoice_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number_trigger
    BEFORE INSERT ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION set_invoice_number();

-- Sample payment methods available:
-- 'UPI' - For UPI payments
-- 'Bank Transfer' - For direct bank transfers  
-- 'Cash' - For cash payments
-- 'Cheque' - For cheque payments
-- 'Online Transfer' - For other online payment methods

-- Sample services JSON structure
-- [
--   {
--     "description": "Website Development",
--     "quantity": 1,
--     "rate": 4000,
--     "amount": 4000
--   },
--   {
--     "description": "SEO Optimization", 
--     "quantity": 1,
--     "rate": 1500,
--     "amount": 1500
--   }
-- ]