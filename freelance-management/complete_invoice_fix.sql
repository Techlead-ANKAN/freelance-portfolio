-- Complete Solution for Invoice RLS Issue
-- Run this entire script in your Supabase SQL editor

-- STEP 1: Check if the table exists and its current state
-- This will show you the current policies
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'invoices';

-- STEP 2: Remove all existing policies for invoices table
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can manage their invoices" ON invoices;
DROP POLICY IF EXISTS "Allow all operations" ON invoices;
DROP POLICY IF EXISTS "Authenticated users can manage invoices" ON invoices;

-- STEP 3: Disable RLS temporarily to allow development
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;

-- STEP 4: Test if the table works now
-- You can try creating an invoice from your app at this point

-- STEP 5: (Optional) If you want to re-enable RLS later with a permissive policy
-- Uncomment the lines below when you're ready to add back security:

-- ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all for development" ON invoices
--     FOR ALL 
--     TO authenticated, anon
--     USING (true)
--     WITH CHECK (true);

-- STEP 6: Check projects table structure to ensure it exists
-- This will help us understand the relationship
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'projects' 
ORDER BY ordinal_position;

-- STEP 7: Check clients table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;