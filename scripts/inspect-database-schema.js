const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectDatabaseSchema() {
  console.log('🔍 Inspecting database schema...\n');

  const tables = [
    'ptavoid_students',
    'ptavoid_income_transactions', 
    'ptavoid_expense_transactions',
    'ptavoid_budget_categories',
    'ptavoid_financial_reports'
  ];

  for (const tableName of tables) {
    console.log(`📋 Table: ${tableName}`);
    console.log('=' .repeat(50));
    
    try {
      // Get table structure by querying information_schema
      const { data: columns, error: schemaError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', tableName)
        .eq('table_schema', 'public')
        .order('ordinal_position');

      if (schemaError) {
        console.log(`❌ Schema error: ${schemaError.message}`);
      } else if (columns && columns.length > 0) {
        console.log('Columns:');
        columns.forEach(col => {
          console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'}`);
        });
      } else {
        console.log('❌ No columns found or table does not exist');
      }

      // Try to get a sample row to see actual data structure
      const { data: sampleData, error: dataError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (dataError) {
        console.log(`❌ Data query error: ${dataError.message}`);
      } else if (sampleData && sampleData.length > 0) {
        console.log('\nSample data structure:');
        console.log(JSON.stringify(sampleData[0], null, 2));
      } else {
        console.log('\n📝 Table exists but is empty');
      }

      // Get row count
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (!countError) {
        console.log(`\n📊 Total rows: ${count}`);
      }

    } catch (error) {
      console.log(`❌ Error inspecting ${tableName}: ${error.message}`);
    }
    
    console.log('\n');
  }
}

inspectDatabaseSchema().catch(console.error);