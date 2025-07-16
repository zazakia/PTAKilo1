# Testing Documentation

## 🎯 Overview

The PTA Management System implements comprehensive testing strategies to ensure code quality, reliability, and maintainability. This document outlines the testing architecture, methodologies, and best practices implemented throughout the application.

## 🧪 Testing Strategy

### **Testing Pyramid**
```
                    E2E Tests
                   /          \
              Integration Tests
             /                  \
        Unit Tests (Foundation)
```

### **Testing Types**
1. **Unit Tests**: Individual component and function testing
2. **Integration Tests**: API and database integration testing
3. **Component Tests**: React component behavior testing
4. **End-to-End Tests**: Full user workflow testing
5. **Security Tests**: Authentication and authorization testing
6. **Performance Tests**: Load and stress testing

### **Testing Tools**
- **Unit/Integration**: Jest + Testing Library
- **Component Testing**: React Testing Library
- **E2E Testing**: Playwright
- **API Testing**: Supertest
- **Database Testing**: Jest with Supabase test client
- **Performance Testing**: Lighthouse CI

## 🔧 Testing Setup

### **Jest Configuration**
```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/tests/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testTimeout: 10000,
};

module.exports = createJestConfig(customJestConfig);
```

### **Test Setup File**
```javascript
// jest.setup.js
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/test-path',
}));

// Mock Supabase
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis(),
    })),
  }),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.NODE_ENV = 'test';

// Global test utilities
global.mockSupabaseResponse = (data, error = null) => ({
  data,
  error,
});

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});
```

## 🧩 Unit Testing

### **Component Unit Tests**

#### **Dashboard Stats Component Test**
```typescript
// src/components/dashboard/__tests__/DashboardStats.test.tsx
import { render, screen } from '@testing-library/react';
import { DashboardStats } from '../DashboardStats';
import type { DashboardStatsProps } from '@/types/components';

describe('DashboardStats', () => {
  const defaultProps: DashboardStatsProps = {
    totalIncome: 100000,
    totalExpenses: 50000,
    totalStudents: 500,
    totalParents: 300,
    userRole: 'admin',
  };

  it('renders all stats for admin role', () => {
    render(<DashboardStats {...defaultProps} />);
    
    expect(screen.getByText('Total Income')).toBeInTheDocument();
    expect(screen.getByText('₱100,000.00')).toBeInTheDocument();
    expect(screen.getByText('Total Expenses')).toBeInTheDocument();
    expect(screen.getByText('₱50,000.00')).toBeInTheDocument();
    expect(screen.getByText('Total Students')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('Total Parents')).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
  });

  it('filters stats for parent role', () => {
    render(<DashboardStats {...defaultProps} userRole="parent" />);
    
    expect(screen.getByText('Total Students')).toBeInTheDocument();
    expect(screen.queryByText('Total Income')).not.toBeInTheDocument();
    expect(screen.queryByText('Total Expenses')).not.toBeInTheDocument();
    expect(screen.queryByText('Total Parents')).not.toBeInTheDocument();
  });

  it('filters stats for teacher role', () => {
    render(<DashboardStats {...defaultProps} userRole="teacher" />);
    
    expect(screen.getByText('Total Students')).toBeInTheDocument();
    expect(screen.getByText('Total Parents')).toBeInTheDocument();
    expect(screen.queryByText('Total Income')).not.toBeInTheDocument();
    expect(screen.queryByText('Total Expenses')).not.toBeInTheDocument();
  });

  it('formats currency correctly', () => {
    render(<DashboardStats {...defaultProps} totalIncome={1234567.89} />);
    
    expect(screen.getByText('₱1,234,567.89')).toBeInTheDocument();
  });

  it('handles zero values correctly', () => {
    render(<DashboardStats {...defaultProps} totalIncome={0} totalExpenses={0} />);
    
    expect(screen.getByText('₱0.00')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(<DashboardStats {...defaultProps} />);
    
    const container = screen.getByRole('region', { name: /dashboard statistics/i });
    expect(container).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
  });
});
```

#### **Error Boundary Component Test**
```typescript
// src/components/common/__tests__/ErrorBoundary.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

// Test component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('shows detailed error in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Development Error')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  it('calls onError callback when error occurs', () => {
    const onError = jest.fn();
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('resets error state when retry button is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('No error')).toBeInTheDocument();
  });
});
```

### **Utility Function Tests**

