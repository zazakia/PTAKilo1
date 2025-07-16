'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function IncomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the dashboard/income page
    router.push('/dashboard/income');
  }, [router]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Redirecting...</h1>
      <p>Please wait while we redirect you to the income page.</p>
    </div>
  );
}