# 🚨 QUICK FIX - Categories & Characters Not Working

## The Problem
Your diagnostic shows:
- ❌ Storage bucket doesn't exist → Can't upload images
- ❌ Row Level Security blocking inserts → Can't create categories/characters

## The Solution (2 minutes)

### Step 1: Run the SQL Fix
1. Open https://supabase.com/dashboard
2. Go to your project: **kqwftetrfxmmglznbwav**
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Open the file `supabase/COMPLETE_FIX.sql` in VS Code
6. Copy **ALL** the SQL code
7. Paste it into the Supabase SQL Editor
8. Click **Run** (or press Ctrl/Cmd + Enter)
9. You should see "SUCCESS: All tables created and permissions set correctly!"

### Step 2: Verify It Worked
Run this in your terminal:
```bash
npm run check-supabase
```

You should see:
- ✅ Environment Variables
- ✅ Database Tables  
- ✅ Storage Bucket EXISTS and is PUBLIC
- ✅ Category creation works

### Step 3: Test in Your App
1. Make sure your app is running: `npm run dev`
2. Go to http://localhost:3000/dashboard
3. Click **Categories** button
4. Add a category (e.g., "Naruto") → Should work! ✅
5. Click **Add Character** button
6. Fill in name, select category, upload image → Should work! ✅

---

## What the Fix Does

The SQL script:
1. ✅ Recreates database tables with correct permissions
2. ✅ **DISABLES** Row Level Security (since you want public access)
3. ✅ Creates the `character-images` storage bucket
4. ✅ Sets up storage policies for upload/read/update/delete
5. ✅ Grants full access to anonymous users

## Still Having Issues?

### If categories still don't work:
```bash
# Check browser console (F12) for errors
# The error message will tell you exactly what's wrong
```

### If image upload fails:
1. Go to Supabase Dashboard → Storage
2. Check if `character-images` bucket exists
3. Check if it's marked as **Public** (toggle should be ON)
4. Try uploading a test file directly in the dashboard

### If nothing works:
1. Check `.env.local` has correct Supabase URL and Key
2. Make sure your Supabase project isn't paused (free tier auto-pauses)
3. Restart your dev server: Stop (Ctrl+C) and run `npm run dev` again

---

## Why This Happened

Your schema had RLS (Row Level Security) enabled but:
- No policies were created → blocked all inserts
- Storage bucket wasn't created → blocked all uploads

The fix disables RLS completely since your app allows public/anonymous access.

---

**Need more help?** Check [SETUP_FIX.md](./SETUP_FIX.md) for detailed troubleshooting.
