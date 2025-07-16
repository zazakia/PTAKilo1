# Type Safety Documentation

## 🎯 Overview

The PTA Management System implements comprehensive TypeScript type safety to prevent runtime errors, improve developer experience, and ensure data integrity. This document outlines the type system architecture, database types, and best practices implemented throughout the application.

## 🏗️ Type System Architecture

### **Type Organization Structure**
```
src/types/
├── database.ts              # Supabase database types
├── auth.ts                  # Authentication types
├── api.ts                   # API response types
└── components.ts            # Component prop types
```

### **Type Import Strategy**
```typescript
// Centralized type imports
import type { Database } from '@/types/database';
import type { SupabaseUser } from '@/types/auth';
import type { ApiResponse } from '@/types/api';
```

## 🗄️ Database Type System

### **File**: [`src/types/database.ts`](../src/types/database.ts)

### **Supabase Database Interface**
```typescript
export interface Database {
  public: {
    Tables: {
      ptaVOID_members: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'admin' | 'treasurer' | 'teacher' | 'parent';
          phone: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          role?: 'admin' | 'treasurer' | 'teacher' | 'parent';
          phone?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'admin' | 'treasurer' | 'teacher' | 'parent';
          phone?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ptaVOID_students: {
        Row: {
          id: string;
          student_id: string;
          full_name: string;
          grade_level: string;
          section: string;
          parent_id: string | null;
          pta_payment_status: 'paid' | 'unpaid';
          pta_payment_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          full_name: string;
          grade_level: string;
          section: string;
          parent_id?: string | null;
          pta_payment_status?: 'paid' | 'unpaid';
          pta_payment_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          full_name?: string;
          grade_level?: string;
          section?: string;
          parent_id?: string | null;
          pta_payment_status?: 'paid' | 'unpaid';
          pta_payment_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ptaVOID_income: {
        Row: {
          id: string;
          description: string;
          amount: number;
          date: string;
          category: string;
          recorded_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          description: string;
          amount: number;
          date: string;
          category: string;
          recorded_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          description?: string;
          amount?: number;
          date?: string;
          category?: string;
          recorded_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      ptaVOID_expenses: {
        Row: {
          id: string;
          description: string;
          amount: number;
          date: string;
          category: string;
          recorded_by: string;
          receipt_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          description: string;
          amount: number;
          date: string;
          category: string;
          recorded_by: string;
          receipt_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          description?: string;
          amount?: number;
          date?: string;
          category?: string;
          recorded_by?: string;
          receipt_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'admin' | 'treasurer' | 'teacher' | 'parent';
      payment_status: 'paid' | 'unpaid';
    };
  };
}
```

### **Type Aliases for Convenience**
```typescript
// Table row types
export type Member = Database['public']['Tables']['ptaVOID_members']['Row'];
export type Student = Database['public']['Tables']['ptaVOID_students']['Row'];
export type Income = Database['public']['Tables']['ptaVOID_income']['Row'];
export type Expense = Database['public']['Tables']['ptaVOID_expenses']['Row'];

// Insert types for creating new records
export type MemberInsert = Database['public']['Tables']['ptaVOID_members']['Insert'];
export type StudentInsert = Database['public']['Tables']['ptaVOID_students']['Insert'];
export type IncomeInsert = Database['public']['Tables']['ptaVOID_income']['Insert'];
export type ExpenseInsert = Database['public']['Tables']['ptaVOID_expenses']['Insert'];

// Update types for modifying existing records
export type MemberUpdate = Database['public']['Tables']['ptaVOID_members']['Update'];
export type StudentUpdate = Database['public']['Tables']['ptaVOID_students']['Update'];
export type IncomeUpdate = Database['public']['Tables']['ptaVOID_income']['Update'];
export type ExpenseUpdate = Database['public']['Tables']['ptaVOID_expenses']['Update'];

// Enum types
export type UserRole = Database['public']['Enums']['user_role'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];
```

## 🔐 Authentication Types

### **File**: [`src/types/auth.ts`](../src/types/auth.ts)

