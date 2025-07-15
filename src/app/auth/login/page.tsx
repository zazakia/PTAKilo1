'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmail } from '@/lib/supabase';
import { AcademicCapIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmail(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    setLoading(true);
    setError('');

    const demoCredentials = {
      admin: { email: 'cybergada@gmail.com', password: 'Qweasd145698@' },
      principal: { email: 'principal@vel.edu.ph', password: 'principal123' },
      teacher: { email: 'teacher@vel.edu.ph', password: 'teacher123' },
      treasurer: { email: 'treasurer@vel.edu.ph', password: 'treasurer123' },
      parent: { email: 'parent@example.com', password: 'parent123' },
    };

    const credentials = demoCredentials[role as keyof typeof demoCredentials];
    
    try {
      await signInWithEmail(credentials.email, credentials.password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <AcademicCapIcon className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Vel Elementary School PTA Management System
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="alert-danger">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="form-input pr-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary btn-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner h-5 w-5 mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          {/* Demo Login Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Demo Accounts</h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
                className="btn-outline btn-sm text-left justify-start"
              >
                <span className="font-medium">Admin:</span>
                <span className="ml-2 text-gray-600">cybergada@gmail.com</span>
              </button>
              <button
                onClick={() => handleDemoLogin('principal')}
                disabled={loading}
                className="btn-outline btn-sm text-left justify-start"
              >
                <span className="font-medium">Principal:</span>
                <span className="ml-2 text-gray-600">principal@vel.edu.ph</span>
              </button>
              <button
                onClick={() => handleDemoLogin('teacher')}
                disabled={loading}
                className="btn-outline btn-sm text-left justify-start"
              >
                <span className="font-medium">Teacher:</span>
                <span className="ml-2 text-gray-600">teacher@vel.edu.ph</span>
              </button>
              <button
                onClick={() => handleDemoLogin('treasurer')}
                disabled={loading}
                className="btn-outline btn-sm text-left justify-start"
              >
                <span className="font-medium">Treasurer:</span>
                <span className="ml-2 text-gray-600">treasurer@vel.edu.ph</span>
              </button>
              <button
                onClick={() => handleDemoLogin('parent')}
                disabled={loading}
                className="btn-outline btn-sm text-left justify-start"
              >
                <span className="font-medium">Parent:</span>
                <span className="ml-2 text-gray-600">parent@example.com</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              href="/auth/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Contact your administrator
            </Link>
          </p>
          <p className="mt-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-gray-700">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}