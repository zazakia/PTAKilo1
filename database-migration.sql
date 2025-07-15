-- Vel PTA Management Web App - Complete Database Migration
-- PostgreSQL with Supabase and ptaVOID_ prefix

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS ptaVOID_audit_logs CASCADE;
DROP TABLE IF EXISTS ptaVOID_receipts CASCADE;
DROP TABLE IF EXISTS ptaVOID_expense_transactions CASCADE;
DROP TABLE IF EXISTS ptaVOID_income_transactions CASCADE;
DROP TABLE IF EXISTS ptaVOID_expense_categories CASCADE;
DROP TABLE IF EXISTS ptaVOID_income_categories CASCADE;
DROP TABLE IF EXISTS ptaVOID_students CASCADE;
DROP TABLE IF EXISTS ptaVOID_sections CASCADE;
DROP TABLE IF EXISTS ptaVOID_teachers CASCADE;
DROP TABLE IF EXISTS ptaVOID_grades CASCADE;
DROP TABLE IF EXISTS ptaVOID_parents CASCADE;
DROP TABLE IF EXISTS ptaVOID_users CASCADE;

-- Create Users table
CREATE TABLE ptaVOID_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'principal', 'teacher', 'treasurer', 'parent')),
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Grades table
CREATE TABLE ptaVOID_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_name TEXT NOT NULL UNIQUE,
    grade_level INTEGER NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Teachers table
CREATE TABLE ptaVOID_teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES ptaVOID_users(id) ON DELETE CASCADE,
    employee_id TEXT UNIQUE,
    department TEXT,
    position TEXT,
    hire_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Sections table
CREATE TABLE ptaVOID_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_name TEXT NOT NULL,
    grade_id UUID REFERENCES ptaVOID_grades(id) ON DELETE RESTRICT,
    teacher_id UUID REFERENCES ptaVOID_teachers(id) ON DELETE SET NULL,
    school_year TEXT NOT NULL,
    max_students INTEGER DEFAULT 40,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(section_name, grade_id, school_year)
);

-- Create Parents table
CREATE TABLE ptaVOID_parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES ptaVOID_users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    middle_name TEXT,
    contact_number TEXT,
    email TEXT UNIQUE,
    address TEXT,
    occupation TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    relationship_to_student TEXT DEFAULT 'Parent',
    pta_contribution_paid BOOLEAN DEFAULT false,
    pta_contribution_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Students table
CREATE TABLE ptaVOID_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    middle_name TEXT,
    birth_date DATE,
    gender TEXT CHECK (gender IN ('Male', 'Female')),
    section_id UUID REFERENCES ptaVOID_sections(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES ptaVOID_parents(id) ON DELETE CASCADE,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    pta_contribution_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Income Categories table
CREATE TABLE ptaVOID_income_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_per_family BOOLEAN DEFAULT false,
    default_amount DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Expense Categories table
CREATE TABLE ptaVOID_expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name TEXT NOT NULL UNIQUE,
    description TEXT,
    budget_limit DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Income Transactions table
CREATE TABLE ptaVOID_income_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_number TEXT UNIQUE NOT NULL,
    parent_id UUID REFERENCES ptaVOID_parents(id) ON DELETE CASCADE,
    student_id UUID REFERENCES ptaVOID_students(id) ON DELETE SET NULL,
    income_category_id UUID REFERENCES ptaVOID_income_categories(id) ON DELETE RESTRICT,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_method TEXT DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'Check', 'Bank Transfer', 'GCash', 'PayMaya')),
    reference_number TEXT,
    notes TEXT,
    receipt_issued BOOLEAN DEFAULT false,
    recorded_by UUID REFERENCES ptaVOID_users(id) ON DELETE SET NULL,
    school_year TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Expense Transactions table
CREATE TABLE ptaVOID_expense_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_number TEXT UNIQUE NOT NULL,
    expense_category_id UUID REFERENCES ptaVOID_expense_categories(id) ON DELETE RESTRICT,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    vendor_name TEXT,
    payment_method TEXT DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'Check', 'Bank Transfer')),
    reference_number TEXT,
    approved_by UUID REFERENCES ptaVOID_users(id) ON DELETE SET NULL,
    recorded_by UUID REFERENCES ptaVOID_users(id) ON DELETE SET NULL,
    expense_date DATE DEFAULT CURRENT_DATE,
    school_year TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Receipts table
