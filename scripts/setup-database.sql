-- PTA Management System Database Schema
-- This script creates all the necessary tables for the PTA system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS ptaVOID_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'principal', 'teacher', 'treasurer', 'parent')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grades table
CREATE TABLE IF NOT EXISTS ptaVOID_grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade_level VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sections table
CREATE TABLE IF NOT EXISTS ptaVOID_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_name VARCHAR(100) NOT NULL,
    grade_id UUID REFERENCES ptaVOID_grades(id) ON DELETE CASCADE,
    adviser_id UUID REFERENCES ptaVOID_users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parents table
CREATE TABLE IF NOT EXISTS ptaVOID_parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES ptaVOID_users(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20),
    address TEXT,
    occupation VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS ptaVOID_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female')),
    section_id UUID REFERENCES ptaVOID_sections(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES ptaVOID_parents(id) ON DELETE CASCADE,
    pta_contribution_paid BOOLEAN DEFAULT false,
    pta_contribution_amount DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Income Categories table
CREATE TABLE IF NOT EXISTS ptaVOID_income_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense Categories table
CREATE TABLE IF NOT EXISTS ptaVOID_expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Income Transactions table
CREATE TABLE IF NOT EXISTS ptaVOID_income_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    parent_id UUID REFERENCES ptaVOID_parents(id) ON DELETE CASCADE,
    student_id UUID REFERENCES ptaVOID_students(id) ON DELETE CASCADE,
    income_category_id UUID REFERENCES ptaVOID_income_categories(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'cash',
    reference_number VARCHAR(255),
    description TEXT,
    recorded_by UUID REFERENCES ptaVOID_users(id) ON DELETE SET NULL,
    transaction_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense Transactions table
CREATE TABLE IF NOT EXISTS ptaVOID_expense_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    expense_category_id UUID REFERENCES ptaVOID_expense_categories(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    vendor_name VARCHAR(255),
    receipt_number VARCHAR(255),
    recorded_by UUID REFERENCES ptaVOID_users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES ptaVOID_users(id) ON DELETE SET NULL,
    transaction_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default grades
INSERT INTO ptaVOID_grades (grade_level, description) VALUES
('Kindergarten', 'Kindergarten Level'),
('Grade 1', 'First Grade'),
('Grade 2', 'Second Grade'),
('Grade 3', 'Third Grade'),
('Grade 4', 'Fourth Grade'),
('Grade 5', 'Fifth Grade'),
('Grade 6', 'Sixth Grade')
ON CONFLICT DO NOTHING;

-- Insert default income categories
INSERT INTO ptaVOID_income_categories (category_name, description) VALUES
('PTA Contribution', 'Regular PTA membership contribution'),
('Fundraising', 'Income from fundraising activities'),
('Donations', 'Donations from parents and community'),
('Events', 'Income from school events')
ON CONFLICT DO NOTHING;

-- Insert default expense categories
INSERT INTO ptaVOID_expense_categories (category_name, description) VALUES
('School Supplies', 'Purchase of school supplies and materials'),
('Events & Activities', 'Expenses for school events and activities'),
('Maintenance', 'School maintenance and repairs'),
('Equipment', 'Purchase of school equipment'),
('Utilities', 'Utility expenses'),
('Other', 'Other miscellaneous expenses')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ptaVOID_users_email ON ptaVOID_users(email);
CREATE INDEX IF NOT EXISTS idx_ptaVOID_users_role ON ptaVOID_users(role);
CREATE INDEX IF NOT EXISTS idx_ptaVOID_students_student_id ON ptaVOID_students(student_id);
CREATE INDEX IF NOT EXISTS idx_ptaVOID_students_section_id ON ptaVOID_students(section_id);
CREATE INDEX IF NOT EXISTS idx_ptaVOID_students_parent_id ON ptaVOID_students(parent_id);
CREATE INDEX IF NOT EXISTS idx_ptaVOID_income_transactions_parent_id ON ptaVOID_income_transactions(parent_id);
CREATE INDEX IF NOT EXISTS idx_ptaVOID_income_transactions_student_id ON ptaVOID_income_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_ptaVOID_expense_transactions_category_id ON ptaVOID_expense_transactions(expense_category_id);
CREATE INDEX IF NOT EXISTS idx_ptaVOID_income_transactions_date ON ptaVOID_income_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_ptaVOID_expense_transactions_date ON ptaVOID_expense_transactions(transaction_date);

-- Enable Row Level Security (RLS)
ALTER TABLE ptaVOID_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ptaVOID_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE ptaVOID_parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ptaVOID_income_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ptaVOID_expense_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies - can be refined later)
CREATE POLICY "Users can view their own data" ON ptaVOID_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON ptaVOID_users FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM ptaVOID_users 
        WHERE id = auth.uid() AND role IN ('admin', 'principal')
    )
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;