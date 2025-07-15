import { supabase } from './supabase';
import { Database } from '@/types/database';

// API Response wrapper
export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// API Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Request interceptor with retry logic
export async function apiRequest<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  options: {
    retries?: number;
    retryDelay?: number;
    timeout?: number;
    context?: string;
  } = {}
): Promise<ApiResponse<T>> {
  const { retries = 3, retryDelay = 1000, timeout = 10000, context = 'API Request' } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Add timeout wrapper
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      );

      const result = await Promise.race([operation(), timeoutPromise]) as { data: T | null; error: any };

      if (result.error) {
        throw new ApiError(
          result.error.message || 'Unknown error',
          result.error.code,
          result.error.status,
          result.error
        );
      }

      return {
        data: result.data,
        error: null,
        success: true,
      };
    } catch (error) {
      lastError = error;
      
      // Log error for debugging
      console.error(`${context} - Attempt ${attempt + 1}/${retries + 1} failed:`, error);

      // Don't retry on certain errors
      if (error instanceof ApiError) {
        if (error.status === 401 || error.status === 403 || error.status === 404) {
          break;
        }
      }

      // Wait before retry (except on last attempt)
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }
  }

  // All retries failed
  const errorMessage = lastError instanceof Error ? lastError.message : 'Unknown error occurred';
  
  return {
    data: null,
    error: errorMessage,
    success: false,
  };
}

