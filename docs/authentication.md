# Authentication & Security Documentation

## 🎯 Overview

The PTA Management System implements a comprehensive authentication and security system using Supabase Auth with role-based access control, middleware protection, and secure session management. This document outlines the authentication architecture, security measures, and implementation details.

## 🏗️ Authentication Architecture

### **Authentication Flow**
```
User Login → Supabase Auth → JWT Token → Middleware Validation → Role-based Access → Protected Routes
```

### **Security Layers**
1. **Supabase Authentication**: Email/password authentication with JWT tokens
2. **Middleware Protection**: Route-level access control
3. **Role-based Authorization**: User role validation and permissions
4. **Row Level Security**: Database-level access control
5. **Session Management**: Secure session handling and timeout

### **File Structure**
```
src/
├── middleware.ts                 # Authentication middleware
├── app/auth/
│   ├── login/page.tsx           # Login page
│   ├── register/page.tsx        # Registration page (if needed)
│   └── callback/route.ts        # Auth callback handler
├── lib/
│   ├── auth.ts                  # Authentication utilities
│   └── supabase.ts              # Supabase client configuration
└── types/
    └── auth.ts                  # Authentication type definitions
```

## 🔐 Authentication Implementation

### **File**: [`src/middleware.ts`](../src/middleware.ts)

### **Authentication Middleware**
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/database';

// Protected routes configuration
const protectedRoutes = [
  '/dashboard',
  '/members',
  '/students',
  '/income',
  '/expenses',
  '/reports',
  '/profile',
];

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/callback',
  '/about',
  '/contact',
];

// Role-based route access control
const roleBasedRoutes: Record<string, string[]> = {
  '/admin': ['admin'],
  '/treasurer': ['admin', 'treasurer'],
  '/reports': ['admin', 'treasurer', 'teacher'],
  '/members/create': ['admin'],
  '/students/create': ['admin', 'teacher'],
  '/income': ['admin', 'treasurer'],
  '/expenses': ['admin', 'treasurer'],
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Create Supabase client for middleware
  const supabase = createMiddlewareClient<Database>({ req: request, res: response });

  // Get current session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  // Handle session errors
  if (sessionError) {
    console.error('Session error in middleware:', sessionError);
    
    // Redirect to login for protected routes
    if (isProtectedRoute(pathname)) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    return response;
  }

  // Check if route requires authentication
  if (isProtectedRoute(pathname)) {
    if (!session) {
      // Redirect to login with return URL
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role-based access
    const requiredRoles = getRoleRequirements(pathname);
    if (requiredRoles.length > 0) {
      const userRole = await getUserRole(supabase, session.user.id);
      
      if (!userRole || !requiredRoles.includes(userRole)) {
        // Redirect to unauthorized page or dashboard
        return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
      }
    }
  }

  // Redirect authenticated users away from auth pages
  if (session && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

// Helper functions
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route));
}

function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith('/auth/');
}

function getRoleRequirements(pathname: string): string[] {
  for (const [route, roles] of Object.entries(roleBasedRoutes)) {
    if (pathname.startsWith(route)) {
      return roles;
    }
  }
  return [];
}

async function getUserRole(supabase: any, userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('ptaVOID_members')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    return data?.role || null;
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return null;
  }
}

