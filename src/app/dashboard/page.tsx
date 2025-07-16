'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/supabase';
import { api, handleApiError } from '@/lib/api';
import { User as SupabaseUser } from '@supabase/supabase-js';
import {
  CurrencyDollarIcon,
  BanknotesIcon,
  AcademicCapIcon,
  UsersIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  totalStudents: number;
  totalParents: number;
  ptaPaidStudents: number;
  ptaUnpaidStudents: number;
  recentTransactions: any[];
}

export default function DashboardPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpenses: 0,
    totalStudents: 0,
    totalParents: 0,
    ptaPaidStudents: 0,
    ptaUnpaidStudents: 0,
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        if (statsResponse.data) {
          setStats({
            totalIncome: statsResponse.data.totalIncome || 0,
            totalExpenses: statsResponse.data.totalExpenses || 0,
            totalStudents: statsResponse.data.totalStudents || 0,
            totalParents: statsResponse.data.totalParents || 0,
            ptaPaidStudents: statsResponse.data.ptaPaidStudents || 0,
            ptaUnpaidStudents: statsResponse.data.ptaUnpaidStudents || 0,
            recentTransactions: statsResponse.data.recentTransactions || [],
          });
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError(handleApiError(error, 'Dashboard'));
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getUserRole = () => {
    return user?.user_metadata?.role || 'parent';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleSpecificStats = () => {
    const role = getUserRole();
    const baseStats = [
      {
        name: 'Total Income',
        value: formatCurrency(stats.totalIncome),
        icon: CurrencyDollarIcon,
        color: 'text-success-600',
        bgColor: 'bg-success-100',
        change: '+12%',
        changeType: 'positive',
      },
      {
        name: 'Total Expenses',
        value: formatCurrency(stats.totalExpenses),
        icon: BanknotesIcon,
        color: 'text-danger-600',
        bgColor: 'bg-danger-100',
        change: '+8%',
        changeType: 'negative',
      },
      {
        name: 'Total Students',
        value: stats.totalStudents.toString(),
        icon: AcademicCapIcon,
        color: 'text-primary-600',
        bgColor: 'bg-primary-100',
        change: '+2%',
        changeType: 'positive',
      },
      {
        name: 'Total Parents',
        value: stats.totalParents.toString(),
        icon: UsersIcon,
        color: 'text-warning-600',
        bgColor: 'bg-warning-100',
        change: '+1%',
        changeType: 'positive',
      },
    ];

    // Filter stats based on role
    if (role === 'parent') {
      return baseStats.filter(stat => stat.name === 'Total Students');
    }
    if (role === 'teacher') {
      return baseStats.filter(stat => ['Total Students', 'Total Parents'].includes(stat.name));
    }
    return baseStats;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center mb-4">
            <XCircleIcon className="h-8 w-8 text-red-500 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Dashboard Error</h2>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {getGreeting()}, {user?.user_metadata?.full_name || user?.email}
          </h1>
          <p className="mt-1 text-sm text-gray-500 capitalize">
            {getUserRole()} Dashboard - Vel Elementary School PTA
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-100 text-success-800">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            System Online
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {getRoleSpecificStats().map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-md ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'positive' ? 'text-success-600' : 'text-danger-600'
                        }`}>
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PTA Payment Status */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            PTA Contribution Status
          </h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Paid Students</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.ptaPaidStudents}</p>
                <p className="text-sm text-success-600">
                  {((stats.ptaPaidStudents / stats.totalStudents) * 100).toFixed(1)}% completion
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-8 w-8 text-danger-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Unpaid Students</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.ptaUnpaidStudents}</p>
                <p className="text-sm text-danger-600">
                  {((stats.ptaUnpaidStudents / stats.totalStudents) * 100).toFixed(1)}% remaining
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-success-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(stats.ptaPaidStudents / stats.totalStudents) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Transactions
            </h3>
            <button className="text-sm text-primary-600 hover:text-primary-500 font-medium">
              View all
            </button>
          </div>
          <div className="flow-root">
            <ul className="-mb-8">
              {stats.recentTransactions.map((transaction, index) => (
                <li key={transaction.id}>
                  <div className="relative pb-8">
                    {index !== stats.recentTransactions.length - 1 && (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                          transaction.type === 'income' ? 'bg-success-500' : 'bg-danger-500'
                        }`}>
                          {transaction.type === 'income' ? (
                            <CurrencyDollarIcon className="h-4 w-4 text-white" />
                          ) : (
                            <BanknotesIcon className="h-4 w-4 text-white" />
                          )}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            {transaction.description}
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(transaction.amount)}
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                            transaction.status === 'completed'
                              ? 'bg-success-100 text-success-800'
                              : 'bg-warning-100 text-warning-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {getUserRole() === 'admin' || getUserRole() === 'treasurer' ? (
              <>
                <button className="btn-primary">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                  Record Income
                </button>
                <button className="btn-secondary">
                  <BanknotesIcon className="h-5 w-5 mr-2" />
                  Record Expense
                </button>
                <button className="btn-outline">
                  <UsersIcon className="h-5 w-5 mr-2" />
                  Add Parent
                </button>
                <button className="btn-outline">
                  <AcademicCapIcon className="h-5 w-5 mr-2" />
                  Add Student
                </button>
              </>
            ) : (
              <>
                <button className="btn-outline">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  View Reports
                </button>
                <button className="btn-outline">
                  <AcademicCapIcon className="h-5 w-5 mr-2" />
                  View Students
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}