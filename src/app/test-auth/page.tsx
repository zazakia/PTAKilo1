'use client';

import { useState, useEffect } from 'react';
import { supabase, checkSupabaseConnection } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface ConnectionStatus {
  isConnected: boolean;
  lastChecked: Date;
}

export default function TestAuthPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastChecked: new Date(),
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking auth and connection...');
        
        // Check database connection
        const isConnected = await checkSupabaseConnection();
        setConnectionStatus({
          isConnected,
          lastChecked: new Date(),
        });

        // Check authentication
        const { data: { user }, error } = await supabase.auth.getUser();
        console.log('Auth result:', { user, error });
        
        if (error) {
          setError(error.message);
        } else {
          setUser(user);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">System Health Check</h1>
      
      {/* Connection Status */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Database Connection</h2>
        <div className={`p-4 rounded-lg border ${
          connectionStatus.isConnected
            ? 'bg-success-50 border-success-200 text-success-800'
            : 'bg-danger-50 border-danger-200 text-danger-800'
        }`}>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              connectionStatus.isConnected ? 'bg-success-500' : 'bg-danger-500'
            }`} />
            <span className="font-medium">
              {connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <p className="text-sm mt-1">
            Last checked: {connectionStatus.lastChecked.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert-danger mb-6">
          <h3 className="font-semibold">Error Details:</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}
      
      {/* Authentication Status */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Authentication Status</h2>
        {user ? (
          <div className="alert-success">
            <h3 className="font-semibold mb-2">User Authenticated ✓</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Email:</strong> {user.email}
              </div>
              <div>
                <strong>ID:</strong> {user.id}
              </div>
              <div>
                <strong>Role:</strong> {user.user_metadata?.role || 'Not set'}
              </div>
              <div>
                <strong>Last Sign In:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}
              </div>
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer font-medium">View Full User Object</summary>
              <pre className="mt-2 text-xs bg-white p-3 rounded border overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </details>
          </div>
        ) : (
          <div className="alert-warning">
            <h3 className="font-semibold">No User Authenticated</h3>
            <p className="text-sm mt-1">Please sign in to test authentication.</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => window.location.href = '/auth/login'}
          className="btn-primary"
        >
          Go to Login
        </button>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="btn-secondary"
        >
          Go to Dashboard
        </button>
        <button
          onClick={() => window.location.reload()}
          className="btn-outline"
        >
          Refresh Test
        </button>
      </div>
    </div>
  );
}