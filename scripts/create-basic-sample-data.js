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

async function createBasicSampleData() {
  console.log('🚀 Creating basic sample data...');
  
  try {
    // 1. Create sample students with basic fields only
    console.log('\n1. Creating sample students...');
    const basicStudents = [
      {
        student_id: 'STU001',
        first_name: 'John',
        last_name: 'Doe',
        pta_contribution_paid: true,
        pta_contribution_amount: 250.00
      },
      {
        student_id: 'STU002',
        first_name: 'Maria',
        last_name: 'Santos',
        pta_contribution_paid: false,
        pta_contribution_amount: 0.00
      },
      {
        student_id: 'STU003',
        first_name: 'Carlos',
        last_name: 'Garcia',
        pta_contribution_paid: true,
        pta_contribution_amount: 250.00
      },
      {
        student_id: 'STU004',
        first_name: 'Sofia',
        last_name: 'Reyes',
        pta_contribution_paid: false,
        pta_contribution_amount: 0.00
      },
      {
        student_id: 'STU005',
        first_name: 'Luis',
        last_name: 'Fernandez',
        pta_contribution_paid: true,
        pta_contribution_amount: 250.00
      }
    ];

    for (const student of basicStudents) {
      const { data, error } = await supabase
        .from('ptavoid_students')
        .upsert(student)
        .select();

      if (error) {
        console.error(`❌ Failed to create student ${student.student_id}:`, error.message);
      } else {
        console.log(`✅ Created student: ${student.first_name} ${student.last_name}`);
      }
    }

    // 2. Create sample income transactions with basic fields
    console.log('\n2. Creating sample income transactions...');
    const basicIncomeTransactions = [
      {
        transaction_id: 'INC001',
        amount: 250.00,
        status: 'completed'
      },
      {
        transaction_id: 'INC002',
        amount: 250.00,
        status: 'completed'
      },
      {
        transaction_id: 'INC003',
        amount: 250.00,
        status: 'completed'
      },
      {
        transaction_id: 'INC004',
        amount: 5000.00,
        status: 'completed'
      }
    ];

    for (const transaction of basicIncomeTransactions) {
      const { data, error } = await supabase
        .from('ptavoid_income_transactions')
        .upsert(transaction)
        .select();

      if (error) {
        console.error(`❌ Failed to create income transaction ${transaction.transaction_id}:`, error.message);
      } else {
        console.log(`✅ Created income transaction: ${transaction.transaction_id} - ₱${transaction.amount}`);
      }
    }

    // 3. Create sample expense transactions with basic fields
    console.log('\n3. Creating sample expense transactions...');
    const basicExpenseTransactions = [
      {
        transaction_id: 'EXP001',
        amount: 1500.00,
        status: 'approved'
      },
      {
        transaction_id: 'EXP002',
        amount: 800.00,
        status: 'approved'
      },
      {
        transaction_id: 'EXP003',
        amount: 2200.00,
        status: 'pending'
      }
    ];

    for (const transaction of basicExpenseTransactions) {
      const { data, error } = await supabase
        .from('ptavoid_expense_transactions')
        .upsert(transaction)
        .select();

      if (error) {
        console.error(`❌ Failed to create expense transaction ${transaction.transaction_id}:`, error.message);
      } else {
        console.log(`✅ Created expense transaction: ${transaction.transaction_id} - ₱${transaction.amount}`);
      }
    }

    // 4. Test the dashboard API
    console.log('\n4. Testing dashboard data...');
    const [studentsResult, incomeResult, expenseResult] = await Promise.all([
      supabase.from('ptavoid_students').select('*'),
      supabase.from('ptavoid_income_transactions').select('amount'),
      supabase.from('ptavoid_expense_transactions').select('amount')
    ]);

    const totalStudents = studentsResult.data?.length || 0;
    const paidStudents = studentsResult.data?.filter(s => s.pta_contribution_paid).length || 0;
    const unpaidStudents = totalStudents - paidStudents;
    const totalIncome = incomeResult.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    const totalExpenses = expenseResult.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

    console.log('\n🎉 Sample data creation completed!');
    console.log('\n📊 Dashboard Summary:');
    console.log(`   - Total Students: ${totalStudents}`);
    console.log(`   - PTA Paid: ${paidStudents}`);
    console.log(`   - PTA Unpaid: ${unpaidStudents}`);
    console.log(`   - Total Income: ₱${totalIncome.toLocaleString()}`);
    console.log(`   - Total Expenses: ₱${totalExpenses.toLocaleString()}`);
    console.log(`   - Current Balance: ₱${(totalIncome - totalExpenses).toLocaleString()}`);

  } catch (error) {
    console.error('❌ Error creating sample data:', error.message);
  }
}

createBasicSampleData().catch(console.error);