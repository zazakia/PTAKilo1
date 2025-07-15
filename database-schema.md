# Database Schema - PTA Management System

## Overview
This document outlines the complete database schema for the PTA Management Web App using PostgreSQL with Supabase. All tables use the `ptaVOID_` prefix as requested.

## Schema Design Principles
- All tables use UUID primary keys for security
- Timestamps for audit trails
- Row Level Security (RLS) for data protection
- Foreign key constraints for data integrity
- Indexes for performance optimization

## Core Tables

### 1. ptaVOID_users
**Purpose:** User authentication and role management
```sql
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
```

### 2. ptaVOID_grades
**Purpose:** Grade/Year level management
```sql
CREATE TABLE ptaVOID_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_name TEXT NOT NULL UNIQUE, -- e.g., "Grade 1", "Grade 2"
    grade_level INTEGER NOT NULL UNIQUE, -- 1, 2, 3, etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. ptaVOID_teachers
**Purpose:** Teacher information and management
```sql
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
```

### 4. ptaVOID_sections
**Purpose:** Class section management
```sql
CREATE TABLE ptaVOID_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_name TEXT NOT NULL, -- e.g., "A", "B", "Mabini"
    grade_id UUID REFERENCES ptaVOID_grades(id) ON DELETE RESTRICT,
    teacher_id UUID REFERENCES ptaVOID_teachers(id) ON DELETE SET NULL,
    school_year TEXT NOT NULL, -- e.g., "2024-2025"
    max_students INTEGER DEFAULT 40,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(section_name, grade_id, school_year)
);
```

### 5. ptaVOID_parents
**Purpose:** Parent/Guardian information
```sql
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
```

### 6. ptaVOID_students
**Purpose:** Student records and information
```sql
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
    pta_contribution_paid BOOLEAN DEFAULT false, -- Auto-updated from parent
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 7. ptaVOID_income_categories
**Purpose:** Income type categorization
```sql
CREATE TABLE ptaVOID_income_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_per_family BOOLEAN DEFAULT false, -- true for PTA contribution, false for per-student fees
    default_amount DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 8. ptaVOID_expense_categories
**Purpose:** Expense type categorization
```sql
CREATE TABLE ptaVOID_expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name TEXT NOT NULL UNIQUE,
    description TEXT,
    budget_limit DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 9. ptaVOID_income_transactions
**Purpose:** Income/Payment records
```sql
CREATE TABLE ptaVOID_income_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_number TEXT UNIQUE NOT NULL,
    parent_id UUID REFERENCES ptaVOID_parents(id) ON DELETE CASCADE,
    student_id UUID REFERENCES ptaVOID_students(id) ON DELETE SET NULL, -- NULL for family payments
    income_category_id UUID REFERENCES ptaVOID_income_categories(id) ON DELETE RESTRICT,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_method TEXT DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'Check', 'Bank Transfer', 'GCash', 'PayMaya')),
    reference_number TEXT, -- For non-cash payments
    notes TEXT,
    receipt_issued BOOLEAN DEFAULT false,
    recorded_by UUID REFERENCES ptaVOID_users(id) ON DELETE SET NULL,
    school_year TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 10. ptaVOID_expense_transactions
**Purpose:** Expense records
```sql
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
```

### 11. ptaVOID_receipts
**Purpose:** Receipt file management
```sql
CREATE TABLE ptaVOID_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    income_transaction_id UUID REFERENCES ptaVOID_income_transactions(id) ON DELETE CASCADE,
    expense_transaction_id UUID REFERENCES ptaVOID_expense_transactions(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Supabase Storage path
    file_size INTEGER,
    mime_type TEXT,
    uploaded_by UUID REFERENCES ptaVOID_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT receipt_transaction_check CHECK (
        (in + Prisma NULL AND expense_transaction_id IS NULL) OR
        (income_transaction_id IS NULL AND expense_transaction_id IS NOT NULL)
    )
);
```

### 12. ptaVOID_audit_logs
**Purpose:** Transaction audit trail
```sql
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
```

## Indexes for Performance

```sql
-- User indexes
CREATE INDEX idx_ptaVOID_users_email ON ptaVOID_users(email);
CREATE INDEX idx_ptaVOID_users_role ON ptaVOID_users(role);

