# IMMEDIATE FIX - 2 Steps

## Issues Found:
1. ❌ Storage RLS policies blocking uploads
2. ❌ Next.js body size limit too small (1MB) for images

## Step 1: Fix Storage Policies (1 minute)

1. Go to https://supabase.com/dashboard
2. Open your project SQL Editor
3. Copy ALL content from `supabase/STORAGE_POLICIES_FIX.sql`
4. Paste and **Run** it
5. You should see 4 policies listed at the end

## Step 2: Restart Your Dev Server

Your Next.js config has been updated. Restart the server:

```bash
# Press Ctrl+C to stop the current server
# Then run:
npm run dev
```

## Test It Works

1. Go to http://localhost:3000/dashboard
2. Click **Add Character**
3. Upload an image (under 5MB)
4. Should work! ✅

---

## What Was Fixed:

1. **Storage Policies**: Created simple, permissive RLS policies for the storage bucket
2. **Body Size Limit**: Increased from 1MB to 10MB in next.config.ts to allow image uploads

The storage policies use `CREATE POLICY IF NOT EXISTS` so they won't conflict with existing ones.
