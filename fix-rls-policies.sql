-- Fix RLS policies to allow public read access to restaurants, categories, and items

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."restaurants";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."categories";  
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."items";

-- Create new policies that allow public read access
CREATE POLICY "Enable read access for all users" ON "public"."restaurants" 
FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."categories" 
FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."items" 
FOR SELECT USING (true);

-- Ensure RLS is enabled on all tables
ALTER TABLE "public"."restaurants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."items" ENABLE ROW LEVEL SECURITY;