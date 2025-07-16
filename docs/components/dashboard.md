# Dashboard Components Documentation

## 🎯 Overview

The dashboard has been refactored from a single 396-line component into a modular, maintainable architecture with specialized components. Each component is optimized for performance using React.memo and memoization strategies.

## 🏗️ Component Architecture

### **Component Hierarchy**
```
DashboardPage
├── DashboardHeader
├── DashboardStats
├── PTAPaymentStatus
├── RecentTransactions
└── QuickActions
```

### **File Structure**
```
src/components/dashboard/
├── DashboardHeader.tsx      # User greeting and system status
├── DashboardStats.tsx       # Role-based statistics display
├── PTAPaymentStatus.tsx     # PTA contribution tracking
├── RecentTransactions.tsx   # Transaction history display
└── QuickActions.tsx         # Role-based action buttons
```

## 📊 DashboardHeader Component

### **File**: [`src/components/dashboard/DashboardHeader.tsx`](../../src/components/dashboard/DashboardHeader.tsx)

### **Purpose**
Displays personalized greeting, user role, and system status indicator.

### **Props Interface**
```typescript
interface DashboardHeaderProps {
  user: SupabaseUser | null;
  userRole: string;
}
```

### **Features**
- **Time-based Greeting**: Dynamic greeting based on time of day
- **User Display**: Shows user's full name or email
- **Role Indicator**: Displays user's role in the system
- **System Status**: Online/offline indicator
- **Memoized**: Optimized with React.memo and useMemo

### **Implementation**
```typescript
export const DashboardHeader = React.memo(function DashboardHeader({ user, userRole }: DashboardHeaderProps) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const displayName = useMemo(() => {
    return user?.user_metadata?.full_name || user?.email;
  }, [user?.user_metadata?.full_name, user?.email]);

  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          {greeting}, {displayName}
        </h1>
        <p className="mt-1 text-sm text-gray-500 capitalize">
          {userRole} Dashboard - Vel Elementary School PTA
        </p>
      </div>
      <div className="mt-4 flex md:mt-0 md:ml-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-100 text-success-800">
          <CheckCircleIcon className="h-4 w-4 mr-1" />
          System Online
        </span>
      </div>
    </div>
  );
});
```

### **Usage**
```typescript
<DashboardHeader user={user} userRole={getUserRole()} />
```

## 📈 DashboardStats Component

### **File**: [`src/components/dashboard/DashboardStats.tsx`](../../src/components/dashboard/DashboardStats.tsx)

### **Purpose**
Displays key statistics with role-based filtering and visual indicators.

### **Props Interface**
```typescript
interface DashboardStatsProps {
  totalIncome: number;
  totalExpenses: number;
  totalStudents: number;
  totalParents: number;
  userRole: string;
}
```

### **Features**
- **Role-based Filtering**: Shows relevant stats based on user role
- **Currency Formatting**: Philippine Peso formatting
- **Visual Indicators**: Color-coded icons and backgrounds
- **Change Indicators**: Percentage change display
- **Responsive Grid**: Adapts to different screen sizes
- **Performance Optimized**: Memoized calculations and rendering

### **Role-based Display Logic**
```typescript
const roleSpecificStats = useMemo((): StatItem[] => {
  const baseStats = [
    // All statistics defined here
  ];

  // Filter stats based on role
  if (userRole === 'parent') {
    return baseStats.filter(stat => stat.name === 'Total Students');
  }
  if (userRole === 'teacher') {
    return baseStats.filter(stat => ['Total Students', 'Total Parents'].includes(stat.name));
  }
  return baseStats; // Admin/Treasurer sees all stats
}, [totalIncome, totalExpenses, totalStudents, totalParents, userRole, formatCurrency]);
```

### **Stat Item Structure**
```typescript
interface StatItem {
  name: string;
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  bgColor: string;
  change: string;
  changeType: 'positive' | 'negative';
}
```

### **Usage**
```typescript
<DashboardStats
  totalIncome={data.totalIncome}
  totalExpenses={data.totalExpenses}
  totalStudents={data.totalStudents}
  totalParents={data.totalMembers}
  userRole={getUserRole()}
/>
```

## 💰 PTAPaymentStatus Component

### **File**: [`src/components/dashboard/PTAPaymentStatus.tsx`](../../src/components/dashboard/PTAPaymentStatus.tsx)

### **Purpose**
Visualizes PTA contribution payment status with progress indicators.

### **Props Interface**
```typescript
interface PTAPaymentStatusProps {
  totalStudents: number;
  ptaPaidStudents: number;
  ptaUnpaidStudents: number;
}
```

### **Features**
- **Progress Visualization**: Animated progress bar
- **Percentage Calculations**: Automatic percentage computation
- **Visual Indicators**: Color-coded icons for paid/unpaid status
- **Responsive Layout**: Grid layout that adapts to screen size
- **Performance Optimized**: Memoized percentage calculations