CREATE TABLE ptaVOID_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    income_transaction_id UUID REFERENCES ptaVOID_income_transactions(id) ON DELETE CASCADE,
    expense_transaction_id UUID REFERENCES ptaVOID_expense_transactions(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    uploaded_by UUID REFERENCES ptaVOID_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT receipt_transaction_check CHECK (
        (income_transaction_id IS NOT NULL AND expense_transaction_id IS NULL) OR
        (income_transaction_id IS NULL AND expense_transaction_id IS NOT NULL)
    )
);

-- Create Audit Logs table
CREATE TABLE ptaVOID_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES ptaVOID_users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX idx_ptaVOID_users_email ON ptaVOID_users(email);
CREATE INDEX idx_ptaVOID_users_role ON ptaVOID_users(role);

CREATE INDEX idx_ptaVOID_parents_user_id ON ptaVOID_parents(user_id);
CREATE INDEX idx_ptaVOID_parents_email ON ptaVOID_parents(email);
CREATE INDEX idx_ptaVOID_parents_pta_paid ON ptaVOID_parents(pta_contribution_paid);

CREATE INDEX idx_ptaVOID_students_parent_id ON ptaVOID_students(parent_id);
CREATE INDEX idx_ptaVOID_students_section_id ON ptaVOID_students(section_id);
CREATE INDEX idx_ptaVOID_students_student_id ON ptaVOID_students(student_id);
CREATE INDEX idx_ptaVOID_students_pta_paid ON ptaVOID_students(pta_contribution_paid);

CREATE INDEX idx_ptaVOID_sections_grade_id ON ptaVOID_sections(grade_id);
CREATE INDEX idx_ptaVOID_sections_teacher_id ON ptaVOID_sections(teacher_id);
CREATE INDEX idx_ptaVOID_sections_school_year ON ptaVOID_sections(school_year);

CREATE INDEX idx_ptaVOID_income_parent_id ON ptaVOID_income_transactions(parent_id);
CREATE INDEX idx_ptaVOID_income_category_id ON ptaVOID_income_transactions(income_category_id);
CREATE INDEX idx_ptaVOID_income_school_year ON ptaVOID_income_transactions(school_year);
CREATE INDEX idx_ptaVOID_income_created_at ON ptaVOID_income_transactions(created_at);

CREATE INDEX idx_ptaVOID_expense_category_id ON ptaVOID_expense_transactions(expense_category_id);
CREATE INDEX idx_ptaVOID_expense_school_year ON ptaVOID_expense_transactions(school_year);
CREATE INDEX idx_ptaVOID_expense_created_at ON ptaVOID_expense_transactions(created_at);

CREATE INDEX idx_ptaVOID_audit_table_record ON ptaVOID_audit_logs(table_name, record_id);
CREATE INDEX idx_ptaVOID_audit_user_id ON ptaVOID_audit_logs(user_id);
CREATE INDEX idx_ptaVOID_audit_created_at ON ptaVOID_audit_logs(created_at);

-- Create Functions
CREATE OR REPLACE FUNCTION update_student_pta_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update for PTA contribution fees
    IF EXISTS (
        SELECT 1 FROM ptaVOID_income_categories 
        WHERE id = NEW.income_category_id 
        AND is_per_family = true
    ) THEN
        -- Update all students under this parent
        UPDATE ptaVOID_students 
        SET pta_contribution_paid = true,
            updated_at = NOW()
        WHERE parent_id = NEW.parent_id;
        
        -- Update parent record
        UPDATE ptaVOID_parents 
        SET pta_contribution_paid = true,
            pta_contribution_date = NEW.created_at,
            updated_at = NOW()
        WHERE id = NEW.parent_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Audit Trigger Function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO ptaVOID_audit_logs (
            table_name, record_id, action, old_values, user_id, created_at
        ) VALUES (
            TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), 
            COALESCE(current_setting('app.current_user_id', true)::UUID, NULL), NOW()
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO ptaVOID_audit_logs (
            table_name, record_id, action, old_values, new_values, user_id, created_at
        ) VALUES (
            TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW),
            COALESCE(current_setting('app.current_user_id', true)::UUID, NULL), NOW()
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO ptaVOID_audit_logs (
            table_name, record_id, action, new_values, user_id, created_at
        ) VALUES (
            TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW),
            COALESCE(current_setting('app.current_user_id', true)::UUID, NULL), NOW()
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create Triggers
CREATE TRIGGER trigger_update_pta_status
    AFTER INSERT ON ptaVOID_income_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_student_pta_status();