### **Supabase User Types**
```typescript
import type { User } from '@supabase/supabase-js';

// Extended Supabase User type with our custom metadata
export interface SupabaseUser extends User {
  user_metadata: {
    full_name?: string;
    role?: UserRole;
    phone?: string;
    address?: string;
  };
}

// Authentication state
export interface AuthState {
  user: SupabaseUser | null;
  loading: boolean;
  error: string | null;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Registration data
export interface RegistrationData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  address?: string;
}

// Session data
export interface SessionData {
  user: SupabaseUser;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}
```

### **Authentication Context Types**
```typescript
// Auth context interface
export interface AuthContextType {
  user: SupabaseUser | null;
  loading: boolean;
  error: string | null;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (data: RegistrationData) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<RegistrationData>) => Promise<void>;
}

// Auth provider props
export interface AuthProviderProps {
  children: React.ReactNode;
}
```

## 🌐 API Response Types

### **File**: [`src/types/api.ts`](../src/types/api.ts)

### **Generic API Response Structure**
```typescript
// Base API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// Paginated response
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error response
export interface ErrorResponse extends ApiResponse<never> {
  success: false;
  error: string;
  details?: {
    field?: string;
    code?: string;
    message?: string;
  }[];
}
```

### **Specific API Response Types**
```typescript
// Dashboard statistics response
export interface DashboardStatsResponse extends ApiResponse {
  data: {
    totalIncome: number;
    totalExpenses: number;
    totalStudents: number;
    totalMembers: number;
    ptaPaidStudents: number;
    ptaUnpaidStudents: number;
    recentTransactions: Transaction[];
  };
}

// Transaction type for dashboard
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending';
  category: string;
  recorded_by: string;
}

// Member list response
export interface MembersResponse extends PaginatedResponse<Member> {}

// Student list response
export interface StudentsResponse extends PaginatedResponse<Student> {}

// Income list response
export interface IncomeResponse extends PaginatedResponse<Income> {}

// Expense list response
export interface ExpenseResponse extends PaginatedResponse<Expense> {}
```

## 🧩 Component Prop Types

### **File**: [`src/types/components.ts`](../src/types/components.ts)

### **Dashboard Component Types**
```typescript
// Dashboard header props
export interface DashboardHeaderProps {
  user: SupabaseUser | null;
  userRole: UserRole;
}

// Dashboard stats props
export interface DashboardStatsProps {
  totalIncome: number;
  totalExpenses: number;
  totalStudents: number;
  totalParents: number;
  userRole: UserRole;
}

// PTA payment status props
export interface PTAPaymentStatusProps {
  totalStudents: number;
  ptaPaidStudents: number;
  ptaUnpaidStudents: number;
}

// Recent transactions props
export interface RecentTransactionsProps {
  transactions: Transaction[];
  onViewAll?: () => void;
}

// Quick actions props
export interface QuickActionsProps {
  userRole: UserRole;
  onRecordIncome?: () => void;
  onRecordExpense?: () => void;
  onAddParent?: () => void;
  onAddStudent?: () => void;
  onViewReports?: () => void;
  onViewStudents?: () => void;
}
```

### **Common Component Types**
```typescript
// Loading spinner props
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

// Error boundary props
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// Error fallback props
export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  errorId: string;
}

// Skeleton component props
export interface SkeletonCardProps {
  lines?: number;
  showAvatar?: boolean;
  className?: string;
}

export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

// Page loading wrapper props
export interface PageLoadingWrapperProps {
  loading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  className?: string;
}
```

## 🔧 Utility Types

### **Generic Utility Types**
```typescript
// Make all properties optional
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Make all properties required
export type Required<T> = {
  [P in keyof T]-?: T[P];
};

// Pick specific properties
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Omit specific properties
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Extract keys that have specific value type
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];
```