#### **API Layer Tests**
```typescript
// src/lib/__tests__/api.test.ts
import { api } from '../api';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Mock Supabase client
jest.mock('@supabase/auth-helpers-nextjs');
const mockSupabase = createClientComponentClient as jest.MockedFunction<typeof createClientComponentClient>;

describe('API Layer', () => {
  let mockFrom: jest.Mock;
  let mockSelect: jest.Mock;
  let mockInsert: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDelete: jest.Mock;
  let mockEq: jest.Mock;
  let mockSingle: jest.Mock;

  beforeEach(() => {
    mockSingle = jest.fn();
    mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    mockInsert = jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: mockSingle }) });
    mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
    mockDelete = jest.fn().mockReturnValue({ eq: mockEq });
    mockFrom = jest.fn().mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    });

    mockSupabase.mockReturnValue({
      from: mockFrom,
    } as any);
  });

  describe('members', () => {
    it('gets all members successfully', async () => {
      const mockMembers = [
        { id: '1', email: 'test@example.com', full_name: 'Test User', role: 'parent' },
      ];
      mockSelect.mockResolvedValue({ data: mockMembers, error: null });

      const result = await api.members.getAll();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMembers);
      expect(mockFrom).toHaveBeenCalledWith('ptaVOID_members');
      expect(mockSelect).toHaveBeenCalledWith('*');
    });

    it('handles database error', async () => {
      const mockError = { message: 'Database connection failed' };
      mockSelect.mockResolvedValue({ data: null, error: mockError });

      const result = await api.members.getAll();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });

    it('creates member successfully', async () => {
      const newMember = {
        email: 'new@example.com',
        full_name: 'New User',
        role: 'parent' as const,
      };
      const createdMember = { id: '2', ...newMember };
      
      mockSingle.mockResolvedValue({ data: createdMember, error: null });

      const result = await api.members.create(newMember);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(createdMember);
      expect(mockInsert).toHaveBeenCalledWith(newMember);
    });
  });

  describe('dashboard', () => {
    it('gets dashboard stats successfully', async () => {
      const mockStats = {
        totalIncome: 100000,
        totalExpenses: 50000,
        totalStudents: 500,
        totalMembers: 300,
        ptaPaidStudents: 200,
        ptaUnpaidStudents: 300,
      };

      // Mock multiple database calls
      mockSelect
        .mockResolvedValueOnce({ data: [{ amount: 100000 }], error: null }) // income
        .mockResolvedValueOnce({ data: [{ amount: 50000 }], error: null }) // expenses
        .mockResolvedValueOnce({ count: 500, error: null }) // students
        .mockResolvedValueOnce({ count: 300, error: null }) // members
        .mockResolvedValueOnce({ count: 200, error: null }) // paid students
        .mockResolvedValueOnce({ count: 300, error: null }); // unpaid students

      const result = await api.dashboard.getStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStats);
    });
  });
});
```

#### **Configuration Tests**
```typescript
// src/lib/__tests__/config.test.ts
import { z } from 'zod';

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
  SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service',
  NODE_ENV: 'test',
  APP_NAME: 'Test PTA System',
  DEBUG: 'true',
};

describe('Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...mockEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('validates correct configuration', () => {
    // Re-import to get fresh config with mocked env
    jest.resetModules();
    const { config } = require('../config');

    expect(config.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co');
    expect(config.NODE_ENV).toBe('test');
    expect(config.DEBUG).toBe(true);
  });

  it('rejects invalid Supabase URL', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'invalid-url';

    expect(() => {
      jest.resetModules();
      require('../config');
    }).toThrow();
  });

  it('applies default values', () => {
    delete process.env.APP_NAME;
    delete process.env.DEBUG;

    jest.resetModules();
    const { config } = require('../config');

    expect(config.APP_NAME).toBe('PTA Management System');
    expect(config.DEBUG).toBe(false);
  });

  it('validates environment-specific requirements', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.NEXTAUTH_SECRET;

    expect(() => {
      jest.resetModules();
      require('../config');
    }).toThrow(/NextAuth secret/);
  });
});
```

## 🔗 Integration Testing

### **API Route Tests**
```typescript
// tests/api/members.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/members/route';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

jest.mock('@supabase/auth-helpers-nextjs');

describe('/api/members', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      }),
    };

    (createServerComponentClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('GET /api/members', () => {
    it('returns members for authenticated admin', async () => {
      const mockUser = { id: 'admin-id', role: 'admin' };
      const mockMembers = [
        { id: '1', email: 'test@example.com', full_name: 'Test User', role: 'parent' },
      ];

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      mockSupabase.from().select().mockResolvedValue({ data: mockMembers, error: null });

      const { req, res } = createMocks({ method: 'GET' });
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockMembers);
    });

    it('returns 401 for unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

      const { req, res } = createMocks({ method: 'GET' });
      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 403 for insufficient permissions', async () => {
      const mockUser = { id: 'parent-id', role: 'parent' };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      const { req, res } = createMocks({ method: 'GET' });
      await handler(req, res);

      expect(res._getStatusCode()).toBe(403);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error).toBe('Insufficient permissions');
    });
  });

  describe('POST /api/members', () => {
    it('creates member with valid data', async () => {
      const mockUser = { id: 'admin-id', role: 'admin' };
      const newMember = {
        email: 'new@example.com',
        full_name: 'New User',
        role: 'parent',
      };
      const createdMember = { id: '2', ...newMember };

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      mockSupabase.from().insert().select().single.mockResolvedValue({ 
        data: createdMember, 
        error: null 
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: newMember,
      });
      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toEqual(createdMember);
    });

    it('validates input data', async () => {
      const mockUser = { id: 'admin-id', role: 'admin' };
      const invalidMember = {
        email: 'invalid-email',
        full_name: '',
        role: 'invalid-role',
      };

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      const { req, res } = createMocks({
        method: 'POST',
        body: invalidMember,
      });
      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error).toContain('validation');
    });
  });
});
```

