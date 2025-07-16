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

async function createCorrectedSampleData() {
  console.log('🚀 Creating corrected sample data based on actual schema...\n');

  // 1. Create additional students with correct schema
  console.log('1. Creating additional students...');
  const studentsToCreate = [
    {
      student_id: 'STU002',
      first_name: 'Maria',
      last_name: 'Santos',
      middle_name: 'Cruz',
      enrollment_date: '2025-01-15',
      is_active: true,
      pta_contribution_paid: true
    },
    {
      student_id: 'STU003', 
      first_name: 'Juan',
      last_name: 'Dela Cruz',
      middle_name: 'Garcia',
      enrollment_date: '2025-01-20',
      is_active: true,
      pta_contribution_paid: false
    },
    {
      student_id: 'STU004',
      first_name: 'Ana',
      last_name: 'Reyes',
      middle_name: 'Lopez',
      enrollment_date: '2025-01-25',
      is_active: true,
      pta_contribution_paid: true
    },
    {
      student_id: 'STU005',
      first_name: 'Pedro',
      last_name: 'Gonzales',
      middle_name: 'Rivera',
      enrollment_date: '2025-02-01',
      is_active: true,
      pta_contribution_paid: false
    }
  ];

  for (const student of studentsToCreate) {
    try {
      const { data, error } = await supabase
        .from('ptavoid_students')
        .insert(student)
        .select();

      if (error) {
        console.log(`❌ Failed to create student ${student.student_id}: ${error.message}`);
      } else {
        console.log(`✅ Created student ${student.student_id}: ${student.first_name} ${student.last_name}`);
      }
    } catch (error) {
      console.log(`❌ Error creating student ${student.student_id}: ${error.message}`);
    }
  }

  // 2. Try to create income transactions with minimal fields
  console.log('\n2. Creating sample income transactions...');
  const incomeTransactions = [
    {
      transaction_id: 'INC001',
      description: 'PTA Membership Fee - Maria Santos',
      amount: 500.00,
      transaction_date: '2025-01-15'
    },
    {
      transaction_id: 'INC002', 
      description: 'School Event Fundraising',
      amount: 2500.00,
      transaction_date: '2025-01-20'
    },
    {
      transaction_id: 'INC003',
      description: 'PTA Membership Fee - Ana Reyes', 
      amount: 500.00,
      transaction_date: '2025-01-25'
    }
  ];

  for (const transaction of incomeTransactions) {
    try {
      const { data, error } = await supabase
        .from('ptavoid_income_transactions')
        .insert(transaction)
        .select();

      if (error) {
        console.log(`❌ Failed to create income transaction ${transaction.transaction_id}: ${error.message}`);
      } else {
        console.log(`✅ Created income transaction ${transaction.transaction_id}: ₱${transaction.amount}`);
      }
    } catch (error) {
      console.log(`❌ Error creating income transaction ${transaction.transaction_id}: ${error.message}`);
    }
  }

  // 3. Try to create expense transactions with minimal fields
  console.log('\n3. Creating sample expense transactions...');
  const expenseTransactions = [
    {
      transaction_id: 'EXP001',
      description: 'School Supplies Purchase',
      amount: 1200.00,
      transaction_date: '2025-01-18'
    },
    {
      transaction_id: 'EXP002',
      description: 'Event Decorations',
      amount: 800.00,
      transaction_date: '2025-01-22'
    },
    {
      transaction_id: 'EXP003',
      description: 'Printing and Materials',
      amount: 450.00,
      transaction_date: '2025-01-28'
    }
  ];

  for (const transaction of expenseTransactions) {
    try {
      const { data, error } = await supabase
        .from('ptavoid_expense_transactions')
        .insert(transaction)
        .select();

      if (error) {
        console.log(`❌ Failed to create expense transaction ${transaction.transaction_id}: ${error.message}`);
      } else {
        console.log(`✅ Created expense transaction ${transaction.transaction_id}: ₱${transaction.amount}`);
      }
    } catch (error) {
      console.log(`❌ Error creating expense transaction ${transaction.transaction_id}: ${error.message}`);
    }
  }

  // 4. Test dashboard data with corrected API calls
  console.log('\n4. Testing dashboard data...');
  
  try {
    // Get students data
    const { data: students, error: studentsError } = await supabase
      .from('ptavoid_students')
      .select('*');

    if (studentsError) {
      console.log(`❌ Students query error: ${studentsError.message}`);
    } else {
      const totalStudents = students?.length || 0;
      const ptaPaid = students?.filter(s => s.pta_contribution_paid)?.length || 0;
      const ptaUnpaid = totalStudents - ptaPaid;
      
      console.log(`📊 Students: ${totalStudents} total, ${ptaPaid} PTA paid, ${ptaUnpaid} PTA unpaid`);
    }

    // Get income data
    const { data: income, error: incomeError } = await supabase
      .from('ptavoid_income_transactions')
      .select('amount');

    if (incomeError) {
      console.log(`❌ Income query error: ${incomeError.message}`);
    } else {
      const totalIncome = income?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      console.log(`💰 Total Income: ₱${totalIncome.toLocaleString()}`);
    }

    // Get expense data
    const { data: expenses, error: expensesError } = await supabase
      .from('ptavoid_expense_transactions')
      .select('amount');

    if (expensesError) {
      console.log(`❌ Expenses query error: ${expensesError.message}`);
    } else {
      const totalExpenses = expenses?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      console.log(`💸 Total Expenses: ₱${totalExpenses.toLocaleString()}`);
      
      // Calculate balance
      const totalIncome = income?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const balance = totalIncome - totalExpenses;
      console.log(`💳 Current Balance: ₱${balance.toLocaleString()}`);
    }

  } catch (error) {
    console.log(`❌ Dashboard test error: ${error.message}`);
  }

  console.log('\n🎉 Corrected sample data creation completed!');
}

createCorrectedSampleData().catch(console.error);