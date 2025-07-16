# API Layer Documentation

## 🔌 Overview

The PTA Management System implements a centralized API layer that provides a consistent, type-safe, and resilient interface to the Supabase database. This layer handles all data operations, error management, and request optimization.

## 🏗️ API Architecture

### **File Structure**
```
src/lib/
├── api.ts          # Main API layer
├── supabase.ts     # Database client configuration
└── config.ts       # Environment configuration
```

### **Core Components**
- **API Request Handler**: Centralized request processing with retry logic
- **Error Management**: Comprehensive error handling and classification
- **Type Safety**: Full TypeScript integration with database types
- **Response Standardization**: Consistent API response format

## 🛠️ API Request Handler

### **Core Function**
**File**: [`src/lib/api.ts`](../src/lib/api.ts)

```typescript
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
```

### **Features**
- **Retry Logic**: Exponential backoff for transient failures
- **Timeout Handling**: Prevents hanging requests
- **Error Classification**: Smart retry decisions based on error type
- **Context Logging**: Detailed debugging information
- **Type Safety**: Generic type support for responses

## 📊 Response Format

### **Standard API Response**
```typescript
export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  success: boolean;
}
```

### **Usage Examples**
```typescript
// Successful response
{
  data: { id: '123', name: 'John Doe' },
  error: null,
  success: true
}

// Error response
{
  data: null,
  error: 'User not found',
  success: false
}
```

## 🗄️ Database Operations

### **Users API**
```typescript
export const api = {
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
  }
};
```

### **Parents API**
```typescript
parents: {
  async getAll() {
    return apiRequest(
      async () => await supabase.from('ptaVOID_parents')
        .select('*, user:ptaVOID_users(*)').order('created_at', { ascending: false }),
      { context: 'Get All Parents' }
    );
  },

  async getById(id: string) {
    return apiRequest(
      async () => await supabase.from('ptaVOID_parents')
        .select('*, user:ptaVOID_users(*), students:ptaVOID_students(*)')
        .eq('id', id).single(),
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
}
```

### **Students API**
```typescript
students: {
  async getAll() {
    return apiRequest(
      async () => await supabase.from('ptaVOID_students')
        .select('*, parent:ptaVOID_parents(*), section:ptaVOID_sections(*, grade:ptaVOID_grades(*))')
        .order('created_at', { ascending: false }),
      { context: 'Get All Students' }
    );
  },

  async getById(id: string) {
    return apiRequest(
      async () => await supabase.from('ptaVOID_students')
        .select('*, parent:ptaVOID_parents(*), section:ptaVOID_sections(*, grade:ptaVOID_grades(*))')
        .eq('id', id).single(),
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
}
```

## 💰 Financial Operations

### **Income Transactions API**
```typescript
income: {
  async getAll() {
    return apiRequest(
      async () => await supabase.from('ptaVOID_income_transactions')
        .select('*, parent:ptaVOID_parents(*), student:ptaVOID_students(*), income_category:ptaVOID_income_categories(*)')
        .order('created_at', { ascending: false }),
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
}
```

### **Expense Transactions API**
```typescript
expenses: {
  async getAll() {
    return apiRequest(
      async () => await supabase.from('ptaVOID_expense_transactions')
        .select('*, expense_category:ptaVOID_expense_categories(*), approved_by_user:ptaVOID_users(*), recorded_by_user:ptaVOID_users(*)')
        .order('created_at', { ascending: false }),
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
}
```

## 📈 Dashboard API

### **Dashboard Statistics**
```typescript
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
}
```

## 🏷️ Categories API

### **Income and Expense Categories**
```typescript
categories: {
  async getIncomeCategories() {
    return apiRequest(
      async () => await supabase.from('ptaVOID_income_categories')
        .select('*').eq('is_active', true).order('category_name'),
      { context: 'Get Income Categories' }
    );
  },

  async getExpenseCategories() {
    return apiRequest(
      async () => await supabase.from('ptaVOID_expense_categories')
        .select('*').eq('is_active', true).order('category_name'),
      { context: 'Get Expense Categories' }
    );
  },
}
```