### **Application-Specific Utility Types**
```typescript
// Form data types
export type FormData<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;

// API request types
export type CreateRequest<T> = FormData<T>;
export type UpdateRequest<T> = Partial<FormData<T>> & { id: string };

// Filter types
export type FilterOptions<T> = {
  [K in keyof T]?: T[K] | T[K][];
};

// Sort options
export type SortOptions<T> = {
  field: keyof T;
  direction: 'asc' | 'desc';
};

// Search options
export interface SearchOptions {
  query: string;
  fields: string[];
  limit?: number;
  offset?: number;
}
```

## 🛡️ Type Guards and Validation

### **Type Guard Functions**
```typescript
// User role type guard
export function isValidUserRole(role: string): role is UserRole {
  return ['admin', 'treasurer', 'teacher', 'parent'].includes(role);
}

// Payment status type guard
export function isValidPaymentStatus(status: string): status is PaymentStatus {
  return ['paid', 'unpaid'].includes(status);
}

// Supabase user type guard
export function isSupabaseUser(user: any): user is SupabaseUser {
  return (
    user &&
    typeof user === 'object' &&
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    user.user_metadata &&
    typeof user.user_metadata === 'object'
  );
}

// API response type guard
export function isApiResponse<T>(response: any): response is ApiResponse<T> {
  return (
    response &&
    typeof response === 'object' &&
    typeof response.success === 'boolean' &&
    typeof response.timestamp === 'string'
  );
}

// Error response type guard
export function isErrorResponse(response: any): response is ErrorResponse {
  return (
    isApiResponse(response) &&
    response.success === false &&
    typeof response.error === 'string'
  );
}
```

### **Runtime Type Validation with Zod**
```typescript
import { z } from 'zod';

// User role schema
export const UserRoleSchema = z.enum(['admin', 'treasurer', 'teacher', 'parent']);

// Member schema
export const MemberSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().nullable(),
  role: UserRoleSchema,
  phone: z.string().nullable(),
  address: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Student schema
export const StudentSchema = z.object({
  id: z.string().uuid(),
  student_id: z.string().min(1),
  full_name: z.string().min(1),
  grade_level: z.string().min(1),
  section: z.string().min(1),
  parent_id: z.string().uuid().nullable(),
  pta_payment_status: z.enum(['paid', 'unpaid']),
  pta_payment_date: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// API response schema
export const ApiResponseSchema = <T>(dataSchema: z.ZodSchema<T>) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
    timestamp: z.string().datetime(),
  });

// Usage in API validation
export function validateApiResponse<T>(
  response: unknown,
  dataSchema: z.ZodSchema<T>
): ApiResponse<T> {
  const schema = ApiResponseSchema(dataSchema);
  return schema.parse(response);
}
```

## 🔍 Type-Safe API Layer

