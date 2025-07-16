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

// API that works with actual database schema (ptavoid_* tables)
export const api = {
  // Teachers
  teachers: {
    async getAll() {
      return apiRequest(
        async () => await supabase
          .from('ptavoid_teachers')
          .select(`
            *,
            user:ptavoid_users(*)
          `)
          .order('created_at', { ascending: false }),
        { context: 'Get All Teachers' }
      );
    },

    async getById(id: string) {
      return apiRequest(
        async () => await supabase
          .from('ptavoid_teachers')
          .select(`
            *,
            user:ptavoid_users(*)
          `)
          .eq('id', id)
          .single(),
        { context: 'Get Teacher By ID' }
      );
    },

    async create(teacher: any) {
      return apiRequest(
        async () => await supabase.from('ptavoid_teachers').insert(teacher).select().single(),
        { context: 'Create Teacher' }
      );
    },

    async update(id: string, updates: any) {
      return apiRequest(
        async () => await supabase.from('ptavoid_teachers').update(updates).eq('id', id).select().single(),
        { context: 'Update Teacher' }
      );
    },

    async delete(id: string) {
      return apiRequest(
        async () => await supabase.from('ptavoid_teachers').delete().eq('id', id),
        { context: 'Delete Teacher' }
      );
    },

    async getByUserId(userId: string) {
      return apiRequest(
        async () => await supabase
          .from('ptavoid_teachers')
          .select(`
            *,
            user:ptavoid_users(*)
          `)
          .eq('user_id', userId)
          .single(),
        { context: 'Get Teacher By User ID' }
      );
    },
  },

  // Members (Users)
  members: {
    async getAll() {
      return apiRequest(
        async () => await supabase.from('ptavoid_users').select('*').order('created_at', { ascending: false }),
        { context: 'Get All Members' }
      );
    },

    async getById(id: string) {
      return apiRequest(
        async () => await supabase.from('ptavoid_users').select('*').eq('id', id).single(),
        { context: 'Get Member By ID' }
      );
    },

    async create(member: any) {
      return apiRequest(
        async () => await supabase.from('ptavoid_users').insert(member).select().single(),
        { context: 'Create Member' }
      );
    },

    async update(id: string, updates: any) {
      return apiRequest(
        async () => await supabase.from('ptavoid_users').update(updates).eq('id', id).select().single(),
        { context: 'Update Member' }
      );
    },

    async delete(id: string) {
      return apiRequest(
        async () => await supabase.from('ptavoid_users').delete().eq('id', id),
        { context: 'Delete Member' }
      );
    },
  },

  // Students
  students: {
    async getAll() {
      return apiRequest(
        async () => await supabase.from('ptavoid_students').select('*').order('created_at', { ascending: false }),
        { context: 'Get All Students' }
      );
    },

    async getById(id: string) {
      return apiRequest(
        async () => await supabase.from('ptavoid_students').select('*').eq('id', id).single(),
        { context: 'Get Student By ID' }
      );
    },

    async create(student: any) {
      return apiRequest(
        async () => await supabase.from('ptavoid_students').insert(student).select().single(),
        { context: 'Create Student' }
      );
    },

    async update(id: string, updates: any) {
      return apiRequest(
        async () => await supabase.from('ptavoid_students').update(updates).eq('id', id).select().single(),
        { context: 'Update Student' }
      );
    },
  },

  // Income transactions
  income: {
    async getAll() {
      return apiRequest(
        async () => await supabase.from('ptavoid_income_transactions').select('*').order('created_at', { ascending: false }),
        { context: 'Get All Income Transactions' }
      );
    },

    async create(income: any) {
      return apiRequest(
        async () => await supabase.from('ptavoid_income_transactions').insert(income).select().single(),
        { context: 'Create Income Transaction' }
      );
    },
  },

  // Expense transactions
  expenses: {
    async getAll() {
      return apiRequest(
        async () => await supabase.from('ptavoid_expense_transactions').select('*').order('created_at', { ascending: false }),
        { context: 'Get All Expense Transactions' }
      );
    },

    async create(expense: any) {
      return apiRequest(
        async () => await supabase.from('ptavoid_expense_transactions').insert(expense).select().single(),
        { context: 'Create Expense Transaction' }
      );
    },
  },

  // Dashboard stats - using correct table names
  dashboard: {
    async getStats() {
      return apiRequest(
        async () => {
          try {
            // Query actual tables with correct names
            const [usersResult, studentsResult, incomeResult, expenseResult] = await Promise.all([
              supabase.from('ptavoid_users').select('id', { count: 'exact' }),
              supabase.from('ptavoid_students').select('*'),
              supabase.from('ptavoid_income_transactions').select('amount'),
              supabase.from('ptavoid_expense_transactions').select('amount')
            ]);

            // Check for errors
            if (usersResult.error) {
              console.error('Users query error:', usersResult.error);
              throw new Error(`Users query failed: ${usersResult.error.message}`);
            }

            if (studentsResult.error) {
              console.error('Students query error:', studentsResult.error);
              throw new Error(`Students query failed: ${studentsResult.error.message}`);
            }

            // Calculate totals
            const totalIncome = incomeResult.data?.reduce((sum, record) => sum + (record.amount || 0), 0) || 0;
            const totalExpenses = expenseResult.data?.reduce((sum, record) => sum + (record.amount || 0), 0) || 0;

            // Calculate student payment stats
            let ptaPaidStudents = 0;
            let ptaUnpaidStudents = 0;
            
            if (studentsResult.data) {
              studentsResult.data.forEach(student => {
                if (student.pta_contribution_paid === true) {
                  ptaPaidStudents++;
                } else {
                  ptaUnpaidStudents++;
                }
              });
            }

            // Get recent transactions
            const [recentIncomeResult, recentExpenseResult] = await Promise.all([
              supabase.from('ptavoid_income_transactions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(3),
              supabase.from('ptavoid_expense_transactions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(3)
            ]);

            // Define transaction type
            interface DashboardTransaction {
              id: string;
              type: 'income' | 'expense';
              description: string;
              amount: number;
              date: string;
              status: 'completed' | 'pending';
            }

            // Format recent transactions for dashboard
            const recentTransactions: DashboardTransaction[] = [];
            
            // Add income transactions
            if (recentIncomeResult.data) {
              recentIncomeResult.data.forEach(transaction => {
                recentTransactions.push({
                  id: transaction.id,
                  type: 'income',
                  description: transaction.description || 'Income Transaction',
                  amount: transaction.amount,
                  date: transaction.created_at,
                  status: 'completed'
                });
              });
            }

            // Add expense transactions
            if (recentExpenseResult.data) {
              recentExpenseResult.data.forEach(transaction => {
                recentTransactions.push({
                  id: transaction.id,
                  type: 'expense',
                  description: transaction.description || 'Expense Transaction',
                  amount: transaction.amount,
                  date: transaction.created_at,
                  status: 'completed'
                });
              });
            }

            // Sort by date and take top 5
            recentTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const topRecentTransactions = recentTransactions.slice(0, 5);

            return {
              data: {
                totalIncome,
                totalExpenses,
                totalStudents: studentsResult.count || 0,
                totalParents: Math.floor((studentsResult.count || 0) * 0.8), // Estimate
                totalMembers: usersResult.count || 0,
                ptaPaidStudents,
                ptaUnpaidStudents,
                recentTransactions: topRecentTransactions,
                currentBalance: totalIncome - totalExpenses,
              },
              error: null
            };
          } catch (error) {
            console.error('Dashboard stats error:', error);
            throw new Error('Failed to fetch dashboard stats');
          }
        },
        { context: 'Get Dashboard Stats' }
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