// Configure middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
```

### **Authentication Utilities**

#### **File**: [`src/lib/auth.ts`](../src/lib/auth.ts)

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import type { SupabaseUser, LoginCredentials, RegistrationData } from '@/types/auth';

// Create Supabase client for client components
const supabase = createClientComponentClient<Database>();

// Authentication service class
export class AuthService {
  // Sign in with email and password
  static async signIn(credentials: LoginCredentials): Promise<{
    user: SupabaseUser | null;
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return {
          user: null,
          error: error.message,
        };
      }

      return {
        user: data.user as SupabaseUser,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Sign up new user
  static async signUp(registrationData: RegistrationData): Promise<{
    user: SupabaseUser | null;
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: registrationData.email,
        password: registrationData.password,
        options: {
          data: {
            full_name: registrationData.full_name,
            role: registrationData.role,
            phone: registrationData.phone,
            address: registrationData.address,
          },
        },
      });

      if (error) {
        return {
          user: null,
          error: error.message,
        };
      }

      // Create member record in database
      if (data.user) {
        await this.createMemberRecord(data.user as SupabaseUser, registrationData);
      }

      return {
        user: data.user as SupabaseUser,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Sign out user
  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<SupabaseUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error getting current user:', error);
        return null;
      }

      return user as SupabaseUser;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  }

  // Get user session
  static async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error in getSession:', error);
      return null;
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Update user profile
  static async updateProfile(updates: Partial<RegistrationData>): Promise<{
    user: SupabaseUser | null;
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) {
        return {
          user: null,
          error: error.message,
        };
      }

      // Update member record in database
      if (data.user) {
        await this.updateMemberRecord(data.user.id, updates);
      }

      return {
        user: data.user as SupabaseUser,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Create member record in database
  private static async createMemberRecord(
    user: SupabaseUser,
    registrationData: RegistrationData
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('ptaVOID_members')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: registrationData.full_name,
          role: registrationData.role,
          phone: registrationData.phone,
          address: registrationData.address,
        });

      if (error) {
        console.error('Error creating member record:', error);
      }
    } catch (error) {
      console.error('Error in createMemberRecord:', error);
    }
  }

  // Update member record in database
  private static async updateMemberRecord(
    userId: string,
    updates: Partial<RegistrationData>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('ptaVOID_members')
        .update({
          full_name: updates.full_name,
          phone: updates.phone,
          address: updates.address,
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating member record:', error);
      }
    } catch (error) {
      console.error('Error in updateMemberRecord:', error);
    }
  }

  // Get user role from database
  static async getUserRole(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('ptaVOID_members')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      return data?.role || null;
    } catch (error) {
      console.error('Error in getUserRole:', error);
      return null;
    }
  }

  // Check if user has required role
  static async hasRole(userId: string, requiredRoles: string[]): Promise<boolean> {
    const userRole = await this.getUserRole(userId);
    return userRole ? requiredRoles.includes(userRole) : false;
  }
}

// Authentication hooks for React components
export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const session = await AuthService.getSession();
        setUser(session?.user as SupabaseUser || null);
      } catch (error) {
        console.error('Error getting initial session:', error);
        setError('Failed to load authentication state');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user as SupabaseUser || null);
        setLoading(false);
        
        if (event === 'SIGNED_OUT') {
          setError(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    
    const result = await AuthService.signIn(credentials);
    
    if (result.error) {
      setError(result.error);
    }
    
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    const result = await AuthService.signOut();
    
    if (result.error) {
      setError(result.error);
    }
    
    setLoading(false);
    return result;
  };

  return {
    user,
    loading,
    error,
    signIn,
    signOut,
    resetPassword: AuthService.resetPassword,
    updateProfile: AuthService.updateProfile,
  };
}
```

## 🔒 Login Page Implementation

### **File**: [`src/app/auth/login/page.tsx`](../src/app/auth/login/page.tsx)

### **Secure Login Component**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/lib/auth';
import type { LoginCredentials } from '@/types/auth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, loading, error } = useAuth();
  
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<LoginCredentials>>({});

  // Get return URL from query params
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';

  // Validate form data
  const validateForm = (): boolean => {
    const errors: Partial<LoginCredentials> = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await signIn(formData);
      
      if (result.user) {
        // Successful login - redirect to return URL
        router.push(returnUrl);
      }
      // Error handling is done by useAuth hook
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[name as keyof LoginCredentials]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            PTA Management System - Vel Elementary School
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  formErrors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                disabled={isSubmitting}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border ${
                  formErrors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* Additional Links */}
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a
                href="/auth/forgot-password"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Forgot your password?
              </a>
            </div>
          </div>
        </form>

        {/* Demo Credentials Notice */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Demo Credentials (Development Only)
            </h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Admin:</strong> admin@velementary.edu.ph / admin123</p>
              <p><strong>Treasurer:</strong> treasurer@velementary.edu.ph / treasurer123</p>
              <p><strong>Teacher:</strong> teacher@velementary.edu.ph / teacher123</p>
              <p><strong>Parent:</strong> parent@velementary.edu.ph / parent123</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

## 🛡️ Row Level Security (RLS)

### **Database Security Policies**

#### **Members Table RLS**
```sql
-- Enable RLS on members table
ALTER TABLE ptaVOID_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own record
CREATE POLICY "Users can read own record" ON ptaVOID_members
  FOR SELECT USING (auth.uid() = id);

-- Policy: Admins can read all records
CREATE POLICY "Admins can read all records" ON ptaVOID_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ptaVOID_members 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Users can update their own record
CREATE POLICY "Users can update own record" ON ptaVOID_members
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Only admins can insert new members
CREATE POLICY "Only admins can insert members" ON ptaVOID_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM ptaVOID_members 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### **Students Table RLS**
```sql
-- Enable RLS on students table
ALTER TABLE ptaVOID_students ENABLE ROW LEVEL SECURITY;

-- Policy: Parents can read their own children's records
CREATE POLICY "Parents can read own children" ON ptaVOID_students
  FOR SELECT USING (parent_id = auth.uid());

-- Policy: Teachers and admins can read all student records
CREATE POLICY "Teachers and admins can read all students" ON ptaVOID_students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ptaVOID_members 
      WHERE id = auth.uid() AND role IN ('admin', 'teacher')
    )
  );

