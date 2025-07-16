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

async function discoverTransactionSchema() {
  console.log('🔍 Discovering transaction table schemas by testing field combinations...\n');

  const tables = ['ptavoid_income_transactions', 'ptavoid_expense_transactions'];
  
  // Common field names to test
  const commonFields = [
    'id',
    'transaction_id', 
    'amount',
    'description',
    'details',
    'notes',
    'transaction_date',
    'date',
    'created_at',
    'updated_at',
    'status',
    'type',
    'category',
    'reference',
    'user_id',
    'created_by'
  ];

  for (const tableName of tables) {
    console.log(`📋 Testing ${tableName}:`);
    console.log('=' .repeat(50));
    
    const workingFields = [];
    
    for (const field of commonFields) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select(field)
          .limit(1);
          
        if (!error) {
          workingFields.push(field);
          console.log(`✅ ${field} - EXISTS`);
        } else {
          console.log(`❌ ${field} - ${error.message}`);
        }
      } catch (error) {
        console.log(`❌ ${field} - ${error.message}`);
      }
    }
    
    console.log(`\n📝 Working fields for ${tableName}:`);
    console.log(workingFields.join(', '));
    
    // Try to insert a minimal test record with only working fields
    if (workingFields.length > 0) {
      console.log(`\n🧪 Testing minimal insert for ${tableName}:`);
      
      const testRecord = {};
      
      // Add basic fields that usually work
      if (workingFields.includes('amount')) {
        testRecord.amount = 100.00;
      }
      if (workingFields.includes('transaction_id')) {
        testRecord.transaction_id = `TEST_${Date.now()}`;
      }
      if (workingFields.includes('date')) {
        testRecord.date = '2025-01-15';
      }
      if (workingFields.includes('transaction_date')) {
        testRecord.transaction_date = '2025-01-15';
      }
      
      console.log('Test record:', JSON.stringify(testRecord, null, 2));
      
      try {
        const { data, error } = await supabase
          .from(tableName)
          .insert(testRecord)
          .select();
          
        if (error) {
          console.log(`❌ Insert failed: ${error.message}`);
        } else {
          console.log(`✅ Insert successful!`);
          console.log('Inserted record:', JSON.stringify(data[0], null, 2));
          
          // Clean up test record
          if (data[0].id) {
            await supabase.from(tableName).delete().eq('id', data[0].id);
            console.log('🧹 Test record cleaned up');
          }
        }
      } catch (error) {
        console.log(`❌ Insert error: ${error.message}`);
      }
    }
    
    console.log('\n');
  }
}

discoverTransactionSchema().catch(console.error);