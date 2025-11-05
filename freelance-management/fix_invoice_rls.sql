-- Fix Invoice RLS Policy
-- Run this in your Supabase SQL editor

-- Option 1: Disable RLS temporarily for development (less secure but works)
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled, use this simple policy
-- First, drop the existing policy
-- DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
-- DROP POLICY IF EXISTS "Users can manage their invoices" ON invoices;

-- Create a simple policy that allows all operations (for development)
-- CREATE POLICY "Allow all operations" ON invoices
--     FOR ALL USING (true);

-- Enable RLS with the new policy
-- ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Note: For production, you should implement proper authentication and use:
-- CREATE POLICY "Users can manage their invoices" ON invoices
--     FOR ALL USING (
--         auth.uid() IS NOT NULL AND 
--         project_id IN (
--             SELECT id FROM projects 
--             WHERE user_id = auth.uid()
--         )
--     );