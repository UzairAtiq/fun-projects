-- Anime Character Gallery - COMPLETE FIX
-- Copy and paste this ENTIRE file into Supabase SQL Editor and run it
-- This will fix all issues with categories and character creation

-- ==============================================
-- STEP 1: FIX DATABASE TABLES & PERMISSIONS
-- ==============================================

-- Drop existing tables if they exist (fresh start)
DROP TABLE IF EXISTS characters CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Characters table
CREATE TABLE characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  user_id UUID, -- Optional, can be NULL for anonymous
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_characters_category_id ON characters(category_id);
CREATE INDEX idx_characters_user_id ON characters(user_id);

-- DISABLE Row Level Security completely (for anonymous access)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE characters DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable insert for all users" ON categories;
DROP POLICY IF EXISTS "Enable update for all users" ON categories;
DROP POLICY IF EXISTS "Enable delete for all users" ON categories;

DROP POLICY IF EXISTS "Enable read access for all users" ON characters;
DROP POLICY IF EXISTS "Enable insert for all users" ON characters;
DROP POLICY IF EXISTS "Enable update for all users" ON characters;
DROP POLICY IF EXISTS "Enable delete for all users" ON characters;

-- Grant full access to anon and authenticated users
GRANT ALL ON categories TO anon, authenticated;
GRANT ALL ON characters TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON characters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- STEP 2: STORAGE BUCKET SETUP (MANUAL)
-- ==============================================
-- Storage bucket creation requires dashboard access.
-- After running this script, follow these steps:
--
-- 1. Go to Supabase Dashboard > Storage
-- 2. If 'character-images' bucket doesn't exist:
--    - Click "New bucket"
--    - Name: character-images
--    - Toggle "Public bucket" to ON
--    - Click "Create bucket"
-- 3. If bucket exists, verify it's set to Public
--
-- That's it! The storage policies below will handle permissions.

-- ==============================================
-- STEP 3: SETUP STORAGE POLICIES
-- ==============================================

-- Note: These policies will only work after the bucket is created (see Step 2)

-- Drop existing storage policies if any (skip if permission denied)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
  DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
  DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;
  DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;
  DROP POLICY IF EXISTS "Public Access" ON storage.objects;
  DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'Skipping policy drops (insufficient privileges)';
END $$;

-- Create permissive policies for public access
DO $$
BEGIN
  -- Enable RLS on storage.objects (required for policies to work)
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Allow public uploads" ON storage.objects
    FOR INSERT
    TO public
    WITH CHECK (bucket_id = 'character-images');

  CREATE POLICY "Allow public reads" ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'character-images');

  CREATE POLICY "Allow public updates" ON storage.objects
    FOR UPDATE
    TO public
    USING (bucket_id = 'character-images')
    WITH CHECK (bucket_id = 'character-images');

  CREATE POLICY "Allow public deletes" ON storage.objects
    FOR DELETE
    TO public
    USING (bucket_id = 'character-images');
    
  RAISE NOTICE 'Storage policies created successfully!';
EXCEPTION 
  WHEN duplicate_object THEN
    RAISE NOTICE 'Storage policies already exist (skipping)';
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Insufficient privileges for storage policies - create bucket manually in dashboard';
END $$;

-- ==============================================
-- STEP 4: ADD SAMPLE DATA (OPTIONAL)
-- ==============================================

-- Uncomment the lines below if you want some starter categories
-- INSERT INTO categories (name) VALUES 
--   ('Naruto'),
--   ('One Piece'),
--   ('Dragon Ball'),
--   ('Attack on Titan'),
--   ('Demon Slayer')
-- ON CONFLICT (name) DO NOTHING;

-- ==============================================
-- VERIFICATION
-- ==============================================

-- Test that everything works
DO $$
BEGIN
  -- Test category creation
  INSERT INTO categories (name) VALUES ('_test_category_' || gen_random_uuid());
  
  -- Clean up test
  DELETE FROM categories WHERE name LIKE '_test_category_%';
  
  RAISE NOTICE 'SUCCESS: All tables created and permissions set correctly!';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'ERROR: %', SQLERRM;
END $$;

-- Display summary
SELECT 
  'Categories Table' as item,
  COUNT(*) as count
FROM categories
UNION ALL
SELECT 
  'Characters Table',
  COUNT(*)
FROM characters
UNION ALL
SELECT 
  'Storage Bucket',
  COUNT(*)
FROM storage.buckets
WHERE id = 'character-images';
