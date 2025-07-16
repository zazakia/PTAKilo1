# Common Components Documentation

## 🎯 Overview

Common components provide essential infrastructure functionality used throughout the PTA Management System. These components handle error boundaries, loading states, and other shared UI patterns with performance optimizations and accessibility features.

## 🏗️ Component Architecture

### **Component Structure**
```
src/components/common/
├── ErrorBoundary.tsx        # Global error catching and recovery
└── LoadingSpinner.tsx       # Loading states and skeleton components
```

### **Usage Pattern**
```typescript
// Global error boundary in layout
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Loading states in components
<LoadingSpinner size="lg" />
<SkeletonCard />
<PageLoadingWrapper loading={isLoading}>
  <Content />
</PageLoadingWrapper>
```

## 🛡️ ErrorBoundary Component

### **File**: [`src/components/common/ErrorBoundary.tsx`](../../src/components/common/ErrorBoundary.tsx)

### **Purpose**
Provides global error catching, recovery mechanisms, and development-friendly error reporting for React component errors.

### **Props Interface**
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  errorId: string;
}
```

### **Key Features**
- **Development Mode**: Detailed error information with stack traces
- **Production Mode**: User-friendly error messages
- **Error Recovery**: Retry functionality with error reset
- **Error Reporting**: Automatic error logging and reporting
- **Unique Error IDs**: Trackable error identification
- **Accessibility**: Screen reader friendly error messages
- **Performance**: Optimized error state management

### **Error State Management**
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
  const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    hasError: true,
    error,
    errorId,
  };
}
```

### **Development vs Production Modes**
```typescript
// Development mode - detailed error information
if (process.env.NODE_ENV === 'development') {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Development Error
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Error ID: <code className="bg-gray-100 px-1 rounded">{errorId}</code>
            </p>
          </div>

          <div className="mt-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-red-800 mb-2">Error Details:</h3>
              <pre className="text-xs text-red-700 whitespace-pre-wrap overflow-auto max-h-40">
                {error.message}
              </pre>
            </div>

            {error.stack && (
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-gray-800 mb-2">Stack Trace:</h3>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto max-h-60">
                  {error.stack}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Production mode - user-friendly error message
return (
  <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Something went wrong
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We're sorry, but something unexpected happened. Please try again.
          </p>
        </div>

        <div className="mt-6">
          <button
            onClick={this.handleRetry}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  </div>
);
```

### **Error Recovery Mechanism**
```typescript
handleRetry = () => {
  const { retryCount } = this.state;
  
  // Limit retry attempts
  if (retryCount >= 3) {
    console.warn('Maximum retry attempts reached');
    return;
  }

  // Reset error state
  this.setState({
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: '',
    retryCount: retryCount + 1,
  });
};
```

### **Error Reporting**
```typescript
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  const errorId = this.state.errorId;
  
  // Log error details
  console.error('ErrorBoundary caught an error:', {
    errorId,
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString(),
  });

  // Call custom error handler if provided
  if (this.props.onError) {
    this.props.onError(error, errorInfo);
  }

  // In production, you might want to send this to an error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to error reporting service
    // errorReportingService.captureException(error, {
    //   extra: { errorId, componentStack: errorInfo.componentStack }
    // });
  }

  this.setState({ errorInfo });
}
```

### **Usage Examples**
```typescript
// Global error boundary in layout
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Custom error handling
    console.log('Custom error handler:', error);
  }}
>
  <App />
</ErrorBoundary>

// Component-specific error boundary
<ErrorBoundary fallback={CustomErrorFallback}>
  <DashboardComponent />
</ErrorBoundary>

// Custom error fallback component
const CustomErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError, errorId }) => (
  <div className="error-fallback">
    <h2>Oops! Something went wrong in this section.</h2>
    <button onClick={resetError}>Try again</button>
  </div>
);
```

## ⏳ LoadingSpinner Component

### **File**: [`src/components/common/LoadingSpinner.tsx`](../../src/components/common/LoadingSpinner.tsx)

