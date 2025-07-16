# Error Handling Strategy

## 🚨 Overview

The PTA Management System implements a comprehensive, multi-layered error handling strategy that ensures system resilience, user experience, and debugging capabilities.

## 🏗️ Error Handling Architecture

### **Error Handling Layers**

```
┌─────────────────────────────────────┐
│           User Interface            │ ← User-friendly error messages
├─────────────────────────────────────┤
│         Error Boundaries            │ ← React error catching
├─────────────────────────────────────┤
│          Component Layer            │ ← Component-level error handling
├─────────────────────────────────────┤
│            API Layer                │ ← Centralized API error management
├─────────────────────────────────────┤
│          Network Layer              │ ← Retry logic and timeouts
├─────────────────────────────────────┤
│         Database Layer              │ ← Supabase error handling
└─────────────────────────────────────┘
```

## 🛡️ Error Boundary Implementation

### **Global Error Boundary**
**File**: [`src/components/common/ErrorBoundary.tsx`](../src/components/common/ErrorBoundary.tsx)

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.props.onError?.(error, errorInfo, this.state.errorId);
    }
  }
}
```

### **Error Boundary Features**
- **Development Mode**: Detailed error information with stack traces
- **Production Mode**: User-friendly error messages with error IDs
- **Retry Functionality**: Users can attempt to recover from errors
- **Error Reporting**: Integration hooks for error tracking services
- **Fallback UI**: Graceful degradation when components fail

### **Usage Example**
```typescript
// Root layout with error boundary
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary
          fallback={<ErrorFallback />}
          onError={(error, errorInfo, errorId) => {
            // Report to error tracking service
            reportError(error, errorInfo, errorId);
          }}
        >
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

## 🔌 API Error Handling

### **Centralized API Error Management**
**File**: [`src/lib/api.ts`](../src/lib/api.ts)

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

### **API Error Features**
- **Retry Logic**: Exponential backoff for transient failures
- **Timeout Handling**: Prevents hanging requests
- **Error Classification**: Different handling for different error types
- **Context Logging**: Detailed error context for debugging
- **Typed Responses**: Consistent error response format

## 🔄 Retry Strategy

### **Retry Configuration**
```typescript
const retryConfig = {
  retries: 3,           // Maximum retry attempts
  retryDelay: 1000,     // Initial delay in milliseconds
  timeout: 10000,       // Request timeout
  exponentialBackoff: true  // Exponential delay increase
};

// Retry delays: 1s, 2s, 4s
```

### **Retry Decision Logic**
```typescript
// Don't retry on these errors
const NON_RETRYABLE_ERRORS = [401, 403, 404, 422];

if (error instanceof ApiError) {
  if (NON_RETRYABLE_ERRORS.includes(error.status)) {
    break; // Don't retry
  }
}

// Retry on network errors, timeouts, and 5xx errors
```

## 🎯 Component Error Handling

### **Error State Management**
```typescript
function DashboardPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.dashboard.getStats();
        if (!response.success) {
          throw new Error(response.error || 'Failed to load data');
        }

        setData(response.data);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        setError(handleApiError(error, 'Dashboard'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => window.location.reload()} />;
  }

  // Normal component rendering
}
```

### **Error Display Components**
```typescript
// Page-level error handling
<PageLoading 
  loading={loading}
  error={error}
  retry={() => handleRetry()}
>
  {children}
</PageLoading>

// Component-level error display
if (error) {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Something went wrong
        </h3>
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <button onClick={retry} className="btn-primary">
          Try Again
        </button>
      </div>
    </div>
  );
}
```

## 🔍 Error Logging and Monitoring

### **Development Logging**
```typescript
// Detailed logging in development
if (process.env.NODE_ENV === 'development') {
  console.group(`🚨 ${context} Error`);
  console.error('Error:', error);
  console.error('Stack:', error.stack);
  console.error('Context:', { attempt, retries, options });
  console.groupEnd();
}
```

### **Production Error Reporting**
```typescript
// Error reporting service integration
export function reportError(error: Error, errorInfo?: any, errorId?: string) {
  if (process.env.NODE_ENV === 'production') {
    // Send to error tracking service (e.g., Sentry, LogRocket)
    errorTrackingService.captureException(error, {
      extra: errorInfo,
      tags: { errorId, component: 'ErrorBoundary' }
    });
  }
}
```

## 🛠️ Error Types and Handling

### **Network Errors**
```typescript
// Connection errors
if (error.message.includes('fetch')) {
  return 'Network connection error. Please check your internet connection.';
}

// Timeout errors
if (error.message.includes('timeout')) {
  return 'Request timed out. Please try again.';
}
```

### **Authentication Errors**
```typescript
// 401 Unauthorized
if (error.status === 401) {
  // Redirect to login
  router.push('/auth/login');
  return 'Session expired. Please log in again.';
}

// 403 Forbidden
if (error.status === 403) {
  return 'You do not have permission to perform this action.';
}
```

### **Validation Errors**
```typescript
// 422 Unprocessable Entity
if (error.status === 422) {
  return error.details?.message || 'Invalid data provided.';
}
```

### **Server Errors**
```typescript
// 5xx Server errors
if (error.status >= 500) {
  return 'Server error. Please try again later.';
}
```

## 📊 Error Analytics

### **Error Metrics**
- **Error Rate**: Percentage of requests that fail
- **Error Types**: Classification of error categories
- **Recovery Rate**: Percentage of errors resolved by retry
- **User Impact**: Errors that affect user experience

### **Error Tracking**
```typescript
// Track error patterns
const errorMetrics = {
  totalErrors: 0,
  errorsByType: {},
  errorsByComponent: {},
  recoveryRate: 0,
  userAffectedSessions: 0
};
```

## 🧪 Testing Error Scenarios

### **Error Simulation**
```typescript
// Simulate network errors for testing
if (process.env.NODE_ENV === 'development' && window.simulateError) {
  throw new Error('Simulated error for testing');
}
```

### **Error Boundary Testing**
```typescript
// Test component that throws errors
function ErrorTestComponent() {
  const [shouldError, setShouldError] = useState(false);
  
  if (shouldError) {
    throw new Error('Test error for error boundary');
  }
  
  return (
    <button onClick={() => setShouldError(true)}>
      Trigger Error
    </button>
  );
}
```

## 📋 Error Handling Checklist

### **Implementation Checklist**
- ✅ Error boundaries in place
- ✅ API error handling with retry logic
- ✅ User-friendly error messages
- ✅ Error logging and monitoring
- ✅ Graceful degradation
- ✅ Recovery mechanisms
- ✅ Error state management
- ✅ Timeout handling
- ✅ Network error handling
- ✅ Authentication error handling

### **Best Practices**
1. **Fail Fast**: Detect errors early
2. **Fail Safe**: Graceful degradation
3. **User-Friendly**: Clear error messages
4. **Actionable**: Provide recovery options
5. **Logged**: Comprehensive error logging
6. **Monitored**: Track error patterns
7. **Tested**: Test error scenarios
8. **Documented**: Clear error documentation

---

This error handling strategy ensures the PTA Management System remains resilient, user-friendly, and maintainable even when things go wrong.