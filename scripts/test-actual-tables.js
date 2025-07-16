const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Service Key exists:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testActualTables() {
  console.log('\n=== Testing Actual Database Tables ===');
  
  try {
    // Test the actual table names I can see in the screenshot
    const tablesToTest = [
      'ptavoid_users',
      'ptavoid_students', 
      'ptavoid_parents',
      'ptavoid_income_transactions',
      'ptavoid_expense_transactions',
      'ptavoid_grades',
      'ptavoid_sections'
    ];

    for (const tableName of tablesToTest) {
      console.log(`\nTesting table: ${tableName}`);
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(3);
      
      if (error) {
        console.error(`❌ ${tableName} error:`, error.message);
      } else {
        console.log(`✅ ${tableName} table exists`);
        console.log(`   Records found: ${data?.length || 0}`);
        if (data && data.length > 0) {
          console.log(`   Sample record:`, JSON.stringify(data[0], null, 2));
        }
      }
    }

    // Test authentication
    console.log('\n=== Testing Authentication ===');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'cybergada@gmail.com',
      password: 'Qweasd145698@'
    });

    if (authError) {
      console.error('❌ Authentication error:', authError.message);
    } else {
      console.log('✅ Authentication successful');
      console.log('   User ID:', authData.user?.id);
      console.log('   User email:', authData.user?.email);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testActualTables().catch(console.error);