# Database Documentation

## 🎯 Overview

The PTA Management System uses Supabase PostgreSQL database with comprehensive Row Level Security (RLS) policies, optimized schema design, and type-safe operations. This document outlines the database architecture, schema design, security policies, and operational procedures.

## 🏗️ Database Architecture

### **Technology Stack**
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Supabase Client with TypeScript
- **Security**: Row Level Security (RLS) policies
- **Authentication**: Supabase Auth integration
- **Type Safety**: Generated TypeScript types

### **Database Structure**
```
ptaVOID_members      # User accounts and roles
ptaVOID_students     # Student records and PTA payments
ptaVOID_income       # Income transactions
ptaVOID_expenses     # Expense transactions
```

## 📊 Database Schema

### **Members Table** (`ptaVOID_members`)

#### **Purpose**
Stores user accounts, authentication data, and role-based access control information.

#### **Schema Definition**
```sql
CREATE TABLE ptaVOID_members (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role user_role NOT NULL DEFAULT 'parent',
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'treasurer', 'teacher', 'parent');

-- Create indexes for performance
CREATE INDEX idx_members_email ON ptaVOID_members(email);
CREATE INDEX idx_members_role ON ptaVOID_members(role);
CREATE INDEX idx_members_created_at ON ptaVOID_members(created_at);
```

#### **Column Descriptions**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | UUID | Primary key, linked to Supabase auth.users | PRIMARY KEY, DEFAULT auth.uid() |
| `email` | VARCHAR(255) | User's email address | UNIQUE, NOT NULL |
| `full_name` | VARCHAR(255) | User's full name | NULLABLE |
| `role` | user_role | User's role in the system | NOT NULL, DEFAULT 'parent' |
| `phone` | VARCHAR(20) | Contact phone number | NULLABLE |
| `address` | TEXT | Physical address | NULLABLE |
| `created_at` | TIMESTAMPTZ | Record creation timestamp | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | Last update timestamp | DEFAULT NOW() |

#### **Row Level Security Policies**
```sql
-- Enable RLS
ALTER TABLE ptaVOID_members ENABLE ROW LEVEL SECURITY;

-- Users can read their own record
CREATE POLICY "Users can read own record" ON ptaVOID_members
  FOR SELECT USING (auth.uid() = id);

-- Admins can read all records
CREATE POLICY "Admins can read all records" ON ptaVOID_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ptaVOID_members 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can update their own record (except role)
CREATE POLICY "Users can update own record" ON ptaVOID_members
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    (OLD.role = NEW.role OR 
     EXISTS (SELECT 1 FROM ptaVOID_members WHERE id = auth.uid() AND role = 'admin'))
  );

-- Only admins can insert new members
CREATE POLICY "Only admins can insert members" ON ptaVOID_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM ptaVOID_members 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete members
CREATE POLICY "Only admins can delete members" ON ptaVOID_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM ptaVOID_members 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### **Students Table** (`ptaVOID_students`)

#### **Purpose**
Stores student information, grade levels, and PTA payment tracking.

#### **Schema Definition**
```sql
CREATE TABLE ptaVOID_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  grade_level VARCHAR(20) NOT NULL,
  section VARCHAR(10) NOT NULL,
  parent_id UUID REFERENCES ptaVOID_members(id) ON DELETE SET NULL,
  pta_payment_status payment_status DEFAULT 'unpaid',
  pta_payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create enum for payment status
CREATE TYPE payment_status AS ENUM ('paid', 'unpaid');