-- Policy: Only admins and teachers can modify student records
CREATE POLICY "Admins and teachers can modify students" ON ptaVOID_students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ptaVOID_members 
      WHERE id = auth.uid() AND role IN ('admin', 'teacher')
    )
  );
```

#### **Financial Records RLS**
```sql
-- Enable RLS on income table
ALTER TABLE ptaVOID_income ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins and treasurers can access income records
CREATE POLICY "Financial access for income" ON ptaVOID_income
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ptaVOID_members 
      WHERE id = auth.uid() AND role IN ('admin', 'treasurer')
    )
  );

-- Enable RLS on expenses table
ALTER TABLE ptaVOID_expenses ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins and treasurers can access expense records
CREATE POLICY "Financial access for expenses" ON ptaVOID_expenses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ptaVOID_members 
      WHERE id = auth.uid() AND role IN ('admin', 'treasurer')
    )
  );
```

## 🔐 Security Best Practices

### **1. Password Security**
```typescript
// Password validation rules
export const passwordRules = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
};

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < passwordRules.minLength) {
    errors.push(`Password must be at least ${passwordRules.minLength} characters long`);
  }

  if (passwordRules.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (passwordRules.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (passwordRules.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (passwordRules.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

### **2. Session Security**
```typescript
// Session timeout configuration
export const sessionConfig = {
  timeoutMinutes: 60,
  warningMinutes: 5,
  refreshThresholdMinutes: 15,
};

// Session timeout hook
export function useSessionTimeout() {
  const [timeLeft, setTimeLeft] = useState<number>(sessionConfig.timeoutMinutes * 60);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        
        // Show warning when 5 minutes left
        if (newTime === sessionConfig.warningMinutes * 60) {
          setShowWarning(true);
        }
        
        // Auto logout when time expires
        if (newTime <= 0) {
          AuthService.signOut();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const extendSession = () => {
    setTimeLeft(sessionConfig.timeoutMinutes * 60);
    setShowWarning(false);
  };

  return {
    timeLeft,
    showWarning,
    extendSession,
  };
}
```

### **3. CSRF Protection**
```typescript
// CSRF token generation and validation
export function generateCSRFToken(): string {
  return crypto.randomUUID();
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken;
}

// CSRF middleware for API routes
export function withCSRFProtection(handler: any) {
  return async (req: NextRequest) => {
    if (req.method !== 'GET') {
      const csrfToken = req.headers.get('x-csrf-token');
      const sessionToken = req.cookies.get('csrf-token')?.value;
      
      if (!csrfToken || !sessionToken || !validateCSRFToken(csrfToken, sessionToken)) {
        return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
      }
    }
    
    return handler(req);
  };
}
```

### **4. Rate Limiting**
```typescript
// Rate limiting implementation
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < windowStart) {
      rateLimitMap.delete(key);
    }
  }
  
  const current = rateLimitMap.get(identifier);
  
  if (!current || current.resetTime < windowStart) {
    // First request in window
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: