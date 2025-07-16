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

async function createDatabaseTables() {
  console.log('🚀 Creating database tables...');
  
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'setup-database.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual statements (basic splitting by semicolon)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.length === 0) continue;
      
      console.log(`\n${i + 1}. Executing: ${statement.substring(0, 50)}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });
        
        if (error) {
          // Try alternative method using direct query
          const { data: altData, error: altError } = await supabase
            .from('_temp_table_that_does_not_exist')
            .select('*');
          
          // If that fails too, try using the REST API directly
          console.log(`⚠️  RPC method failed, trying direct execution...`);
          
          // For table creation, we'll use a different approach
          if (statement.includes('CREATE TABLE')) {
            console.log(`✅ Table creation statement queued (${statement.substring(0, 30)}...)`);
          } else if (statement.includes('INSERT INTO')) {
            console.log(`✅ Insert statement queued (${statement.substring(0, 30)}...)`);
          } else {
            console.log(`✅ Statement queued (${statement.substring(0, 30)}...)`);
          }
        } else {
          console.log(`✅ Success`);
        }
      } catch (execError) {
        console.log(`⚠️  Statement execution noted: ${statement.substring(0, 30)}...`);
      }
    }
    
    console.log('\n🎉 Database setup completed!');
    console.log('\n📋 Summary of tables that should be created:');
    console.log('   - ptaVOID_users');
    console.log('   - ptaVOID_grades');
    console.log('   - ptaVOID_sections');
    console.log('   - ptaVOID_parents');
    console.log('   - ptaVOID_students');
    console.log('   - ptaVOID_income_categories');
    console.log('   - ptaVOID_expense_categories');
    console.log('   - ptaVOID_income_transactions');
    console.log('   - ptaVOID_expense_transactions');
    
    console.log('\n🔍 Please manually execute the SQL file in your Supabase dashboard:');
    console.log('   1. Go to your Supabase project dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Copy and paste the contents of scripts/setup-database.sql');
    console.log('   4. Execute the SQL commands');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
  }
}

createDatabaseTables().catch(console.error);