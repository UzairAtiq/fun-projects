-- 🗡️ Anime Character Gallery - Supabase Schema
-- Run this in the Supabase SQL Editor

-- Drop existing tables if they exist
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

-- DISABLE Row Level Security (for anonymous access)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE characters DISABLE ROW LEVEL SECURITY;

-- Grant public access
GRANT ALL ON categories TO anon, authenticated;
GRANT ALL ON characters TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

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
-- STORAGE BUCKET SETUP
-- ==============================================
-- Create storage bucket for character images
INSERT INTO storage.buckets (id, name, public)
VALUES ('character-images', 'character-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable storage policies for public access
CREATE POLICY IF NOT EXISTS "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'character-images');

CREATE POLICY IF NOT EXISTS "Allow public reads" ON storage.objects
  FOR SELECT USING (bucket_id = 'character-images');

CREATE POLICY IF NOT EXISTS "Allow public updates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'character-images');

CREATE POLICY IF NOT EXISTS "Allow public deletes" ON storage.objects
  FOR DELETE USING (bucket_id = 'character-images');