### **Calculation Logic**
```typescript
const { paidPercentage, unpaidPercentage } = useMemo(() => {
  const paid = totalStudents > 0 ? (ptaPaidStudents / totalStudents) * 100 : 0;
  const unpaid = totalStudents > 0 ? (ptaUnpaidStudents / totalStudents) * 100 : 0;
  return { paidPercentage: paid, unpaidPercentage: unpaid };
}, [totalStudents, ptaPaidStudents, ptaUnpaidStudents]);
```

### **Visual Elements**
- **Progress Bar**: Animated width based on payment percentage
- **Status Icons**: CheckCircle for paid, XCircle for unpaid
- **Color Coding**: Green for paid, red for unpaid
- **Statistics Display**: Numbers and percentages

### **Usage**
```typescript
<PTAPaymentStatus
  totalStudents={data.totalStudents}
  ptaPaidStudents={data.ptaPaidStudents}
  ptaUnpaidStudents={data.ptaUnpaidStudents}
/>
```

## 📋 RecentTransactions Component

### **File**: [`src/components/dashboard/RecentTransactions.tsx`](../../src/components/dashboard/RecentTransactions.tsx)

### **Purpose**
Displays recent financial transactions with timeline visualization.

### **Props Interface**
```typescript
interface RecentTransactionsProps {
  transactions: Transaction[];
  onViewAll?: () => void;
}

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending';
}
```

### **Features**
- **Timeline Layout**: Vertical timeline with connecting lines
- **Transaction Types**: Visual distinction between income and expenses
- **Status Indicators**: Badges for completed/pending status
- **Currency Formatting**: Philippine Peso formatting
- **Date Formatting**: Localized date display
- **Empty State**: Graceful handling of no transactions
- **Performance Optimized**: Memoized formatting functions

### **Visual Design**
```typescript
// Timeline with connecting lines
{index !== transactions.length - 1 && (
  <span
    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
    aria-hidden="true"
  />
)}

// Transaction type indicators
<span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
  transaction.type === 'income' ? 'bg-success-500' : 'bg-danger-500'
}`}>
  {transaction.type === 'income' ? (
    <CurrencyDollarIcon className="h-4 w-4 text-white" />
  ) : (
    <BanknotesIcon className="h-4 w-4 text-white" />
  )}
</span>
```

### **Usage**
```typescript
<RecentTransactions
  transactions={data.recentTransactions}
  onViewAll={() => {
    // Navigate to transactions page
    console.log('Navigate to transactions');
  }}
/>
```

## ⚡ QuickActions Component

### **File**: [`src/components/dashboard/QuickActions.tsx`](../../src/components/dashboard/QuickActions.tsx)

### **Purpose**
Provides role-based quick action buttons for common tasks.

### **Props Interface**
```typescript
interface QuickActionsProps {
  userRole: string;
  onRecordIncome?: () => void;
  onRecordExpense?: () => void;
  onAddParent?: () => void;
  onAddStudent?: () => void;
  onViewReports?: () => void;
  onViewStudents?: () => void;
}
```

### **Features**
- **Role-based Actions**: Different actions for different user roles
- **Button Styling**: Consistent button styling with variants
- **Icon Integration**: Heroicons for visual clarity
- **Responsive Grid**: Adapts to screen size
- **Performance Optimized**: Memoized action arrays

### **Role-based Logic**
```typescript
const actions = useMemo(() => {
  if (userRole === 'admin' || userRole === 'treasurer') {
    return [
      {
        label: 'Record Income',
        icon: CurrencyDollarIcon,
        onClick: onRecordIncome,
        className: 'btn-primary',
      },
      {
        label: 'Record Expense',
        icon: BanknotesIcon,
        onClick: onRecordExpense,
        className: 'btn-secondary',
      },
      {
        label: 'Add Parent',
        icon: UsersIcon,
        onClick: onAddParent,
        className: 'btn-outline',
      },
      {
        label: 'Add Student',
        icon: AcademicCapIcon,
        onClick: onAddStudent,
        className: 'btn-outline',
      },
    ];
  } else {
    return [
      {
        label: 'View Reports',
        icon: ChartBarIcon,
        onClick: onViewReports,
        className: 'btn-outline',
      },
      {
        label: 'View Students',
        icon: AcademicCapIcon,
        onClick: onViewStudents,
        className: 'btn-outline',
      },
    ];
  }
}, [userRole, onRecordIncome, onRecordExpense, onAddParent, onAddStudent, onViewReports, onViewStudents]);
```

### **Usage**
```typescript
<QuickActions
  userRole={getUserRole()}
  onRecordIncome={() => {
    // Navigate to record income page
    console.log('Record income');
  }}
  onRecordExpense={() => {
    // Navigate to record expense page
    console.log('Record expense');
  }}
  onAddParent={() => {
    // Navigate to add parent page
    console.log('Add parent');
  }}
  onAddStudent={() => {
    // Navigate to add student page
    console.log('Add student');
  }}
  onViewReports={() => {
    // Navigate to reports page
    console.log('View reports');
  }}
  onViewStudents={() => {
    // Navigate to students page
    console.log('View students');
  }}
