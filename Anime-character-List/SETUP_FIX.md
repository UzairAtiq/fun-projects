# 🔧 Setup Fix Guide

## Issues Identified

You're unable to add categories or characters due to missing Supabase configuration. Here's how to fix it:

## Step 1: Run Updated Schema in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project: **kqwftetrfxmmglznbwav**
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the entire contents of `supabase/schema.sql`
6. Click **Run** or press `Ctrl/Cmd + Enter`

This will:
- Create/update your database tables
- Set up the storage bucket for character images
- Enable all necessary storage policies
- Grant public access (as specified in your requirements)

## Step 2: Verify Storage Bucket

1. In Supabase Dashboard, click **Storage** in the left sidebar
2. You should see a bucket called **character-images**
3. Click on it and verify:
   - ✅ Public bucket is enabled (toggle should be ON)
   - ✅ The bucket exists and is accessible

If the bucket doesn't appear, create it manually:
1. Click **New bucket**
2. Name: `character-images`
3. Toggle **Public bucket** to ON
4. Click **Create bucket**

## Step 3: Test the Application

### Test Adding a Category:
1. Start your Next.js app: `npm run dev`
2. Navigate to `/dashboard`
3. Click the **Categories** button
4. Enter a category name (e.g., "Naruto")
5. Click the + button
6. The category should appear in the list

### Test Adding a Character:
1. Click **Add Character** button
2. Fill in:
   - **Warrior Name**: e.g., "Itachi Uchiha"
   - **Category**: Select from dropdown
   - **Image**: Upload an image file (JPG, PNG, WebP, or GIF, max 5MB)
3. Click **Summon Warrior**
4. The character should appear in your gallery

## Common Errors & Solutions

### Error: "Failed to create category"
**Cause**: Database tables not created or permissions issue
**Solution**: Re-run the schema.sql file in Supabase SQL Editor

### Error: "Failed to upload image" or "storage/object-not-found"
**Cause**: Storage bucket doesn't exist or policies not set
**Solution**: 
1. Verify storage bucket exists and is public
2. Re-run the storage policy SQL commands from schema.sql

### Error: "Invalid file type"
**Cause**: Trying to upload unsupported file format
**Solution**: Only upload JPG, PNG, WebP, or GIF images

### Error: "File too large"
**Cause**: Image exceeds 5MB limit
**Solution**: Compress your image or use a smaller file

### Error: Connection refused or timeout
**Cause**: Environment variables not set correctly
**Solution**: Verify `.env.local` has correct values:
```
NEXT_PUBLIC_SUPABASE_URL=https://kqwftetrfxmmglznbwav.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Debugging Tips

### Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try adding a category/character
4. Look for error messages (they'll show the exact issue)

### Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try adding a category/character
4. Look for failed requests (shown in red)
5. Click on the failed request to see the error response

### Check Terminal Output
- Watch your terminal where `npm run dev` is running
- Server-side errors will appear there

## Manual Storage Policy Setup (If Needed)

If the automatic setup doesn't work, run these SQL commands manually:

```sql
-- Enable Row Level Security for storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;

-- Create new policies
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'character-images');

CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT USING (bucket_id = 'character-images');

CREATE POLICY "Allow public updates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'character-images');

CREATE POLICY "Allow public deletes" ON storage.objects
  FOR DELETE USING (bucket_id = 'character-images');
```

## Still Having Issues?

If you're still experiencing problems:

1. Check that your app is running: `npm run dev`
2. Check that you're on the `/dashboard` page
3. Open browser console (F12) and share any error messages
4. Check Supabase Dashboard > Settings > API to verify your credentials
5. Make sure your Supabase project is not paused (free tier projects auto-pause after inactivity)

## Success Indicators

You'll know everything is working when:
- ✅ Categories can be created and appear in the list
- ✅ Characters can be added with images
- ✅ Images are displayed correctly in the gallery
- ✅ No errors in browser console
- ✅ No errors in terminal output