-- Parent indexes
CREATE INDEX idx_ptaVOID_parents_user_id ON ptaVOID_parents(user_id);
CREATE INDEX idx_ptaVOID_parents_email ON ptaVOID_parents(email);
CREATE INDEX idx_ptaVOID_parents_pta_paid ON ptaVOID_parents(pta_contribution_paid);

-- Student indexes
CREATE INDEX idx_ptaVOID_students_parent_id ON ptaVOID_students(parent_id);
CREATE INDEX idx_ptaVOID_students_section_id ON ptaVOID_students(section_id);
CREATE INDEX idx_ptaVOID_students_student_id ON ptaVOID_students(student_id);
CREATE INDEX idx_ptaVOID_students_pta_paid ON ptaVOID_students(pta_contribution_paid);

-- Section indexes
CREATE INDEX idx_ptaVOID_sections_grade_id ON ptaVOID_sections(grade_id);
CREATE INDEX idx_ptaVOID_sections_teacher_id ON ptaVOID_sections(teacher_id);
CREATE INDEX idx_ptaVOID_sections_school_year ON ptaVOID_sections(school_year);

-- Transaction indexes
CREATE INDEX idx_ptaVOID_income_parent_id ON ptaVOID_income_transactions(parent_id);
CREATE INDEX idx_ptaVOID_income_category_id ON ptaVOID_income_transactions(income_category_id);
CREATE INDEX idx_ptaVOID_income_school_year ON ptaVOID_income_transactions(school_year);
CREATE INDEX idx_ptaVOID_income_created_at ON ptaVOID_income_transactions(created_at);

CREATE INDEX idx_ptaVOID_expense_category_id ON ptaVOID_expense_transactions(expense_category_id);
CREATE INDEX idx_ptaVOID_expense_school_year ON ptaVOID_expense_transactions(school_year);
CREATE INDEX idx_ptaVOID_expense_created_at ON ptaVOID_expense_transactions(created_at);

-- Audit log indexes
CREATE INDEX idx_ptaVOID_audit_table_record ON ptaVOID_audit_logs(table_name, record_id);
CREATE INDEX idx_ptaVOID_audit_user_id ON ptaVOID_audit_logs(user_id);
CREATE INDEX idx_ptaVOID_audit_created_at ON ptaVOID_audit_logs(created_at);
```

## Database Functions

### 1. Update Student PTA Status Function
```sql
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
```

### 2. Audit Log Trigger Function
```sql
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO ptaVOID_audit_logs (
            table_name, record_id, action, old_values, user_id, created_at
        ) VALUES (
            TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), 
            current_setting('app.current_user_id', true)::UUID, NOW()
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO ptaVOID_audit_logs (
            table_name, record_id, action, old_values, new_values, user_id, created_at
        ) VALUES (
            TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW),
            current_setting('app.current_user_id', true)::UUID, NOW()
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO ptaVOID_audit_logs (
            table_name, record_id, action, new_values, user_id, created_at
        ) VALUES (
            TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW),
            current_setting('app.current_user_id', true)::UUID, NOW()
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

## Database Triggers

### 1. PTA Payment Status Update Trigger
```sql
CREATE TRIGGER trigger_update_pta_status
    AFTER INSERT ON ptaVOID_income_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_student_pta_status();
```

### 2. Audit Triggers
```sql
-- Income transactions audit
CREATE TRIGGER audit_ptaVOID_income_transactions
    AFTER INSERT OR UPDATE OR DELETE ON ptaVOID_income_transactions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Expense transactions audit
CREATE TRIGGER audit_ptaVOID_expense_transactions
    AFTER INSERT OR UPDATE OR DELETE ON ptaVOID_expense_transactions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Parent audit
CREATE TRIGGER audit_ptaVOID_parents
    AFTER INSERT OR UPDATE OR DELETE ON ptaVOID_parents
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Student audit
CREATE TRIGGER audit_ptaVOID_students
    AFTER INSERT OR UPDATE OR DELETE ON ptaVOID_students
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

## Row Level Security (RLS) Policies

### Users Table Policies
```sql
ALTER TABLE ptaVOID_users ENABLE ROW LEVEL SECURITY;