/>
```

## 🏠 Main Dashboard Page

### **File**: [`src/app/dashboard/page.tsx`](../../src/app/dashboard/page.tsx)

### **Purpose**
Orchestrates all dashboard components and manages data loading.

### **Key Features**
- **Data Loading**: Fetches dashboard data from API
- **Error Handling**: Comprehensive error management
- **Loading States**: Skeleton components during loading
- **Real API Integration**: Connected to Supabase database
- **Component Orchestration**: Manages all child components

### **Data Loading Logic**
```typescript
useEffect(() => {
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      // Load dashboard stats
      const statsResponse = await api.dashboard.getStats();
      if (!statsResponse.success) {
        throw new Error(statsResponse.error || 'Failed to load dashboard stats');
      }

      // Load recent transactions
      const [incomeResponse, expenseResponse] = await Promise.all([
        api.income.getAll(),
        api.expenses.getAll(),
      ]);

      // Process and combine data
      // ... data processing logic

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(handleApiError(error, 'Dashboard'));
    } finally {
      setLoading(false);
    }
  };

  loadDashboardData();
}, []);
```

## ⚡ Performance Optimizations

### **React.memo Implementation**
All dashboard components use React.memo to prevent unnecessary re-renders:

```typescript
export const DashboardStats = React.memo(function DashboardStats({ ... }) {
  // Component implementation
});
```

### **useMemo for Expensive Calculations**
```typescript
// Currency formatting
const formatCurrency = useMemo(() => {
  return (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };
}, []);

// Role-based filtering
const roleSpecificStats = useMemo(() => {
  // Expensive filtering logic
}, [dependencies]);
```

### **useCallback for Event Handlers**
```typescript
const handleViewAll = useCallback(() => {
  onViewAll?.();
}, [onViewAll]);
```

## 🎨 Styling and Design

### **Consistent Design System**
- **Color Scheme**: Success (green), danger (red), primary (blue), warning (yellow)
- **Typography**: Consistent font sizes and weights
- **Spacing**: Tailwind CSS spacing system
- **Icons**: Heroicons for consistency
- **Responsive**: Mobile-first responsive design

### **Component Styling Patterns**
```typescript
// Card container
<div className="bg-white shadow rounded-lg">
  <div className="px-4 py-5 sm:p-6">
    {/* Content */}
  </div>
</div>

// Button variants
className="btn-primary"     // Primary actions
className="btn-secondary"   // Secondary actions
className="btn-outline"     // Outline buttons
```

## 🧪 Testing Considerations

### **Component Testing**
```typescript
// Test component rendering
test('renders dashboard stats correctly', () => {
  render(
    <DashboardStats
      totalIncome={100000}
      totalExpenses={50000}
      totalStudents={500}
      totalParents={300}
      userRole="admin"
    />
  );
  
  expect(screen.getByText('₱100,000.00')).toBeInTheDocument();
});

// Test role-based filtering
test('shows only student stats for parent role', () => {
  render(<DashboardStats {...props} userRole="parent" />);
  
  expect(screen.getByText('Total Students')).toBeInTheDocument();
  expect(screen.queryByText('Total Income')).not.toBeInTheDocument();
});
```

### **Integration Testing**
```typescript
// Test component interaction
test('calls onViewAll when view all button is clicked', () => {
  const mockOnViewAll = jest.fn();
  render(<RecentTransactions transactions={[]} onViewAll={mockOnViewAll} />);
  
  fireEvent.click(screen.getByText('View all'));
  expect(mockOnViewAll).toHaveBeenCalled();
});
```

## 📋 Best Practices

### **Component Design Principles**
1. **Single Responsibility**: Each component has one clear purpose
2. **Props Interface**: Well-defined TypeScript interfaces
3. **Performance**: Memoization for expensive operations
4. **Accessibility**: Proper ARIA labels and semantic HTML
5. **Error Handling**: Graceful error states
6. **Loading States**: Skeleton components for better UX
7. **Responsive Design**: Mobile-first approach
8. **Consistent Styling**: Design system adherence

### **Development Guidelines**
1. **Type Safety**: Full TypeScript coverage
2. **Memoization**: Use React.memo, useMemo, useCallback appropriately
3. **Error Boundaries**: Wrap components in error boundaries
4. **Testing**: Write tests for component behavior
5. **Documentation**: Document props and usage
6. **Code Review**: Peer review for quality assurance
7. **Performance Monitoring**: Track component performance
8. **Accessibility**: Ensure components are accessible

---

This modular dashboard architecture provides better maintainability, performance, and developer experience while delivering a superior user interface.