### **Purpose**
Provides consistent loading states, spinners, skeleton components, and page loading wrappers throughout the application.

### **Component Exports**
```typescript
export { LoadingSpinner };        // Basic spinner component
export { SkeletonCard };         // Card skeleton placeholder
export { SkeletonTable };        // Table skeleton placeholder
export { PageLoadingWrapper };   // Page-level loading wrapper
```

### **LoadingSpinner Component**

#### **Props Interface**
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}
```

#### **Size Variants**
```typescript
const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};
```

#### **Color Variants**
```typescript
const colorClasses = {
  primary: 'text-primary-600',
  secondary: 'text-gray-600',
  white: 'text-white',
};
```

#### **Implementation**
```typescript
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <svg
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        role="status"
        aria-label="Loading"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
};
```

### **SkeletonCard Component**

#### **Purpose**
Provides skeleton placeholder for card-based content during loading.

#### **Props Interface**
```typescript
interface SkeletonCardProps {
  lines?: number;
  showAvatar?: boolean;
  className?: string;
}
```

#### **Implementation**
```typescript
export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  lines = 3,
  showAvatar = false,
  className = '',
}) => {
  return (
    <div className={`bg-white shadow rounded-lg p-6 ${className}`}>
      <div className="animate-pulse">
        {showAvatar && (
          <div className="flex items-center space-x-4 mb-4">
            <div className="rounded-full bg-gray-300 h-10 w-10"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
              {index === lines - 1 && (
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex space-x-2">
          <div className="h-8 bg-gray-300 rounded w-20"></div>
          <div className="h-8 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};
```

### **SkeletonTable Component**

#### **Purpose**
Provides skeleton placeholder for table content during loading.

#### **Props Interface**
```typescript
interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}
```

#### **Implementation**
```typescript
export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  className = '',
}) => {
  return (
    <div className={`bg-white shadow rounded-lg overflow-hidden ${className}`}>
      <div className="animate-pulse">
        {showHeader && (
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, index) => (
                <div key={index} className="h-4 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        )}
        
        <div className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="px-6 py-4">
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <div key={colIndex} className="h-4 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

### **PageLoadingWrapper Component**

#### **Purpose**
Provides page-level loading states with skeleton content and smooth transitions.

#### **Props Interface**
```typescript
interface PageLoadingWrapperProps {
  loading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  className?: string;
}
```

#### **Implementation**
```typescript
export const PageLoadingWrapper: React.FC<PageLoadingWrapperProps> = ({
  loading,
  children,
  skeleton,
  className = '',
}) => {
  if (loading) {
    return (
      <div className={`transition-opacity duration-200 ${className}`}>
        {skeleton || (
          <div className="space-y-6">
            <SkeletonCard lines={2} showAvatar />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard lines={3} />
              <SkeletonCard lines={3} />
              <SkeletonCard lines={3} />
            </div>
            <SkeletonTable rows={5} columns={4} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`transition-opacity duration-200 ${className}`}>
      {children}
    </div>
  );
};
```

## 🎨 Usage Examples

### **Basic Loading Spinner**
```typescript
// Small spinner for buttons
<button disabled={loading}>
  {loading ? <LoadingSpinner size="sm" color="white" /> : 'Submit'}
</button>

// Large spinner for page loading
<div className="flex justify-center items-center min-h-screen">
  <LoadingSpinner size="xl" />
</div>
```

### **Skeleton Components**
```typescript
// Card skeleton during data loading
{loading ? (
  <SkeletonCard lines={4} showAvatar />
) : (
  <UserCard user={userData} />
)}

// Table skeleton during data loading
{loading ? (
  <SkeletonTable rows={10} columns={5} />
) : (
  <DataTable data={tableData} />
)}
```

### **Page Loading Wrapper**
```typescript
// Automatic skeleton display
<PageLoadingWrapper loading={isLoading}>
  <DashboardContent />
</PageLoadingWrapper>

// Custom skeleton
<PageLoadingWrapper 
  loading={isLoading}
  skeleton={<CustomDashboardSkeleton />}
>
  <DashboardContent />
</PageLoadingWrapper>
```

### **Error Boundary with Loading**
```typescript
<ErrorBoundary>
  <PageLoadingWrapper loading={isLoading}>
    <DashboardPage />
  </PageLoadingWrapper>
</ErrorBoundary>
```

## ⚡ Performance Optimizations

### **Memoization**
```typescript
// Memoized skeleton components
export const SkeletonCard = React.memo(function SkeletonCard({ ... }) {
  // Component implementation
});

// Memoized loading wrapper
export const PageLoadingWrapper = React.memo(function PageLoadingWrapper({ ... }) {
  // Component implementation
});
```

### **Efficient Animations**
```typescript
// CSS-based animations for better performance
.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### **Conditional Rendering**
```typescript
// Avoid unnecessary re-renders
const LoadingSpinner = React.memo(({ size, color, className }) => {
  const spinnerClasses = useMemo(() => 
    `animate-spin ${sizeClasses[size]} ${colorClasses[color]}`,
    [size, color]
  );

  return (
    <svg className={spinnerClasses}>
      {/* SVG content */}
    </svg>
  );
});
```

## ♿ Accessibility Features

### **Screen Reader Support**
```typescript
// Loading spinner accessibility
<svg role="status" aria-label="Loading">
  {/* SVG content */}
</svg>
<span className="sr-only">Loading...</span>

// Error boundary accessibility
<div role="alert" aria-live="assertive">
  <h2>Something went wrong</h2>
  <p>We're sorry, but something unexpected happened.</p>
</div>
```

### **Keyboard Navigation**
```typescript
// Focusable retry button
<button
  onClick={resetError}
  className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
  aria-describedby="error-description"
>
  Try Again
</button>
```

### **Color Contrast**
```typescript
// High contrast colors for accessibility
const colorClasses = {
  primary: 'text-primary-600',    // WCAG AA compliant
  secondary: 'text-gray-600',     // WCAG AA compliant
  white: 'text-white',            // High contrast on dark backgrounds
};
```

## 🧪 Testing

### **Component Testing**
```typescript
// Loading spinner tests
describe('LoadingSpinner', () => {
  test('renders with correct size class', () => {
    render(<LoadingSpinner size="lg" />);
    expect(screen.getByRole('status')).toHaveClass('h-8 w-8');
  });

  test('has accessible label', () => {
    render(<LoadingSpinner />);
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });
});

// Error boundary tests
describe('ErrorBoundary', () => {
  test('catches and displays error', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  test('calls onError callback', () => {
    const onError = jest.fn();
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
  });
});
```

### **Integration Testing**
```typescript
// Page loading wrapper integration
test('shows skeleton during loading', () => {
  render(
    <PageLoadingWrapper loading={true}>
      <div>Content</div>
    </PageLoadingWrapper>
  );

  expect(screen.queryByText('Content')).not.toBeInTheDocument();
  expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
});
```

## 📋 Best Practices

### **Loading States**
1. **Immediate Feedback**: Show loading indicators immediately
2. **Skeleton Content**: Use skeletons for better perceived performance
3. **Progressive Loading**: Load critical content first
4. **Timeout Handling**: Handle long loading times gracefully
5. **Error Recovery**: Provide retry mechanisms

### **Error Handling**
1. **User-Friendly Messages**: Clear, actionable error messages
2. **Development Support**: Detailed error information in development
3. **Error Recovery**: Allow users to retry failed operations
4. **Error Reporting**: Log errors for debugging and monitoring
5. **Graceful Degradation**: Maintain functionality when possible

### **Performance**
1. **Memoization**: Use React.memo for expensive components
2. **Efficient Animations**: Use CSS animations over JavaScript
3. **Conditional Rendering**: Avoid unnecessary component renders
4. **Bundle Size**: Keep component bundle size minimal
5. **Accessibility**: Ensure components are accessible to all users

---

These common components provide the foundation for a robust, accessible, and performant user interface throughout the PTA Management System.