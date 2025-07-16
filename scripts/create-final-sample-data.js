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

async function createFinalSampleData() {
  console.log('🚀 Creating final sample data with correct schema...\n');

  // 1. Create income transactions with correct schema
  console.log('1. Creating sample income transactions...');
  const incomeTransactions = [
    {
      transaction_number: 'INC001',
      amount: 500.00,
      notes: 'PTA Membership Fee - Maria Santos',
      school_year: '2025-2026'
    },
    {
      transaction_number: 'INC002',
      amount: 2500.00,
      notes: 'School Event Fundraising',
      school_year: '2025-2026'
    },
    {
      transaction_number: 'INC003',
      amount: 500.00,
      notes: 'PTA Membership Fee - Ana Reyes',
      school_year: '2025-2026'
    },
    {
      transaction_number: 'INC004',
      amount: 1200.00,
      notes: 'Book Fair Proceeds',
      school_year: '2025-2026'
    },
    {
      transaction_number: 'INC005',
      amount: 800.00,
      notes: 'Uniform Sales Commission',
      school_year: '2025-2026'
    }
  ];

  for (const transaction of incomeTransactions) {
    try {
      const { data, error } = await supabase
        .from('ptavoid_income_transactions')
        .insert(transaction)
        .select();

      if (error) {
        console.log(`❌ Failed to create income transaction ${transaction.transaction_number}: ${error.message}`);
      } else {
        console.log(`✅ Created income transaction ${transaction.transaction_number}: ₱${transaction.amount} - ${transaction.notes}`);
      }
    } catch (error) {
      console.log(`❌ Error creating income transaction ${transaction.transaction_number}: ${error.message}`);
    }
  }

  // 2. Create expense transactions with correct schema
  console.log('\n2. Creating sample expense transactions...');
  const expenseTransactions = [
    {
      transaction_number: 'EXP001',
      amount: 1200.00,
      description: 'School Supplies Purchase',
      school_year: '2025-2026'
    },
    {
      transaction_number: 'EXP002',
      amount: 800.00,
      description: 'Event Decorations and Materials',
      school_year: '2025-2026'
    },
    {
      transaction_number: 'EXP003',
      amount: 450.00,
      description: 'Printing and Photocopying',
      school_year: '2025-2026'
    },
    {
      transaction_number: 'EXP004',
      amount: 600.00,
      description: 'Transportation for Field Trip',
      school_year: '2025-2026'
    },
    {
      transaction_number: 'EXP005',
      amount: 300.00,
      description: 'Meeting Refreshments',
      school_year: '2025-2026'
    }
  ];

  for (const transaction of expenseTransactions) {
    try {
      const { data, error } = await supabase
        .from('ptavoid_expense_transactions')
        .insert(transaction)
        .select();

      if (error) {
        console.log(`❌ Failed to create expense transaction ${transaction.transaction_number}: ${error.message}`);
      } else {
        console.log(`✅ Created expense transaction ${transaction.transaction_number}: ₱${transaction.amount} - ${transaction.description}`);
      }
    } catch (error) {
      console.log(`❌ Error creating expense transaction ${transaction.transaction_number}: ${error.message}`);
    }
  }

  // 3. Test final dashboard data
  console.log('\n3. Testing final dashboard data...');
  
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
      
      console.log(`👥 Students: ${totalStudents} total, ${ptaPaid} PTA paid, ${ptaUnpaid} PTA unpaid`);
    }

    // Get income data
    const { data: income, error: incomeError } = await supabase
      .from('ptavoid_income_transactions')
      .select('amount, notes, created_at')
      .order('created_at', { ascending: false });

    if (incomeError) {
      console.log(`❌ Income query error: ${incomeError.message}`);
    } else {
      const totalIncome = income?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      console.log(`💰 Total Income: ₱${totalIncome.toLocaleString()} (${income?.length || 0} transactions)`);
    }

    // Get expense data
    const { data: expenses, error: expensesError } = await supabase
      .from('ptavoid_expense_transactions')
      .select('amount, description, created_at')
      .order('created_at', { ascending: false });

    if (expensesError) {
      console.log(`❌ Expenses query error: ${expensesError.message}`);
    } else {
      const totalExpenses = expenses?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      console.log(`💸 Total Expenses: ₱${totalExpenses.toLocaleString()} (${expenses?.length || 0} transactions)`);
      
      // Calculate balance
      const totalIncome = income?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const balance = totalIncome - totalExpenses;
      console.log(`💳 Current Balance: ₱${balance.toLocaleString()}`);
    }

    // Show recent transactions for dashboard
    console.log('\n📋 Recent Transactions:');
    if (income && income.length > 0) {
      console.log('Recent Income:');
      income.slice(0, 3).forEach(t => {
        console.log(`  + ₱${t.amount} - ${t.notes}`);
      });
    }
    
    if (expenses && expenses.length > 0) {
      console.log('Recent Expenses:');
      expenses.slice(0, 3).forEach(t => {
        console.log(`  - ₱${t.amount} - ${t.description}`);
      });
    }

  } catch (error) {
    console.log(`❌ Dashboard test error: ${error.message}`);
  }

  console.log('\n🎉 Final sample data creation completed!');
  console.log('✅ Dashboard should now have working data for all components');
}

createFinalSampleData().catch(console.error);
