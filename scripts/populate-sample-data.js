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

async function populateSampleData() {
  console.log('🚀 Populating sample data...');
  
  try {
    // First, authenticate to get the admin user ID
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'cybergada@gmail.com',
      password: 'Qweasd145698@'
    });

    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      return;
    }

    const adminUserId = authData.user.id;
    console.log('✅ Authenticated as admin:', adminUserId);

    // 1. Create user profile for admin
    console.log('\n1. Creating admin user profile...');
    const { data: adminUser, error: adminUserError } = await supabase
      .from('ptavoid_users')
      .upsert({
        id: adminUserId,
        email: 'cybergada@gmail.com',
        full_name: 'System Administrator',
        role: 'admin',
        phone: '+63 123 456 7890',
        is_active: true
      })
      .select();

    if (adminUserError) {
      console.error('❌ Failed to create admin user:', adminUserError.message);
    } else {
      console.log('✅ Admin user profile created');
    }

    // 2. Create sample students
    console.log('\n2. Creating sample students...');
    const sampleStudents = [
      {
        student_id: 'STU001',
        first_name: 'John',
        last_name: 'Doe',
        middle_name: 'Michael',
        date_of_birth: '2015-03-15',
        gender: 'Male',
        grade_level: 'Grade 3',
        section: 'Rose',
        parent_name: 'Jane Doe',
        parent_contact: '+63 912 345 6789',
        parent_email: 'jane.doe@email.com',
        address: '123 Main Street, City',
        pta_contribution_paid: true,
        pta_contribution_amount: 250.00,
        payment_date: '2024-08-15',
        is_active: true
      },
      {
        student_id: 'STU002',
        first_name: 'Maria',
        last_name: 'Santos',
        middle_name: 'Cruz',
        date_of_birth: '2014-07-22',
        gender: 'Female',
        grade_level: 'Grade 4',
        section: 'Lily',
        parent_name: 'Pedro Santos',
        parent_contact: '+63 923 456 7890',
        parent_email: 'pedro.santos@email.com',
        address: '456 Oak Avenue, City',
        pta_contribution_paid: false,
        pta_contribution_amount: 0.00,
        payment_date: null,
        is_active: true
      },
      {
        student_id: 'STU003',
        first_name: 'Carlos',
        last_name: 'Garcia',
        middle_name: 'Lopez',
        date_of_birth: '2013-11-08',
        gender: 'Male',
        grade_level: 'Grade 5',
        section: 'Sunflower',
        parent_name: 'Ana Garcia',
        parent_contact: '+63 934 567 8901',
        parent_email: 'ana.garcia@email.com',
        address: '789 Pine Street, City',
        pta_contribution_paid: true,
        pta_contribution_amount: 250.00,
        payment_date: '2024-08-20',
        is_active: true
      },
      {
        student_id: 'STU004',
        first_name: 'Sofia',
        last_name: 'Reyes',
        middle_name: 'Mendoza',
        date_of_birth: '2016-01-12',
        gender: 'Female',
        grade_level: 'Grade 2',
        section: 'Tulip',
        parent_name: 'Miguel Reyes',
        parent_contact: '+63 945 678 9012',
        parent_email: 'miguel.reyes@email.com',
        address: '321 Elm Street, City',
        pta_contribution_paid: false,
        pta_contribution_amount: 0.00,
        payment_date: null,
        is_active: true
      },
      {
        student_id: 'STU005',
        first_name: 'Luis',
        last_name: 'Fernandez',
        middle_name: 'Torres',
        date_of_birth: '2012-09-30',
        gender: 'Male',
        grade_level: 'Grade 6',
        section: 'Orchid',
        parent_name: 'Carmen Fernandez',
        parent_contact: '+63 956 789 0123',
        parent_email: 'carmen.fernandez@email.com',
        address: '654 Maple Drive, City',
        pta_contribution_paid: true,
        pta_contribution_amount: 250.00,
        payment_date: '2024-08-10',
        is_active: true
      }
    ];

    for (const student of sampleStudents) {
      const { error: studentError } = await supabase
        .from('ptavoid_students')
        .upsert(student);

      if (studentError) {
        console.error(`❌ Failed to create student ${student.student_id}:`, studentError.message);
      } else {
        console.log(`✅ Created student: ${student.first_name} ${student.last_name}`);
      }
    }

    // 3. Create sample income transactions
    console.log('\n3. Creating sample income transactions...');
    const sampleIncomeTransactions = [
      {
        transaction_id: 'INC001',
        description: 'PTA Contribution - John Doe',
        amount: 250.00,
        payment_method: 'cash',
        reference_number: 'REF001',
        transaction_date: '2024-08-15',
        status: 'completed',
        recorded_by: adminUserId
      },
      {
        transaction_id: 'INC002',
        description: 'PTA Contribution - Carlos Garcia',
        amount: 250.00,
        payment_method: 'gcash',
        reference_number: 'GC123456789',
        transaction_date: '2024-08-20',
        status: 'completed',
        recorded_by: adminUserId
      },
      {
        transaction_id: 'INC003',
        description: 'PTA Contribution - Luis Fernandez',
        amount: 250.00,
        payment_method: 'bank_transfer',
        reference_number: 'BT987654321',
        transaction_date: '2024-08-10',
        status: 'completed',
        recorded_by: adminUserId
      },
      {
        transaction_id: 'INC004',
        description: 'Fundraising - School Fair',
        amount: 5000.00,
        payment_method: 'cash',
        reference_number: 'FAIR2024',
        transaction_date: '2024-09-01',
        status: 'completed',
        recorded_by: adminUserId
      }
    ];

    for (const transaction of sampleIncomeTransactions) {
      const { error: incomeError } = await supabase
        .from('ptavoid_income_transactions')
        .upsert(transaction);

      if (incomeError) {
        console.error(`❌ Failed to create income transaction ${transaction.transaction_id}:`, incomeError.message);
      } else {
        console.log(`✅ Created income transaction: ${transaction.description}`);
      }
    }

    // 4. Create sample expense transactions
    console.log('\n4. Creating sample expense transactions...');
    const sampleExpenseTransactions = [
      {
        transaction_id: 'EXP001',
        description: 'School Supplies - Notebooks and Pens',
        amount: 1500.00,
        vendor_name: 'ABC School Supplies',
        receipt_number: 'REC001',
        transaction_date: '2024-08-25',
        status: 'approved',
        recorded_by: adminUserId,
        approved_by: adminUserId
      },
      {
        transaction_id: 'EXP002',
        description: 'Classroom Cleaning Supplies',
        amount: 800.00,
        vendor_name: 'Clean & Fresh Co.',
        receipt_number: 'REC002',
        transaction_date: '2024-09-05',
        status: 'approved',
        recorded_by: adminUserId,
        approved_by: adminUserId
      },
      {
        transaction_id: 'EXP003',
        description: 'Sports Equipment for PE Class',
        amount: 2200.00,
        vendor_name: 'Sports World',
        receipt_number: 'REC003',
        transaction_date: '2024-09-10',
        status: 'pending',
        recorded_by: adminUserId
      }
    ];

    for (const transaction of sampleExpenseTransactions) {
      const { error: expenseError } = await supabase
        .from('ptavoid_expense_transactions')
        .upsert(transaction);

      if (expenseError) {
        console.error(`❌ Failed to create expense transaction ${transaction.transaction_id}:`, expenseError.message);
      } else {
        console.log(`✅ Created expense transaction: ${transaction.description}`);
      }
    }

    console.log('\n🎉 Sample data population completed!');
    console.log('\n📊 Summary:');
    console.log('   - 1 Admin user profile');
    console.log('   - 5 Sample students (3 paid, 2 unpaid)');
    console.log('   - 4 Income transactions (₱5,750 total)');
    console.log('   - 3 Expense transactions (₱4,500 total)');
    console.log('   - Current balance: ₱1,250');

  } catch (error) {
    console.error('❌ Error populating sample data:', error.message);
  }
}

populateSampleData().catch(console.error);