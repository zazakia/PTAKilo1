import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/database';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/dashboard/:path*',
  '/students',
  '/students/:path*',
  '/parents',
  '/parents/:path*',
  '/income',
  '/income/:path*',
  '/expenses',
  '/expenses/:path*',
  '/reports',
  '/reports/:path*',
  '/settings',
  '/settings/:path*',
];

// Routes that should redirect to dashboard if user is already authenticated
const authRoutes = [
  '/auth/login',
  '/auth/register',
];

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/simple-test',
  '/test-auth',
];

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => {
    const pattern = route.replace(':path*', '.*');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  });
}

function isAuthRoute(pathname: string): boolean {
  return authRoutes.includes(pathname);
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.includes(pathname);
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return res;
  }

  try {
    // Create a Supabase client configured to use cookies
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            req.cookies.set({
              name,
              value,
              ...options,
            });
            res.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            req.cookies.set({
              name,
              value: '',
              ...options,
            });
            res.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    // Refresh session if expired - required for Server Components
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    // Handle authentication errors
    if (error) {
      console.error('Auth middleware error:', error);
      
      // If it's a protected route, redirect to login
      if (isProtectedRoute(pathname)) {
        const redirectUrl = new URL('/auth/login', req.url);
        redirectUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(redirectUrl);
      }
      
      return res;
    }

    // Handle protected routes
    if (isProtectedRoute(pathname)) {
      if (!session) {
        const redirectUrl = new URL('/auth/login', req.url);
        redirectUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // Check if user has required role for specific routes
      const userRole = session.user?.user_metadata?.role;
      
      // Admin-only routes
      if (pathname.startsWith('/settings') && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

      // Treasurer/Admin routes for financial management
      if (
        (pathname.startsWith('/income') || pathname.startsWith('/expenses')) &&
        !['admin', 'treasurer'].includes(userRole)
      ) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

      // Principal/Admin routes for reports
      if (
        pathname.startsWith('/reports') &&
        !['admin', 'principal', 'treasurer'].includes(userRole)
      ) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Handle auth routes (login, register)
    if (isAuthRoute(pathname) && session) {
      // User is already authenticated, redirect to dashboard
      const redirectTo = req.nextUrl.searchParams.get('redirectTo') || '/dashboard';
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }

    // Add user info to headers for server components
    if (session?.user) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-id', session.user.id);
      requestHeaders.set('x-user-role', session.user.user_metadata?.role || 'parent');
      requestHeaders.set('x-user-email', session.user.email || '');

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    
    // On error, allow public routes but redirect protected routes to login
    if (isProtectedRoute(pathname)) {
      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};