## 🚨 Error Handling

### **API Error Class**
```typescript
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
```

### **Global Error Handler**
```typescript
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
```

## 🔧 Usage Examples

### **Basic Usage**
```typescript
// In a React component
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.users.getAll();
      if (!response.success) {
        throw new Error(response.error);
      }

      setUsers(response.data);
    } catch (error) {
      setError(handleApiError(error, 'Load Users'));
    } finally {
      setLoading(false);
    }
  };

  loadUsers();
}, []);
```

### **Create Operation**
```typescript
const handleCreateUser = async (userData) => {
  try {
    const response = await api.users.create(userData);
    if (!response.success) {
      throw new Error(response.error);
    }

    // Success - update UI
    setUsers(prev => [...prev, response.data]);
    showSuccessMessage('User created successfully');
  } catch (error) {
    showErrorMessage(handleApiError(error, 'Create User'));
  }
};
```

### **Update Operation**
```typescript
const handleUpdateUser = async (id, updates) => {
  try {
    const response = await api.users.update(id, updates);
    if (!response.success) {
      throw new Error(response.error);
    }

    // Success - update UI
    setUsers(prev => prev.map(user => 
      user.id === id ? response.data : user
    ));
    showSuccessMessage('User updated successfully');
  } catch (error) {
    showErrorMessage(handleApiError(error, 'Update User'));
  }
};
```

## ⚡ Performance Considerations

### **Request Optimization**
- **Parallel Requests**: Use `Promise.all()` for independent operations
- **Selective Fields**: Use `.select()` to fetch only needed fields
- **Pagination**: Implement pagination for large datasets
- **Caching**: Consider implementing response caching

### **Example: Optimized Dashboard Loading**
```typescript
// Load multiple data sources in parallel
const [usersResult, studentsResult, incomeResult, expenseResult] = await Promise.all([
  supabase.from('ptaVOID_users').select('id', { count: 'exact' }),
  supabase.from('ptaVOID_students').select('id', { count: 'exact' }),
  supabase.from('ptaVOID_income_transactions').select('amount'),
  supabase.from('ptaVOID_expense_transactions').select('amount')
]);
```

## 🧪 Testing

### **API Testing Strategy**
```typescript
// Mock API responses for testing
const mockApiResponse = {
  success: true,
  data: { id: '123', name: 'Test User' },
  error: null
};

// Test error scenarios
const mockErrorResponse = {
  success: false,
  data: null,
  error: 'User not found'
};
```

### **Integration Testing**
```typescript
// Test actual API calls in development
if (process.env.NODE_ENV === 'development') {
  // Run API integration tests
  await testApiEndpoints();
}
```

## 📋 Best Practices

### **API Usage Guidelines**
1. **Always handle errors**: Check `response.success` before using data
2. **Use TypeScript types**: Leverage database types for type safety
3. **Provide context**: Include meaningful context in API calls
4. **Handle loading states**: Show loading indicators during API calls
5. **Implement retry logic**: Use built-in retry for transient failures
6. **Log errors**: Use proper error logging for debugging
7. **Validate inputs**: Validate data before sending to API
8. **Use consistent patterns**: Follow established patterns for new endpoints

### **Performance Best Practices**
1. **Batch operations**: Combine multiple operations when possible
2. **Use selective queries**: Fetch only required fields
3. **Implement pagination**: For large datasets
4. **Cache responses**: Cache frequently accessed data
5. **Optimize queries**: Use database indexes and efficient queries
6. **Monitor performance**: Track API response times
7. **Use parallel requests**: For independent operations
8. **Implement debouncing**: For search and filter operations

---

This API layer provides a robust, type-safe, and performant interface to the PTA Management System's data operations.