-- Create Audit Triggers
CREATE TRIGGER audit_ptaVOID_income_transactions
    AFTER INSERT OR UPDATE OR DELETE ON ptaVOID_income_transactions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_ptaVOID_expense_transactions
    AFTER INSERT OR UPDATE OR DELETE ON ptaVOID_expense_transactions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_ptaVOID_parents
    AFTER INSERT OR UPDATE OR DELETE ON ptaVOID_parents
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_ptaVOID_students
    AFTER INSERT OR UPDATE OR DELETE ON ptaVOID_students
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Insert Default Data
INSERT INTO ptaVOID_grades (grade_name, grade_level) VALUES
('Kindergarten', 0),
('Grade 1', 1),
('Grade 2', 2),
('Grade 3', 3),
('Grade 4', 4),
('Grade 5', 5),
('Grade 6', 6);

INSERT INTO ptaVOID_income_categories (category_name, description, is_per_family, default_amount) VALUES
('PTA Contribution Fee', 'Annual PTA membership fee per family', true, 250.00),
('SPG Fee', 'Supreme Pupil Government fee per student', false, 50.00),
('School Supplies', 'Additional school supplies fee per student', false, 100.00),
('Field Trip', 'Educational field trip fee per student', false, 200.00),
('Special Projects', 'Special school projects contribution', false, 150.00);

INSERT INTO ptaVOID_expense_categories (category_name, description, budget_limit) VALUES
('Security Guards', 'Payment for school security personnel', 50000.00),
('Snacks/Refreshments', 'Food and beverages for school events', 20000.00),
('School Supplies', 'Office and classroom supplies', 30000.00),
('Maintenance', 'School facility maintenance and repairs', 40000.00),
('Events/Activities', 'School programs and activities', 25000.00),
('Utilities', 'Additional utility expenses', 15000.00);

-- Create Views for Reporting
CREATE VIEW ptaVOID_payment_status_summary AS
SELECT 
    g.grade_name,
    s.section_name,
    COUNT(st.id) as total_students,
    COUNT(CASE WHEN st.pta_contribution_paid THEN 1 END) as paid_students,
    COUNT(CASE WHEN NOT st.pta_contribution_paid THEN 1 END) as unpaid_students,
    ROUND(
        (COUNT(CASE WHEN st.pta_contribution_paid THEN 1 END)::DECIMAL / COUNT(st.id)) * 100, 
        2
    ) as payment_percentage
FROM ptaVOID_students st
JOIN ptaVOID_sections s ON st.section_id = s.id
JOIN ptaVOID_grades g ON s.grade_id = g.id
WHERE st.is_active = true AND s.is_active = true
GROUP BY g.grade_name, s.section_name, g.grade_level
ORDER BY g.grade_level, s.section_name;

CREATE VIEW ptaVOID_financial_summary AS
SELECT 
    school_year,
    'Income' as transaction_type,
    ic.category_name,
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount
FROM ptaVOID_income_transactions it
JOIN ptaVOID_income_categories ic ON it.income_category_id = ic.id
GROUP BY school_year, ic.category_name

UNION ALL

SELECT 
    school_year,
    'Expense' as transaction_type,
    ec.category_name,
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount
FROM ptaVOID_expense_transactions et
JOIN ptaVOID_expense_categories ec ON et.expense_category_id = ec.id
GROUP BY school_year, ec.category_name

ORDER BY school_year DESC, transaction_type, category_name;

-- Enable Row Level Security (RLS) - Basic setup
-- Note: Detailed RLS policies will be added after Supabase Auth integration

ALTER TABLE ptaVOID_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ptaVOID_parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ptaVOID_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE ptaVOID_income_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ptaVOID_expense_transactions ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (will be enhanced with Supabase Auth)
CREATE POLICY "Enable read access for authenticated users" ON ptaVOID_users
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for authenticated users" ON ptaVOID_parents
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for authenticated users" ON ptaVOID_students
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for authenticated users" ON ptaVOID_income_transactions
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for authenticated users" ON ptaVOID_expense_transactions
    FOR SELECT USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Migration completed successfully
SELECT 'Database migration completed successfully!' as status;