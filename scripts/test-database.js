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

async function testDatabase() {
  console.log('\n=== Testing Database Connection ===');
  
  try {
    // Test 1: Check ptaVOID_users table
    console.log('\n1. Testing ptaVOID_users table...');
    const { data: users, error: usersError } = await supabase
      .from('ptaVOID_users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.error('❌ ptaVOID_users error:', usersError.message);
    } else {
      console.log('✅ ptaVOID_users table exists');
      console.log('   Records found:', users?.length || 0);
      if (users && users.length > 0) {
        console.log('   Sample record:', JSON.stringify(users[0], null, 2));
      }
    }

    // Test 2: Check ptaVOID_students table
    console.log('\n2. Testing ptaVOID_students table...');
    const { data: students, error: studentsError } = await supabase
      .from('ptaVOID_students')
      .select('*')
      .limit(5);
    
    if (studentsError) {
      console.error('❌ ptaVOID_students error:', studentsError.message);
    } else {
      console.log('✅ ptaVOID_students table exists');
      console.log('   Records found:', students?.length || 0);
      if (students && students.length > 0) {
        console.log('   Sample record:', JSON.stringify(students[0], null, 2));
      }
    }

    // Test 3: Check ptaVOID_income_transactions table
    console.log('\n3. Testing ptaVOID_income_transactions table...');
    const { data: income, error: incomeError } = await supabase
      .from('ptaVOID_income_transactions')
      .select('*')
      .limit(5);
    
    if (incomeError) {
      console.error('❌ ptaVOID_income_transactions error:', incomeError.message);
    } else {
      console.log('✅ ptaVOID_income_transactions table exists');
      console.log('   Records found:', income?.length || 0);
    }

    // Test 4: Check ptaVOID_expense_transactions table
    console.log('\n4. Testing ptaVOID_expense_transactions table...');
    const { data: expenses, error: expensesError } = await supabase
      .from('ptaVOID_expense_transactions')
      .select('*')
      .limit(5);
    
    if (expensesError) {
      console.error('❌ ptaVOID_expense_transactions error:', expensesError.message);
    } else {
      console.log('✅ ptaVOID_expense_transactions table exists');
      console.log('   Records found:', expenses?.length || 0);
    }

    // Test 5: Test authentication with demo user
    console.log('\n5. Testing authentication...');
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

testDatabase().catch(console.error);