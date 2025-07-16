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

async function verifyDashboardData() {
  console.log('🔍 Verifying dashboard data access...\n');

  // 1. Check DashboardStats component data
  console.log('1. Checking DashboardStats data:');
  console.log('=' .repeat(50));
  
  try {
    // Get students data for PTA payment status
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
      .select('amount');

    // Get expense data
    const { data: expenses, error: expensesError } = await supabase
      .from('ptavoid_expense_transactions')
      .select('amount');

    if (!incomeError && !expensesError) {
      const totalIncome = income?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const totalExpenses = expenses?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const balance = totalIncome - totalExpenses;
      
      console.log(`💰 Total Income: ₱${totalIncome.toLocaleString()}`);
      console.log(`💸 Total Expenses: ₱${totalExpenses.toLocaleString()}`);
      console.log(`💳 Current Balance: ₱${balance.toLocaleString()}`);
    } else {
      if (incomeError) console.log(`❌ Income query error: ${incomeError.message}`);
      if (expensesError) console.log(`❌ Expenses query error: ${expensesError.message}`);
    }
  } catch (error) {
    console.log(`❌ DashboardStats error: ${error.message}`);
  }

  // 2. Check PTAPaymentStatus component data
  console.log('\n2. Checking PTAPaymentStatus data:');
  console.log('=' .repeat(50));
  
  try {
    const { data: students, error: studentsError } = await supabase
      .from('ptavoid_students')
      .select('*');

    if (studentsError) {
      console.log(`❌ Students query error: ${studentsError.message}`);
    } else {
      const totalStudents = students?.length || 0;
      const ptaPaid = students?.filter(s => s.pta_contribution_paid)?.length || 0;
      const ptaUnpaid = totalStudents - ptaPaid;
      const paidPercentage = totalStudents > 0 ? Math.round((ptaPaid / totalStudents) * 100) : 0;
      
      console.log(`📊 PTA Payment Status:`);
      console.log(`   - Paid: ${ptaPaid} (${paidPercentage}%)`);
      console.log(`   - Unpaid: ${ptaUnpaid} (${100 - paidPercentage}%)`);
    }
  } catch (error) {
    console.log(`❌ PTAPaymentStatus error: ${error.message}`);
  }

  // 3. Check RecentTransactions component data
  console.log('\n3. Checking RecentTransactions data:');
  console.log('=' .repeat(50));
  
  try {
    // Get recent income transactions
    const { data: recentIncome, error: incomeError } = await supabase
      .from('ptavoid_income_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (incomeError) {
      console.log(`❌ Recent income query error: ${incomeError.message}`);
    } else {
      console.log(`📋 Recent Income Transactions (${recentIncome.length}):`);
      recentIncome.forEach((transaction, index) => {
        console.log(`   ${index + 1}. ${transaction.transaction_number}: ₱${transaction.amount} - ${transaction.notes}`);
      });
    }

    // Get recent expense transactions
    const { data: recentExpenses, error: expensesError } = await supabase
      .from('ptavoid_expense_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (expensesError) {
      console.log(`❌ Recent expenses query error: ${expensesError.message}`);
    } else {
      console.log(`\n📋 Recent Expense Transactions (${recentExpenses.length}):`);
      recentExpenses.forEach((transaction, index) => {
        console.log(`   ${index + 1}. ${transaction.transaction_number}: ₱${transaction.amount} - ${transaction.description}`);
      });
    }
  } catch (error) {
    console.log(`❌ RecentTransactions error: ${error.message}`);
  }

  // 4. Check QuickActions component (just verify it would have data to work with)
  console.log('\n4. Checking QuickActions data availability:');
  console.log('=' .repeat(50));
  
  try {
    // Check if students table has data for "Add Student" action
    const { count: studentCount, error: studentCountError } = await supabase
      .from('ptavoid_students')
      .select('*', { count: 'exact', head: true });

    // Check if transactions tables have data for "Record Income/Expense" actions
    const { count: incomeCount, error: incomeCountError } = await supabase
      .from('ptavoid_income_transactions')
      .select('*', { count: 'exact', head: true });
      
    const { count: expenseCount, error: expenseCountError } = await supabase
      .from('ptavoid_expense_transactions')
      .select('*', { count: 'exact', head: true });

    console.log(`✅ Students table accessible: ${!studentCountError} (${studentCount} records)`);
    console.log(`✅ Income transactions table accessible: ${!incomeCountError} (${incomeCount} records)`);
    console.log(`✅ Expense transactions table accessible: ${!expenseCountError} (${expenseCount} records)`);
    console.log(`✅ QuickActions component should have all required data available`);
  } catch (error) {
    console.log(`❌ QuickActions check error: ${error.message}`);
  }

  console.log('\n🎉 Dashboard data verification completed!');
}

verifyDashboardData().catch(console.error);