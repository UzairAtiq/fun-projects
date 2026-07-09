# Supabase Setup Guide

Complete guide to setting up your Supabase backend for the Anime Character Gallery.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **Start your project**
3. Sign in with GitHub (recommended) or email
4. Click **New Project**
5. Fill in:
   - **Name**: anime-char-gallery (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
6. Click **Create new project**
7. Wait ~2 minutes for initialization

## Step 2: Get API Credentials

1. In your project dashboard, go to **Settings** (⚙️ icon in sidebar)
2. Click **API** in the settings menu
3. You'll see two important values:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **Anon/Public Key (anon key):**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. Copy both values - you'll need them for `.env.local`

## Step 3: Set Up Database Tables

1. In Supabase Dashboard, click **SQL Editor** in the sidebar
2. Click **+ New query**
3. Copy the entire contents of `supabase/schema.sql` from your project
4. Paste into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see: **Success. No rows returned**

This creates:
- `categories` table for character categories
- `characters` table for character data
- Row Level Security policies to protect user data
- Database indexes for performance

## Step 4: Set Up Storage Bucket

1. Click **Storage** in the sidebar
2. Click **Create a new bucket**
3. Fill in:
   - **Name**: `character-images`
   - **Public bucket**: ✅ **Enabled** (important!)
4. Click **Create bucket**

### Configure Storage Policies

The storage bucket needs policies to allow authenticated users to upload and view images:

1. Click on the `character-images` bucket
2. Click **Policies** tab
3. The policies are already set up in the SQL schema, but if needed:

**To manually add policies:**

Click **New Policy** and add these three policies:

**Policy 1: Allow uploads**
```sql
CREATE POLICY "Users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'character-images' 
  AND auth.uid() IS NOT NULL
);
```

**Policy 2: Allow public viewing**
```sql
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'character-images');
```

**Policy 3: Allow deletions**
```sql
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'character-images' 
  AND auth.uid() IS NOT NULL
);
```

## Step 5: Configure Authentication

Supabase Auth is enabled by default! But let's verify settings:

1. Click **Authentication** in the sidebar
2. Click **Providers**
3. Ensure **Email** is enabled (it should be by default)
4. Optional: Configure email templates
   - Go to **Email Templates**
   - Customize confirmation and reset password emails

### Recommended Auth Settings

Go to **Authentication** > **Settings**:

- **Enable email confirmations**: Off (for development) or On (for production)
- **Disable email signups**: Off (users can sign up)
- **Minimum password length**: 6 characters

## Step 6: Test Your Setup

### Verify Database

1. Go to **Table Editor**
2. You should see two tables:
   - `categories`
   - `characters`
3. Both should be empty initially

### Verify Storage

1. Go to **Storage**
2. You should see the `character-images` bucket
3. It should show as **Public**

## Step 7: Update Your Application

Add your credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace the values with your actual Project URL and Anon Key.

## Verification Checklist

Before running your app, verify:

- ✅ Project created and initialized
- ✅ API credentials copied to `.env.local`
- ✅ Database schema executed successfully
- ✅ `categories` and `characters` tables exist
- ✅ Storage bucket `character-images` created
- ✅ Storage bucket is **public**
- ✅ Email authentication is enabled

## Common Issues

### Issue: "relation 'characters' does not exist"
**Solution**: Run the SQL schema again from Step 3

### Issue: "Failed to upload image"
**Solution**: 
- Ensure the bucket name is exactly `character-images`
- Verify the bucket is set to **public**
- Check storage policies are set up

### Issue: "JWT expired" or "Invalid JWT"
**Solution**: Check that your `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct

### Issue: Users can see each other's data
**Solution**: Verify Row Level Security is enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```
Both tables should show `rowsecurity = true`

## Next Steps

1. Run `npm run dev` in your project directory
2. Open http://localhost:3000
3. Sign up for an account
4. Start adding characters!

## Production Checklist

Before deploying to production:

- ✅ Enable email confirmations
- ✅ Set up custom SMTP (optional, for branded emails)
- ✅ Configure password strength requirements
- ✅ Set up database backups (Supabase does this automatically)
- ✅ Add environment variables to Vercel/hosting platform
- ✅ Test authentication flow end-to-end
- ✅ Test image uploads and deletions

## Support

If you encounter issues:
- Check [Supabase Documentation](https://supabase.com/docs)
- Join [Supabase Discord](https://discord.supabase.com)
- Check the browser console for errors
- Verify `.env.local` values are correct