### **Typed API Client**
```typescript
// Type-safe API client implementation
export class TypedApiClient {
  // Generic request method with type safety
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!isApiResponse<T>(data)) {
        throw new Error('Invalid API response format');
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Type-safe member operations
  async getMembers(): Promise<ApiResponse<Member[]>> {
    return this.request<Member[]>('/api/members');
  }

  async getMember(id: string): Promise<ApiResponse<Member>> {
    return this.request<Member>(`/api/members/${id}`);
  }

  async createMember(data: MemberInsert): Promise<ApiResponse<Member>> {
    return this.request<Member>('/api/members', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMember(id: string, data: MemberUpdate): Promise<ApiResponse<Member>> {
    return this.request<Member>(`/api/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMember(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/members/${id}`, {
      method: 'DELETE',
    });
  }
}

// Usage with full type safety
const api = new TypedApiClient();

const handleGetMembers = async () => {
  const response = await api.getMembers();
  
  if (response.success && response.data) {
    // response.data is typed as Member[]
    response.data.forEach(member => {
      console.log(member.full_name); // TypeScript knows this exists
      console.log(member.role); // TypeScript knows this is UserRole
    });
  } else {
    console.error(response.error); // TypeScript knows this might exist
  }
};
```

### **Type-Safe Database Operations**
```typescript
// Type-safe Supabase operations
export class TypedSupabaseClient {
  constructor(private supabase: SupabaseClient<Database>) {}

  // Type-safe member operations
  async getMembers(): Promise<ApiResponse<Member[]>> {
    try {
      const { data, error } = await this.supabase
        .from('ptaVOID_members')
        .select('*');

      if (error) {
        return {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: data as Member[], // Type assertion with validation
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async createMember(memberData: MemberInsert): Promise<ApiResponse<Member>> {
    try {
      const { data, error } = await this.supabase
        .from('ptaVOID_members')
        .insert(memberData)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: data as Member,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
```

## 🧪 Type-Safe Testing

### **Type-Safe Test Utilities**
```typescript
// Type-safe test data factories
export const createMockMember = (overrides: Partial<Member> = {}): Member => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'parent',
  phone: '+639123456789',
  address: '123 Test Street',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockStudent = (overrides: Partial<Student> = {}): Student => ({
  id: '123e4567-e89b-12d3-a456-426614174001',
  student_id: 'STU001',
  full_name: 'Test Student',
  grade_level: 'Grade 1',
  section: 'A',
  parent_id: '123e4567-e89b-12d3-a456-426614174000',
  pta_payment_status: 'unpaid',
  pta_payment_date: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// Type-safe API response mocks
export const createMockApiResponse = <T>(
  data: T,
  overrides: Partial<ApiResponse<T>> = {}
): ApiResponse<T> => ({
  success: true,
  data,
  timestamp: new Date().toISOString(),
  ...overrides,
});

export const createMockErrorResponse = (
  error: string,
  overrides: Partial<ErrorResponse> = {}
): ErrorResponse => ({
  success: false,
  error,
  timestamp: new Date().toISOString(),
  ...overrides,
});
```

### **Type-Safe Component Testing**
```typescript
// Type-safe component test helpers
export const renderWithTypes = <P extends object>(
  Component: React.ComponentType<P>,
  props: P
) => {
  return render(<Component {...props} />);
};

// Usage in tests
describe('DashboardStats', () => {
  const mockProps: DashboardStatsProps = {
    totalIncome: 100000,
    totalExpenses: 50000,
    totalStudents: 500,
    totalParents: 300,
    userRole: 'admin',
  };

  test('renders with correct props', () => {
    renderWithTypes(DashboardStats, mockProps);
    
    expect(screen.getByText('₱100,000.00')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  test('filters stats based on user role', () => {
    const parentProps: DashboardStatsProps = {
      ...mockProps,
      userRole: 'parent',
    };

    renderWithTypes(DashboardStats, parentProps);
    
    expect(screen.getByText('Total Students')).toBeInTheDocument();
    expect(screen.queryByText('Total Income')).not.toBeInTheDocument();
  });
});
```

## 📋 Type Safety Best Practices

### **1. Strict TypeScript Configuration**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### **2. Type-First Development**
```typescript
// Define types before implementation
interface UserFormData {
  email: string;
  full_name: string;
  role: UserRole;
}

// Then implement with type safety
const handleSubmit = (data: UserFormData) => {
  // TypeScript ensures data has correct shape
  api.createUser(data);
};
```

### **3. Avoid `any` Type**
```typescript
// Bad
const handleData = (data: any) => {
  return data.someProperty;
};

// Good
interface DataType {
  someProperty: string;
}

const handleData = (data: DataType) => {
  return data.someProperty;
};
```

### **4. Use Type Assertions Carefully**
```typescript
// Bad - unsafe type assertion
const user = response.data as User;

// Good - with type guard
const user = isUser(response.data) ? response.data : null;

// Better - with validation
const user = UserSchema.parse(response.data);
```

### **5. Leverage Union Types**
```typescript
// Use union types for controlled values
type Theme = 'light' | 'dark';
type Status = 'loading' | 'success' | 'error';

// Instead of strings
interface ComponentProps {
  theme: Theme; // Not string
  status: Status; // Not string
}
```

### **6. Generic Type Constraints**
```typescript
// Constrain generic types
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
}

// Usage
const memberRepo: Repository<Member> = new MemberRepository();
```

---

This comprehensive type safety system ensures runtime reliability, excellent developer experience, and maintainable code throughout the PTA Management System.