// Typed database operations
export const api = {
  // Users
  users: {
    async getAll() {
      return apiRequest(
        async () => await supabase.from('ptaVOID_users').select('*'),
        { context: 'Get All Users' }
      );
    },

    async getById(id: string) {
      return apiRequest(
        async () => await supabase.from('ptaVOID_users').select('*').eq('id', id).single(),
        { context: 'Get User By ID' }
      );
    },

    async create(user: Database['public']['Tables']['ptaVOID_users']['Insert']) {
      return apiRequest(
        async () => await supabase.from('ptaVOID_users').insert(user).select().single(),
        { context: 'Create User' }
      );
    },

    async update(id: string, updates: Database['public']['Tables']['ptaVOID_users']['Update']) {
      return apiRequest(
        async () => await supabase.from('ptaVOID_users').update(updates).eq('id', id).select().single(),
        { context: 'Update User' }
      );
    },

    async delete(id: string) {
      return apiRequest(
        async () => await supabase.from('ptaVOID_users').delete().eq('id', id),
        { context: 'Delete User' }
      );
    },
  },

  // Parents
  parents: {
    async getAll() {
      return apiRequest(
        async () => await supabase.from('ptaVOID_parents').select('*, user:ptaVOID_users(*)').order('created_at', { ascending: false }),
        { context: 'Get All Parents' }
      );
    },

    async getById(id: string) {
      return apiRequest(
        async () => await supabase.from('ptaVOID_parents').select('*, user:ptaVOID_users(*), students:ptaVOID_students(*)').eq('id', id).single(),
        { context: 'Get Parent By ID' }
      );
    },

    async create(parent: Database['public']['Tables']['ptaVOID_parents']['Insert']) {
      return apiRequest(
        async () => await supabase.from('ptaVOID_parents').insert(parent).select().single(),
        { context: 'Create Parent' }
      );
    },

    async update(id: string, updates: Database['public']['Tables']['ptaVOID_parents']['Update']) {
      return apiRequest(
        async () => await supabase.from('ptaVOID_parents').update(updates).eq('id', id).select().single(),
        { context: 'Update Parent' }
      );
    },
  },

  // Students
  students: {
    async getAll() {
      return apiRequest(
        async () => await supabase.from('ptaVOID_students').select('*, parent:ptaVOID_parents(*), section:ptaVOID_sections(*, grade:ptaVOID_grades(*))').order('created_at', { ascending: false }),
        { context: 'Get All Students' }
      );
    },

    async getById(id: string) {
      return apiRequest(
        async () => await supabase.from('ptaVOID_students').select('*, parent:ptaVOID_parents(*), section:ptaVOID_sections(*, grade:ptaVOID_grades(*))').eq('id', id).single(),
        { context: 'Get Student By ID' }
      );
    },

    async create(student: Database['public']['Tables']['ptaVOID_students']['Insert']) {
      return apiRequest(
        async () => await supabase.from('ptaVOID_students').insert(student).select().single(),
        { context: 'Create Student' }
      );
    },

    async update(id: string, updates: Database['public']['Tables']['ptaVOID_students']['Update']) {
      return apiRequest(
        async () => await supabase.from('ptaVOID_students').update(updates).eq('id', id).select().single(),
        { context: 'Update Student' }
      );
    },
  },

  // Income Transactions
  income: {
    async getAll() {
      return apiRequest(
        async () => await supabase.from('ptaVOID_income_transactions').select('*, parent:ptaVOID_parents(*), student:ptaVOID_students(*), income_category:ptaVOID_income_categories(*)').order('created_at', { ascending: false }),
        { context: 'Get All Income Transactions' }
      );
    },

    async create(income: Database['public']['Tables']['ptaVOID_income_transactions']['Insert']) {
      return apiRequest(
        async () => await supabase.from('ptaVOID_income_transactions').insert(income).select().single(),
        { context: 'Create Income Transaction' }
      );
    },

    async update(id: string, updates: Database['public']['Tables']['ptaVOID_income_transactions']['Update']) {
      return apiRequest(
        async () => await supabase.from('ptaVOID_income_transactions').update(updates).eq('id', id).select().single(),
        { context: 'Update Income Transaction' }
      );
    },

    async delete(id: string) {
      return apiRequest(
        async () => await supabase.from('ptaVOID_income_transactions').delete().eq('id', id),
        { context: 'Delete Income Transaction' }
      );
    },
  },

  // Expense Transactions
  expenses: {
    async getAll() {
      return apiRequest(
        async () => await supabase.from('ptaVOID_expense_transactions').select('*, expense_category:ptaVOID_expense_categories(*), approved_by_user:ptaVOID_users(*), recorded_by_user:ptaVOID_users(*)').order('created_at', { ascending: false }),
        { context: 'Get All Expense Transactions' }
      );
    },

    async create(expense: Database['public']['Tables']['ptaVOID_expense_transactions']['Insert']) {
      return apiRequest(
        async () => await supabase.from('ptaVOID_expense_transactions').insert(expense).select().single(),
        { context: 'Create Expense Transaction' }
      );
    },

    async update(id: string, updates: Database['public']['Tables']['ptaVOID_expense_transactions']['Update']) {
      return apiRequest(
        async () => await supabase.from('ptaVOID_expense_transactions').update(updates).eq('id', id).select().single(),
        { context: 'Update Expense Transaction' }
      );
    },

    async delete(id: string) {
      return apiRequest(
        async () => await supabase.from('ptaVOID_expense_transactions').delete().eq('id', id),
        { context: 'Delete Expense Transaction' }
      );
    },
  },

  // Categories
  categories: {
    async getIncomeCategories() {
      return apiRequest(
        async () => await supabase.from('ptaVOID_income_categories').select('*').eq('is_active', true).order('category_name'),
        { context: 'Get Income Categories' }
      );
    },

    async getExpenseCategories() {
      return apiRequest(
        async () => await supabase.from('ptaVOID_expense_categories').select('*').eq('is_active', true).order('category_name'),
        { context: 'Get Expense Categories' }
      );
    },
  },

  // Dashboard stats
  dashboard: {
    async getStats() {
      return apiRequest(
        async () => {
          const [usersResult, studentsResult, incomeResult, expenseResult] = await Promise.all([
            supabase.from('ptaVOID_users').select('id', { count: 'exact' }),
            supabase.from('ptaVOID_students').select('id', { count: 'exact' }),
            supabase.from('ptaVOID_income_transactions').select('amount'),
            supabase.from('ptaVOID_expense_transactions').select('amount')
          ]);

          if (usersResult.error || studentsResult.error || incomeResult.error || expenseResult.error) {
            throw new Error('Failed to fetch dashboard stats');
          }

          const totalIncome = incomeResult.data?.reduce((sum, record) => sum + record.amount, 0) || 0;
          const totalExpenses = expenseResult.data?.reduce((sum, record) => sum + record.amount, 0) || 0;
          const balance = totalIncome - totalExpenses;

          return {
            data: {
              totalMembers: usersResult.count || 0,
              totalStudents: studentsResult.count || 0,
              totalIncome,
              totalExpenses,
              currentBalance: balance,
            },
            error: null
          };
        },
        { context: 'Get Dashboard Stats' }
      );
    },

    async getPaymentSummary() {
      return apiRequest(
        async () => await supabase.from('ptaVOID_payment_status_summary').select('*'),
        { context: 'Get Payment Summary' }
      );
    },

    async getFinancialSummary() {
      return apiRequest(
        async () => await supabase.from('ptaVOID_financial_summary').select('*'),
        { context: 'Get Financial Summary' }
      );
    },
  },
};

// Global error handler
export function handleApiError(error: any, context?: string) {
  console.error(`API Error${context ? ` in ${context}` : ''}:`, error);
  
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}