import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface DashboardHeaderProps {
  user: SupabaseUser | null;
  userRole: string;
}

export function DashboardHeader({ user, userRole }: DashboardHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          {getGreeting()}, {user?.user_metadata?.full_name || user?.email}
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
}