-- Create indexes for performance
CREATE INDEX idx_students_student_id ON ptaVOID_students(student_id);
CREATE INDEX idx_students_parent_id ON ptaVOID_students(parent_id);
CREATE INDEX idx_students_grade_level ON ptaVOID_students(grade_level);
CREATE INDEX idx_students_payment_status ON ptaVOID_students(pta_payment_status);
CREATE INDEX idx_students_created_at ON ptaVOID_students(created_at);
```

#### **Column Descriptions**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | UUID | Primary key | PRIMARY KEY, DEFAULT gen_random_uuid() |
| `student_id` | VARCHAR(50) | Unique student identifier | UNIQUE, NOT NULL |
| `full_name` | VARCHAR(255) | Student's full name | NOT NULL |
| `grade_level` | VARCHAR(20) | Student's grade level | NOT NULL |
| `section` | VARCHAR(10) | Class section | NOT NULL |
| `parent_id` | UUID | Reference to parent member | FOREIGN KEY, NULLABLE |
| `pta_payment_status` | payment_status | PTA contribution status | DEFAULT 'unpaid' |
| `pta_payment_date` | TIMESTAMPTZ | Date of PTA payment | NULLABLE |
| `created_at` | TIMESTAMPTZ | Record creation timestamp | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | Last update timestamp | DEFAULT NOW() |

#### **Row Level Security Policies**
```sql
-- Enable RLS
ALTER TABLE ptaVOID_students ENABLE ROW LEVEL SECURITY;

-- Parents can read their own children's records
CREATE POLICY "Parents can read own children" ON ptaVOID_students
  FOR SELECT USING (parent_id = auth.uid());

-- Teachers and admins can read all student records
CREATE POLICY "Teachers and admins can read all students" ON ptaVOID_students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ptaVOID_members 
      WHERE id = auth.uid() AND role IN ('admin', 'teacher')
    )
  );

-- Only admins and teachers can modify student records
CREATE POLICY "Admins and teachers can modify students" ON ptaVOID_students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ptaVOID_members 
      WHERE id = auth.uid() AND role IN ('admin', 'teacher')
    )
  );
```

### **Income Table** (`ptaVOID_income`)

#### **Purpose**
Tracks all income transactions including PTA contributions, fundraising, and other revenue.

#### **Schema Definition**
```sql
CREATE TABLE ptaVOID_income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  recorded_by UUID NOT NULL REFERENCES ptaVOID_members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_income_date ON ptaVOID_income(date);
CREATE INDEX idx_income_category ON ptaVOID_income(category);
CREATE INDEX idx_income_recorded_by ON ptaVOID_income(recorded_by);
CREATE INDEX idx_income_amount ON ptaVOID_income(amount);
CREATE INDEX idx_income_created_at ON ptaVOID_income(created_at);
```

#### **Column Descriptions**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | UUID | Primary key | PRIMARY KEY, DEFAULT gen_random_uuid() |
| `description` | TEXT | Income description | NOT NULL |
| `amount` | DECIMAL(10,2) | Income amount in PHP | NOT NULL, CHECK (amount > 0) |
| `date` | DATE | Transaction date | NOT NULL |
| `category` | VARCHAR(100) | Income category | NOT NULL |
| `recorded_by` | UUID | User who recorded the transaction | FOREIGN KEY, NOT NULL |
| `created_at` | TIMESTAMPTZ | Record creation timestamp | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | Last update timestamp | DEFAULT NOW() |

#### **Row Level Security Policies**
```sql
-- Enable RLS
ALTER TABLE ptaVOID_income ENABLE ROW LEVEL SECURITY;

-- Only admins and treasurers can access income records
CREATE POLICY "Financial access for income" ON ptaVOID_income
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ptaVOID_members 
      WHERE id = auth.uid() AND role IN ('admin', 'treasurer')
    )
  );
```

### **Expenses Table** (`ptaVOID_expenses`)

#### **Purpose**
Tracks all expense transactions including operational costs, supplies, and other expenditures.

#### **Schema Definition**
```sql
CREATE TABLE ptaVOID_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  recorded_by UUID NOT NULL REFERENCES ptaVOID_members(id),
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_expenses_date ON ptaVOID_expenses(date);
CREATE INDEX idx_expenses_category ON ptaVOID_expenses(category);
CREATE INDEX idx_expenses_recorded_by ON ptaVOID_expenses(recorded_by);
CREATE INDEX idx_expenses_amount ON ptaVOID_expenses(amount);
CREATE INDEX idx_expenses_created_at ON ptaVOID_expenses(created_at);
```

#### **Column Descriptions**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | UUID | Primary key | PRIMARY KEY, DEFAULT gen_random_uuid() |
| `description` | TEXT | Expense description | NOT NULL |
| `amount` | DECIMAL(10,2) | Expense amount in PHP | NOT NULL, CHECK (amount > 0) |
| `date` | DATE | Transaction date | NOT NULL |
| `category` | VARCHAR(100) | Expense category | NOT NULL |
| `recorded_by` | UUID | User who recorded the transaction | FOREIGN KEY, NOT NULL |
| `receipt_url` | TEXT | URL to receipt image/document | NULLABLE |
| `created_at` | TIMESTAMPTZ | Record creation timestamp | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | Last update timestamp | DEFAULT NOW() |

#### **Row Level Security Policies**
```sql
-- Enable RLS
ALTER TABLE ptaVOID_expenses ENABLE ROW LEVEL SECURITY;

-- Only admins and treasurers can access expense records
CREATE POLICY "Financial access for expenses" ON ptaVOID_expenses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ptaVOID_members 
      WHERE id = auth.uid() AND role IN ('admin', 'treasurer')
    )
  );
```

## 🔧 Database Functions and Triggers

### **Update Timestamp Trigger**
```sql
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_members_updated_at 
  BEFORE UPDATE ON ptaVOID_members 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at 
  BEFORE UPDATE ON ptaVOID_students 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_updated_at 
  BEFORE UPDATE ON ptaVOID_income 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at 
  BEFORE UPDATE ON ptaVOID_expenses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **Dashboard Statistics Function**
```sql
-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalIncome', COALESCE(SUM(amount), 0),
    'totalExpenses', 0,
    'totalStudents', 0,
    'totalMembers', 0,
    'ptaPaidStudents', 0,
    'ptaUnpaidStudents', 0
  ) INTO result
  FROM ptaVOID_income;
  
  -- Update with expenses
  UPDATE result SET result = json_build_object(
    'totalIncome', (result->>'totalIncome')::DECIMAL,
    'totalExpenses', COALESCE((SELECT SUM(amount) FROM ptaVOID_expenses), 0),
    'totalStudents', (SELECT COUNT(*) FROM ptaVOID_students),
    'totalMembers', (SELECT COUNT(*) FROM ptaVOID_members),
    'ptaPaidStudents', (SELECT COUNT(*) FROM ptaVOID_students WHERE pta_payment_status = 'paid'),
    'ptaUnpaidStudents', (SELECT COUNT(*) FROM ptaVOID_students WHERE pta_payment_status = 'unpaid')
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **PTA Payment Update Function**
```sql
-- Function to update PTA payment status
CREATE OR REPLACE FUNCTION update_pta_payment(
  student_uuid UUID,
  payment_status payment_status,
  payment_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE ptaVOID_students 
  SET 
    pta_payment_status = payment_status,
    pta_payment_date = CASE 
      WHEN payment_status = 'paid' THEN payment_date 
      ELSE NULL 
    END,
    updated_at = NOW()
  WHERE id = student_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 📈 Database Views

### **Student Summary View**
```sql
-- View for student summary with parent information
CREATE VIEW student_summary AS
SELECT 
  s.id,
  s.student_id,
  s.full_name AS student_name,
  s.grade_level,
  s.section,
  s.pta_payment_status,
  s.pta_payment_date,
  m.full_name AS parent_name,
  m.email AS parent_email,
  m.phone AS parent_phone
FROM ptaVOID_students s
LEFT JOIN ptaVOID_members m ON s.parent_id = m.id;
```

### **Financial Summary View**
```sql
-- View for financial summary by category
CREATE VIEW financial_summary AS
SELECT 
  'income' AS transaction_type,
  category,
  COUNT(*) AS transaction_count,
  SUM(amount) AS total_amount,
  AVG(amount) AS average_amount,
  MIN(date) AS earliest_date,
  MAX(date) AS latest_date
FROM ptaVOID_income
GROUP BY category

UNION ALL

SELECT 
  'expense' AS transaction_type,
  category,
  COUNT(*) AS transaction_count,
  SUM(amount) AS total_amount,
  AVG(amount) AS average_amount,
  MIN(date) AS earliest_date,
  MAX(date) AS latest_date
FROM ptaVOID_expenses
GROUP BY category;
```

## 🔍 Database Operations

### **Type-Safe Database Client**

#### **File**: [`src/lib/database.ts`](../src/lib/database.ts)

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import type { 
  Member, 
  Student, 
  Income, 
  Expense,
  MemberInsert,
  StudentInsert,
  IncomeInsert,
  ExpenseInsert
} from '@/types/database';

// Create typed Supabase client
const supabase = createClientComponentClient<Database>();

export class DatabaseService {
  // Member operations
  static async getMembers(): Promise<Member[]> {
    const { data, error } = await supabase
      .from('ptaVOID_members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch members: ${error.message}`);
    }

    return data || [];
  }

  static async getMember(id: string): Promise<Member | null> {
    const { data, error } = await supabase
      .from('ptaVOID_members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch member: ${error.message}`);
    }

    return data;
  }

  static async createMember(memberData: MemberInsert): Promise<Member> {
    const { data, error } = await supabase
      .from('ptaVOID_members')
      .insert(memberData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create member: ${error.message}`);
    }

    return data;
  }

  static async updateMember(id: string, updates: Partial<Member>): Promise<Member> {
    const { data, error } = await supabase
      .from('ptaVOID_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update member: ${error.message}`);
    }

    return data;
  }

  static async deleteMember(id: string): Promise<void> {
    const { error } = await supabase
      .from('ptaVOID_members')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete member: ${error.message}`);
    }
  }

  // Student operations
  static async getStudents(): Promise<Student[]> {
    const { data, error } = await supabase
      .from('ptaVOID_students')
      .select('*')
      .order('grade_level', { ascending: true })
      .order('section', { ascending: true })
      .order('full_name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch students: ${error.message}`);
    }

    return data || [];
  }

  static async getStudentsByParent(parentId: string): Promise<Student[]> {
    const { data, error } = await supabase
      .from('ptaVOID_students')
      .select('*')
      .eq('parent_id', parentId)
      .order('grade_level', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch students by parent: ${error.message}`);
    }

    return data || [];
  }

  static async createStudent(studentData: StudentInsert): Promise<Student> {
    const { data, error } = await supabase
      .from('ptaVOID_students')
      .insert(studentData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create student: ${error.message}`);
    }

    return data;
  }

  static async updatePTAPayment(
    studentId: string, 
    status: 'paid' | 'unpaid'
  ): Promise<Student> {
    const updates = {
      pta_payment_status: status,
      pta_payment_date: status === 'paid' ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from('ptaVOID_students')
      .update(updates)
      .eq('id', studentId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update PTA payment: ${error.message}`);
    }

    return data;
  }

  // Income operations
  static async getIncome(): Promise<Income[]> {
    const { data, error } = await supabase
      .from('ptaVOID_income')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch income: ${error.message}`);
    }

    return data || [];
  }

  static async createIncome(incomeData: IncomeInsert): Promise<Income> {
    const { data, error } = await supabase
      .from('ptaVOID_income')
      .insert(incomeData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create income record: ${error.message}`);
    }

    return data;
  }

  // Expense operations
  static async getExpenses(): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('ptaVOID_expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch expenses: ${error.message}`);
    }

    return data || [];
  }

  static async createExpense(expenseData: ExpenseInsert): Promise<Expense> {
    const { data, error } = await supabase
      .from('ptaVOID_expenses')
      .insert(expenseData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create expense record: ${error.message}`);
    }

    return data;
  }

  // Dashboard statistics
  static async getDashboardStats(): Promise<{
    totalIncome: number;
    totalExpenses: number;
    totalStudents: number;
    totalMembers: number;
    ptaPaidStudents: number;
    ptaUnpaidStudents: number;
  }> {
    try {
      // Get all statistics in parallel
      const [
        incomeResult,
        expenseResult,
        studentsResult,
        membersResult,
        paidStudentsResult,
        unpaidStudentsResult,
      ] = await Promise.all([
        supabase.from('ptaVOID_income').select('amount'),
        supabase.from('ptaVOID_expenses').select('amount'),
        supabase.from('ptaVOID_students').select('id', { count: 'exact' }),
        supabase.from('ptaVOID_members').select('id', { count: 'exact' }),
        supabase.from('ptaVOID_students').select('id', { count: 'exact' }).eq('pta_payment_status', 'paid'),
        supabase.from('ptaVOID_students').select('id', { count: 'exact' }).eq('pta_payment_status', 'unpaid'),
      ]);

      // Calculate totals
      const totalIncome = incomeResult.data?.reduce((sum, record) => sum + record.amount, 0) || 0;
      const totalExpenses = expenseResult.data?.reduce((sum, record) => sum + record.amount, 0) || 0;

      return {
        totalIncome,
        totalExpenses,
        totalStudents: studentsResult.count || 0,
        totalMembers: membersResult.count || 0,
        ptaPaidStudents: paidStudentsResult.count || 0,
        ptaUnpaidStudents: unpaidStudentsResult.count || 0,
      };
    } catch (error) {
      throw new Error(`Failed to fetch dashboard statistics: ${error}`);
    }
  }
}
```

## 🔧 Database Migrations

### **Initial Migration Script**
```sql
-- Migration: 001_initial_schema.sql
-- Create initial database schema for PTA Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'treasurer', 'teacher', 'parent');
CREATE TYPE payment_status AS ENUM ('paid', 'unpaid');

-- Create members table
CREATE TABLE ptaVOID_members (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role user_role NOT NULL DEFAULT 'parent',
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create students table
CREATE TABLE ptaVOID_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  grade_level VARCHAR(20) NOT NULL,
  section VARCHAR(10) NOT NULL,
  parent_id UUID REFERENCES ptaVOID_members(id) ON DELETE SET NULL,
  pta_payment_status payment_status DEFAULT 'unpaid',
  pta_payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create income table
CREATE TABLE ptaVOID_income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  recorded_by UUID NOT NULL REFERENCES ptaVOID_members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE ptaVOID_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  recorded_by UUID NOT NULL REFERENCES ptaVOID_members(id),
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_members_email ON ptaVOID_members(email);
CREATE INDEX idx_members_role ON ptaVOID_members(role);
CREATE INDEX idx_students_student_id ON ptaVOID_students(student_id);
CREATE INDEX idx_students_parent_id ON ptaVOID_students(parent_id);
CREATE INDEX idx_students_payment_status ON ptaVOID_students(pta_payment_status);
CREATE INDEX idx_income_date ON ptaVOID_income(date);
CREATE INDEX idx_income_category ON ptaVOID_income(category);
CREATE INDEX idx_expenses_date ON ptaVOID_expenses(date);
CREATE INDEX idx_expenses_category ON ptaVOID_expenses(category);

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_members_updated_at 
  BEFORE UPDATE ON ptaVOID_members 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at 
  BEFORE UPDATE ON ptaVOID_students 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_updated_at 
  BEFORE UPDATE ON ptaVOID_income 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at 
  BEFORE UPDATE ON ptaVOID_expenses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **RLS Policies Migration**
```sql
-- Migration: 002_rls_policies.sql
-- Enable Row Level Security and create policies

-- Enable RLS on all tables
ALTER TABLE ptaVOID_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ptaVOID_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE ptaVOID_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE ptaVOID_expenses ENABLE ROW LEVEL SECURITY;

-- Members table policies
CREATE POLICY "Users can read own record" ON ptaVOID_members
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can read all records" ON ptaVOID_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ptaVOID_members 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own record" ON ptaVOID_members
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    (OLD.role = NEW.role OR 
     EXISTS (SELECT 1 FROM ptaVOID_members WHERE id = auth.uid() AND role = 'admin'))
  );

CREATE POLICY "Only admins can insert members" ON ptaVOID_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM ptaVOID_members 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Students table policies
CREATE POLICY "Parents can read own children" ON ptaVOID_students
  FOR SELECT USING (parent_id = auth.uid());