-- Users can view their own record
CREATE POLICY "Users can view own record" ON ptaVOID_users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON ptaVOID_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ptaVOID_users 
            WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );
```

### Parents Table Policies
```sql
ALTER TABLE ptaVOID_parents ENABLE ROW LEVEL SECURITY;

-- Parents can view their own record
CREATE POLICY "Parents can view own record" ON ptaVOID_parents + Prisma
CREATE POLICY "Teachers can view their students' parents" ON ptaVOID_parents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ptaVOI + Prismans sec ON s.section_id = sec.id
            JOIN ptaVOID_teachers t ON sec.teacher_id = t.id
            WHERE s.parent_id = ptaVOID_parents.id
            AND t.user_id::text = auth.uid()::text
        )
    );

-- Treasurers and admins can view all parents
CREATE POLICY "Treasurers and admins can view all parents" ON ptaVOID_parents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ptaVOID_users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('admin', 'treasurer', 'principal')
        )
    );
```

### Students Table Policies
```sql
ALTER TABLE ptaVOID_students ENABLE ROW LEVEL SECURITY;

-- Parents can view their own children
CREATE POLICY "Parents can view own children" ON ptaVOID_students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ptaVOID_parents p
            WHERE p.id = ptaVOID_students.parent_id
            AND p.user_id::text = auth.uid()::text
        )
    );

-- Teachers can view their students
CREATE POLICY "Teachers can view their students" ON ptaVOID_students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ptaVOID_sections sec
            JOIN ptaVOID_teachers t ON sec.teacher_id = t.id
            WHERE sec.id = ptaVOID_students.section_id
            AND t.user_id::text = auth.uid()::text
        )
    );
```

### Transaction Policies
```sql
ALTER TABLE ptaVOID_income_transactions ENABLE ROW LEVEL SECURITY;

-- Parents can view their own transactions
CREATE POLICY "Parents can view own transactions" ON ptaVOID_income_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ptaVOID_parents p
            WHERE p.id = ptaVOID_income_transactions.parent_id
            AND p.user_id::text = auth.uid()::text
        )
    );

-- Staff can view all transactions
CREATE POLICY "Staff can view all transactions" ON ptaVOID_income_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ptaVOID_users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('admin', 'treasurer', 'principal')
        )
    );
```

## Default Data Seeding

### Default Income Categories
```sql
INSERT INTO ptaVOID_income_categories (category_name, description, is_per_family, default_amount) VALUES
('PTA Contribution Fee', 'Annual PTA membership fee per family', true, 250.00),
('SPG Fee', 'Supreme Pupil Government fee per student', false, 50.00),
('School Supplies', 'Additional school supplies fee per student', false, 100.00),
('Field Trip', 'Educational field trip fee per student', false, 200.00),
('Special Projects', 'Special school projects contribution', false, 150.00);
```

### Default Expense Categories
```sql
INSERT INTO ptaVOID_expense_categories (category_name, description, budget_limit) VALUES
('Security Guards', 'Payment for school security personnel', 50000.00),
('Snacks/Refreshments', 'Food and beverages for school events', 20000.00),
('School Supplies', 'Office and classroom supplies', 30000.00),
('Maintenance', 'School facility maintenance and repairs', 40000.00),
('Events/Activities', 'School programs and activities', 25000.00),
('Utilities', 'Additional utility expenses', 15000.00);
```

### Default Grades
```sql
INSERT INTO ptaVOID_grades (grade_name, grade_level) VALUES
('Kindergarten', 0),
('Grade 1', 1),
('Grade 2', 2),
('Grade 3', 3),
('Grade 4', 4),
('Grade 5', 5),
('Grade 6', 6);
```

## Views for Reporting

### Payment Status Summary View
```sql
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
```

### Financial Summary View
```sql
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
```

## Migration Script Order

1. Create all tables in dependency order
2. Create indexes
3. Create functions
4. Create triggers
5. Enable RLS and create policies
6. Create views
7. Insert default data

This schema provides a robust foundation for the PTA Management System with proper relationships, security, and audit capabilities.