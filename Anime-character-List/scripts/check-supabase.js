#!/usr/bin/env node

/**
 * Supabase Configuration Checker
 * Run this script to verify your Supabase setup
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local file manually
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    return {};
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      env[key] = value;
    }
  });
  
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Checking Supabase Configuration...\n');

// Check environment variables
console.log('1️⃣ Environment Variables:');
if (!SUPABASE_URL) {
  console.log('   ❌ NEXT_PUBLIC_SUPABASE_URL is not set');
} else {
  console.log(`   ✅ NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL}`);
}

if (!SUPABASE_ANON_KEY) {
  console.log('   ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
} else {
  console.log(`   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY.slice(0, 20)}...`);
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log('\n❌ Please set up your .env.local file with Supabase credentials');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkDatabase() {
  console.log('\n2️⃣ Database Tables:');
  
  try {
    // Check categories table
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('count')
      .limit(1);
    
    if (catError) {
      console.log(`   ❌ categories table: ${catError.message}`);
    } else {
      console.log('   ✅ categories table exists');
    }

    // Check characters table
    const { data: characters, error: charError } = await supabase
      .from('characters')
      .select('count')
      .limit(1);
    
    if (charError) {
      console.log(`   ❌ characters table: ${charError.message}`);
    } else {
      console.log('   ✅ characters table exists');
    }
  } catch (error) {
    console.log(`   ❌ Database check failed: ${error.message}`);
  }
}

async function checkStorage() {
  console.log('\n3️⃣ Storage Bucket:');
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log(`   ❌ Failed to list buckets: ${error.message}`);
      return;
    }

    const characterBucket = buckets.find(b => b.id === 'character-images');
    
    if (!characterBucket) {
      console.log('   ❌ character-images bucket does not exist');
      console.log('      → Create it in Supabase Dashboard > Storage');
    } else {
      console.log('   ✅ character-images bucket exists');
      console.log(`      → Public: ${characterBucket.public ? 'Yes' : 'No'}`);
      
      if (!characterBucket.public) {
        console.log('      ⚠️  Warning: Bucket should be public for image uploads to work');
      }
    }
  } catch (error) {
    console.log(`   ❌ Storage check failed: ${error.message}`);
  }
}

async function testOperations() {
  console.log('\n4️⃣ Test Operations:');
  
  try {
    // Test category creation
    const testCategoryName = `test_${Date.now()}`;
    const { data: newCategory, error: createError } = await supabase
      .from('categories')
      .insert({ name: testCategoryName })
      .select()
      .single();
    
    if (createError) {
      console.log(`   ❌ Category creation: ${createError.message}`);
    } else {
      console.log('   ✅ Category creation works');
      
      // Clean up test category
      await supabase.from('categories').delete().eq('id', newCategory.id);
    }
  } catch (error) {
    console.log(`   ❌ Test operations failed: ${error.message}`);
  }
}

async function runChecks() {
  await checkDatabase();
  await checkStorage();
  await testOperations();
  
  console.log('\n✨ Configuration check complete!\n');
  console.log('If you see any ❌ errors above, please:');
  console.log('1. Run the SQL schema in Supabase Dashboard > SQL Editor');
  console.log('2. Create the storage bucket if missing');
  console.log('3. Check SETUP_FIX.md for detailed instructions\n');
}

runChecks();