### **Database Integration Tests**
```typescript
// tests/database/members.test.ts
import { DatabaseService } from '@/lib/database';
import { createClient } from '@supabase/supabase-js';

// Use test database
const supabaseUrl = process.env.SUPABASE_TEST_URL!;
const supabaseKey = process.env.SUPABASE_TEST_ANON_KEY!;
const testClient = createClient(supabaseUrl, supabaseKey);

describe('DatabaseService - Members', () => {
  beforeEach(async () => {
    // Clean up test data
    await testClient.from('ptaVOID_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  });

  afterAll(async () => {
    // Final cleanup
    await testClient.from('ptaVOID_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  });

  it('creates and retrieves member', async () => {
    const memberData = {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'parent' as const,
      phone: '+639123456789',
    };

    // Create member
    const createdMember = await DatabaseService.createMember(memberData);
    expect(createdMember.email).toBe(memberData.email);
    expect(createdMember.full_name).toBe(memberData.full_name);

    // Retrieve member
    const retrievedMember = await DatabaseService.getMember(createdMember.id);
    expect(retrievedMember).toEqual(createdMember);
  });

  it('updates member data', async () => {
    const memberData = {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'update@example.com',
      full_name: 'Update User',
      role: 'parent' as const,
    };

    const createdMember = await DatabaseService.createMember(memberData);
    
    const updates = {
      full_name: 'Updated Name',
      phone: '+639987654321',
    };

    const updatedMember = await DatabaseService.updateMember(createdMember.id, updates);
    expect(updatedMember.full_name).toBe(updates.full_name);
    expect(updatedMember.phone).toBe(updates.phone);
  });

  it('handles duplicate email error', async () => {
    const memberData = {
      id: '33333333-3333-3333-3333-333333333333',
      email: 'duplicate@example.com',
      full_name: 'First User',
      role: 'parent' as const,
    };

    await DatabaseService.createMember(memberData);

    const duplicateMember = {
      id: '44444444-4444-4444-4444-444444444444',
      email: 'duplicate@example.com',
      full_name: 'Second User',
      role: 'teacher' as const,
    };

    await expect(DatabaseService.createMember(duplicateMember))
      .rejects.toThrow(/duplicate key value/i);
  });
});
```

## 🎭 End-to-End Testing

### **Playwright Configuration**
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### **E2E Test Examples**
```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can login with valid credentials', async ({ page }) => {
    await page.goto('/auth/login');

    // Fill login form
    await page.fill('input[name="email"]', 'admin@velementary.edu.ph');
    await page.fill('input[name="password"]', 'admin123');
    
    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Should show user greeting
    await expect(page.locator('h1')).toContainText('Good');
    await expect(page.locator('h1')).toContainText('admin@velementary.edu.ph');
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('[role="alert"]')).toContainText('Invalid login credentials');
    
    // Should stay on login page
    await expect(page).toHaveURL('/auth/login');
  });

  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@velementary.edu.ph');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('displays dashboard statistics', async ({ page }) => {
    // Check for statistics cards
    await expect(page.locator('text=Total Income')).toBeVisible();
    await expect(page.locator('text=Total Expenses')).toBeVisible();
    await expect(page.locator('text=Total Students')).toBeVisible();
    await expect(page.locator('text=Total Parents')).toBeVisible();

    // Check for currency formatting
    await expect(page.locator('text=/₱[\d,]+\.\d{2}/')).toBeVisible();
  });

  test('shows PTA payment status', async ({ page }) => {
    await expect(page.locator('text=PTA Payment Status')).toBeVisible();
    await expect(page.locator('text=Paid Students')).toBeVisible();
    await expect(page.locator('text=Unpaid Students')).toBeVisible();
    
    // Check for progress bar
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
  });

  test('displays recent transactions', async ({ page }) => {
    await expect(page.locator('text=Recent Transactions')).toBeVisible();
    
    // Should have view all button
    await expect(page.locator('button:has-text("View all")')).toBeVisible();
  });

  test('shows role-based quick actions', async ({ page }) => {
    await expect(page.locator('text=Quick Actions')).toBeVisible();
    
    // Admin should see financial action buttons
    await expect(page.locator('button:has-text("Record Income")')).toBeVisible();
    await expect(page.locator('button:has-text("Record Expense")')).toBeVisible();
  });

  test('handles loading states', async ({ page }) => {
    // Intercept API calls to simulate slow response
    await page.route('/api/dashboard/stats', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.reload();