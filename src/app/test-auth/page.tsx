'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestAuthPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking auth...');
        const { data: { user }, error } = await supabase.auth.getUser();
        console.log('Auth result:', { user, error });
        
        if (error) {
          setError(error.message);
        } else {
          setUser(user);
        }
      } catch (err: any) {
        console.error('Auth check error:', err);
        setError(err.message);
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
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      {user ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <h2 className="font-bold">User authenticated:</h2>
          <pre className="mt-2 text-sm">{JSON.stringify(user, null, 2)}</pre>
        </div>
      ) : (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No user found
        </div>
      )}
    </div>
  );
}