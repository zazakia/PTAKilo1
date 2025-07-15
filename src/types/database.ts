export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'principal' | 'teacher' | 'treasurer' | 'parent';
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Grade {
  id: string;
  grade_name: string;
  grade_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  user_id: string;
  employee_id?: string;
  department?: string;
  position?: string;
  hire_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Section {
  id: string;
  section_name: string;
  grade_id: string;
  teacher_id?: string;
  school_year: string;
  max_students: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  grade?: Grade;
  teacher?: Teacher;
  students?: Student[];
}

export interface Parent {
  id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  contact_number?: string;
  email?: string;
  address?: string;
  occupation?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  relationship_to_student: string;
  pta_contribution_paid: boolean;
  pta_contribution_date?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  students?: Student[];
}

export interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  birth_date?: string;
  gender?: 'Male' | 'Female';
  section_id?: string;
  parent_id: string;
  enrollment_date: string;
  is_active: boolean;
  pta_contribution_paid: boolean;
  created_at: string;
  updated_at: string;
  section?: Section;
  parent?: Parent;
}

export interface IncomeCategory {
  id: string;
  category_name: string;
  description?: string;
  is_per_family: boolean;
  default_amount?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCategory {
  id: string;
  category_name: string;
  description?: string;
  budget_limit?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IncomeTransaction {
  id: string;
  transaction_number: string;
  parent_id: string;
  student_id?: string;
  income_category_id: string;
  amount: number;
  payment_method: 'Cash' | 'Check' | 'Bank Transfer' | 'GCash' | 'PayMaya';
  reference_number?: string;
  notes?: string;
  receipt_issued: boolean;
  recorded_by?: string;
  school_year: string;
  created_at: string;
  updated_at: string;
  parent?: Parent;
  student?: Student;
  income_category?: IncomeCategory;
  recorded_by_user?: User;
  receipts?: Receipt[];
}

export interface ExpenseTransaction {
  id: string;
  transaction_number: string;
  expense_category_id: string;
  amount: number;
  description: string;
  vendor_name?: string;
  payment_method: 'Cash' | 'Check' | 'Bank Transfer';
  reference_number?: string;
  approved_by?: string;
  recorded_by?: string;
  expense_date: string;
  school_year: string;
  created_at: string;
  updated_at: string;
  expense_category?: ExpenseCategory;
  approved_by_user?: User;
  recorded_by_user?: User;
  receipts?: Receipt[];
}

export interface Receipt {
  id: string;
  income_transaction_id?: string;
  expense_transaction_id?: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  uploaded_by?: string;
  created_at: string;
  uploaded_by_user?: User;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: User;
}

// Database table names with ptaVOID_ prefix
export const TABLE_NAMES = {
  USERS: 'ptaVOID_users',
  GRADES: 'ptaVOID_grades',
  TEACHERS: 'ptaVOID_teachers',
  SECTIONS: 'ptaVOID_sections',
  PARENTS: 'ptaVOID_parents',
  STUDENTS: 'ptaVOID_students',
  INCOME_CATEGORIES: 'ptaVOID_income_categories',
  EXPENSE_CATEGORIES: 'ptaVOID_expense_categories',
  INCOME_TRANSACTIONS: 'ptaVOID_income_transactions',
  EXPENSE_TRANSACTIONS: 'ptaVOID_expense_transactions',
  RECEIPTS: 'ptaVOID_receipts',
  AUDIT_LOGS: 'ptaVOID_audit_logs',
} as const;

// View names
export const VIEW_NAMES = {
  PAYMENT_STATUS_SUMMARY: 'ptaVOID_payment_status_summary',
  FINANCIAL_SUMMARY: 'ptaVOID_financial_summary',
} as const;

// Supabase Database type definition
export interface Database {
  public: {
    Tables: {
      ptaVOID_users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      ptaVOID_grades: {
        Row: Grade;
        Insert: Omit<Grade, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Grade, 'id' | 'created_at' | 'updated_at'>>;
      };
      ptaVOID_teachers: {
        Row: Teacher;
        Insert: Omit<Teacher, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Teacher, 'id' | 'created_at' | 'updated_at'>>;
      };
      ptaVOID_sections: {
        Row: Section;
        Insert: Omit<Section, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Section, 'id' | 'created_at' | 'updated_at'>>;
      };
      ptaVOID_parents: {
        Row: Parent;
        Insert: Omit<Parent, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Parent, 'id' | 'created_at' | 'updated_at'>>;
      };
      ptaVOID_students: {
        Row: Student;
        Insert: Omit<Student, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Student, 'id' | 'created_at' | 'updated_at'>>;
      };
      ptaVOID_income_categories: {
        Row: IncomeCategory;
        Insert: Omit<IncomeCategory, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<IncomeCategory, 'id' | 'created_at' | 'updated_at'>>;
      };
      ptaVOID_expense_categories: {
        Row: ExpenseCategory;
        Insert: Omit<ExpenseCategory, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ExpenseCategory, 'id' | 'created_at' | 'updated_at'>>;
      };
      ptaVOID_income_transactions: {
        Row: IncomeTransaction;
        Insert: Omit<IncomeTransaction, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<IncomeTransaction, 'id' | 'created_at' | 'updated_at'>>;
      };
      ptaVOID_expense_transactions: {
        Row: ExpenseTransaction;
        Insert: Omit<ExpenseTransaction, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ExpenseTransaction, 'id' | 'created_at' | 'updated_at'>>;
      };
      ptaVOID_receipts: {
        Row: Receipt;
        Insert: Omit<Receipt, 'id' | 'created_at'>;
        Update: Partial<Omit<Receipt, 'id' | 'created_at'>>;
      };
      ptaVOID_audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'created_at'>;
        Update: Partial<Omit<AuditLog, 'id' | 'created_at'>>;
      };
    };
    Views: {
      ptaVOID_payment_status_summary: {
        Row: {
          grade_name: string;
          section_name: string;
          total_students: number;
          paid_students: number;
          unpaid_students: number;
          payment_percentage: number;
        };
      };
      ptaVOID_financial_summary: {
        Row: {
          school_year: string;
          transaction_type: 'Income' | 'Expense';
          category_name: string;
          transaction_count: number;
          total_amount: number;
        };
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'admin' | 'principal' | 'teacher' | 'treasurer' | 'parent';
      payment_method: 'Cash' | 'Check' | 'Bank Transfer' | 'GCash' | 'PayMaya';
      gender: 'Male' | 'Female';
      audit_action: 'INSERT' | 'UPDATE' | 'DELETE';
    };
  };
}