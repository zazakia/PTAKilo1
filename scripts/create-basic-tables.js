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

async function createBasicTables() {
  console.log('🚀 Creating basic database tables...');
  
  // First, let's create the user profile in ptaVOID_users for our demo user
  try {
    console.log('\n1. Creating user profile for demo user...');
    
    // Get the authenticated user ID
    const { data: authData } = await supabase.auth.signInWithPassword({
      email: 'cybergada@gmail.com',
      password: 'Qweasd145698@'
    });
    
    if (authData.user) {
      console.log('✅ Demo user authenticated, ID:', authData.user.id);
      
      // Since we can't create the table via API, let's create some sample data
      // that we can use to test if the tables exist
      
      console.log('\n2. Testing table creation...');
      
      // Try to insert a user record (this will fail if table doesn't exist)
      const { data: userData, error: userError } = await supabase
        .from('ptaVOID_users')
        .upsert({
          id: authData.user.id,
          email: 'cybergada@gmail.com',
          full_name: 'System Administrator',
          role: 'admin',
          is_active: true
        })
        .select();
      
      if (userError) {
        console.error('❌ ptaVOID_users table does not exist:', userError.message);
        console.log('\n📋 MANUAL SETUP REQUIRED:');
        console.log('The database tables need to be created manually in Supabase.');
        console.log('\nSteps to fix:');
        console.log('1. Open your Supabase project dashboard');
        console.log('2. Go to SQL Editor');
        console.log('3. Copy the contents of scripts/setup-database.sql');
        console.log('4. Paste and execute the SQL');
        console.log('5. Run this script again to populate demo data');
        return;
      } else {
        console.log('✅ ptaVOID_users table exists and user created');
      }
      
      // Test other tables
      console.log('\n3. Testing other tables...');
      
      // Test students table
      const { data: studentsData, error: studentsError } = await supabase
        .from('ptaVOID_students')
        .select('*')
        .limit(1);
      
      if (studentsError) {
        console.error('❌ ptaVOID_students table missing:', studentsError.message);
      } else {
        console.log('✅ ptaVOID_students table exists');
      }
      
      // Create some sample data if tables exist
      if (!userError && !studentsError) {
        console.log('\n4. Creating sample data...');
        
        // Create sample student
        const { data: studentData, error: studentError } = await supabase
          .from('ptaVOID_students')
          .upsert({
            student_id: 'STU001',
            first_name: 'John',
            last_name: 'Doe',
            pta_contribution_paid: true,
            pta_contribution_amount: 250.00
          })
          .select();
        
        if (!studentError) {
          console.log('✅ Sample student created');
        }
        
        // Create another sample student
        const { data: student2Data, error: student2Error } = await supabase
          .from('ptaVOID_students')
          .upsert({
            student_id: 'STU002',
            first_name: 'Jane',
            last_name: 'Smith',
            pta_contribution_paid: false,
            pta_contribution_amount: 0.00
          })
          .select();
        
        if (!student2Error) {
          console.log('✅ Second sample student created');
        }
      }
      
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createBasicTables().catch(console.error);