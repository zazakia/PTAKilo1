'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, DatabaseService } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  UsersIcon,
  AcademicCapIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';

interface ReportData {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  ptaCollectionRate: number;
  totalStudents: number;
  ptaPaidStudents: number;
  monthlyIncome: { month: string; amount: number }[];
  monthlyExpenses: { month: string; amount: number }[];
  incomeByCategory: { category: string; amount: number; percentage: number }[];
  expensesByCategory: { category: string; amount: number; percentage: number }[];
  ptaStatusByGrade: { grade: string; paid: number; unpaid: number; total: number }[];
}

export default function ReportsPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('current-year');
  const [selectedReport, setSelectedReport] = useState('financial-summary');

  useEffect(() => {
    const loadReportData = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        // Mock data for now - will be replaced with actual API calls
        setReportData({
          totalIncome: 125000,
          totalExpenses: 45000,
          netIncome: 80000,
          ptaCollectionRate: 85,
          totalStudents: 500,
          ptaPaidStudents: 425,
          monthlyIncome: [
            { month: 'Jan', amount: 15000 },
            { month: 'Feb', amount: 12000 },
            { month: 'Mar', amount: 18000 },
            { month: 'Apr', amount: 14000 },
            { month: 'May', amount: 16000 },
            { month: 'Jun', amount: 20000 },
          ],
          monthlyExpenses: [
            { month: 'Jan', amount: 8000 },
            { month: 'Feb', amount: 6000 },
            { month: 'Mar', amount: 9000 },
            { month: 'Apr', amount: 7000 },
            { month: 'May', amount: 8500 },
            { month: 'Jun', amount: 6500 },
          ],
          incomeByCategory: [
            { category: 'PTA Contributions', amount: 106250, percentage: 85 },
            { category: 'SPG Fees', amount: 12500, percentage: 10 },
            { category: 'School Supplies', amount: 3750, percentage: 3 },
            { category: 'Field Trips', amount: 2500, percentage: 2 },
          ],
          expensesByCategory: [
            { category: 'Security Services', amount: 18000, percentage: 40 },
            { category: 'Events & Activities', amount: 13500, percentage: 30 },
            { category: 'Maintenance & Repairs', amount: 9000, percentage: 20 },
            { category: 'Office Supplies', amount: 4500, percentage: 10 },
          ],
          ptaStatusByGrade: [
            { grade: 'Grade 1', paid: 85, unpaid: 15, total: 100 },
            { grade: 'Grade 2', paid: 78, unpaid: 22, total: 100 },
            { grade: 'Grade 3', paid: 92, unpaid: 8, total: 100 },
            { grade: 'Grade 4', paid: 88, unpaid: 12, total: 100 },
            { grade: 'Grade 5', paid: 82, unpaid: 18, total: 100 },
            { grade: 'Grade 6', paid: 90, unpaid: 10, total: 100 },
          ],
        });
      } catch (error) {
        console.error('Error loading report data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, [selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const handleExportReport = (format: 'pdf' | 'excel') => {
    console.log(`Exporting ${selectedReport} report as ${format}`);
    // This would trigger the actual export functionality
    alert(`Exporting ${selectedReport} report as ${format.toUpperCase()}...`);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const getUserRole = () => {
    return user?.user_metadata?.role || 'parent';
  };

  const canViewFinancials = () => {
    const role = getUserRole();
    return role === 'admin' || role === 'principal' || role === 'treasurer';
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white shadow rounded-lg p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load report data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Reports & Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Financial reports and PTA payment analytics
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <button
            onClick={handlePrintReport}
            className="btn-secondary"
          >
            <PrinterIcon className="h-5 w-5 mr-2" />
            Print
          </button>
          <button
            onClick={() => handleExportReport('pdf')}
            className="btn-secondary"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Export PDF
          </button>
          <button
            onClick={() => handleExportReport('excel')}
            className="btn-primary"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Report Controls */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Type
              </label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="input-field"
              >
                <option value="financial-summary">Financial Summary</option>
                <option value="pta-collection">PTA Collection Report</option>
                <option value="expense-breakdown">Expense Breakdown</option>
                <option value="monthly-trends">Monthly Trends</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="input-field"
              >
                <option value="current-year">Current School Year</option>
                <option value="last-year">Last School Year</option>
                <option value="current-month">Current Month</option>
                <option value="last-month">Last Month</option>
                <option value="quarter">Current Quarter</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Generated On
              </label>
              <div className="flex items-center text-sm text-gray-900 mt-2">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      {canViewFinancials() && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-2 rounded-md bg-success-100">
                    <CurrencyDollarIcon className="h-6 w-6 text-success-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Income
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(reportData.totalIncome)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-2 rounded-md bg-danger-100">
                    <BanknotesIcon className="h-6 w-6 text-danger-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Expenses
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(reportData.totalExpenses)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-2 rounded-md bg-primary-100">
                    <ChartBarIcon className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Net Income
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(reportData.netIncome)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-2 rounded-md bg-warning-100">
                    <AcademicCapIcon className="h-6 w-6 text-warning-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      PTA Collection Rate
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {reportData.ptaCollectionRate}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PTA Collection Status */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            PTA Collection Status by Grade
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unpaid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collection Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.ptaStatusByGrade.map((grade) => {
                  const collectionRate = (grade.paid / grade.total) * 100;
                  
                  return (
                    <tr key={grade.grade}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {grade.grade}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {grade.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-success-600 font-medium">
                        {grade.paid}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-danger-600 font-medium">
                        {grade.unpaid}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {collectionRate.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              collectionRate >= 90 ? 'bg-success-600' :
                              collectionRate >= 75 ? 'bg-warning-600' :
                              'bg-danger-600'
                            }`}
                            style={{ width: `${collectionRate}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Income Breakdown */}
      {canViewFinancials() && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Income by Category
              </h3>
              <div className="space-y-4">
                {reportData.incomeByCategory.map((category) => (
                  <div key={category.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {category.category}
                      </span>
                      <span className="text-sm text-gray-900">
                        {formatCurrency(category.amount)} ({category.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-success-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Expenses by Category
              </h3>
              <div className="space-y-4">
                {reportData.expensesByCategory.map((category) => (
                  <div key={category.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {category.category}
                      </span>
                      <span className="text-sm text-gray-900">
                        {formatCurrency(category.amount)} ({category.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-danger-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Trends */}
      {canViewFinancials() && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Monthly Financial Trends
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Income
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expenses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Income
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.monthlyIncome.map((income, index) => {
                    const expense = reportData.monthlyExpenses[index];
                    const netIncome = income.amount - expense.amount;
                    const prevNetIncome = index > 0 
                      ? reportData.monthlyIncome[index - 1].amount - reportData.monthlyExpenses[index - 1].amount
                      : netIncome;
                    const trend = netIncome > prevNetIncome ? 'up' : netIncome < prevNetIncome ? 'down' : 'same';
                    
                    return (
                      <tr key={income.month}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {income.month} 2024
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-success-600 font-medium">
                          {formatCurrency(income.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-danger-600 font-medium">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {formatCurrency(netIncome)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            trend === 'up' ? 'bg-success-100 text-success-800' :
                            trend === 'down' ? 'bg-danger-100 text-danger-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {trend === 'up' ? '↗ Increasing' :
                             trend === 'down' ? '↘ Decreasing' :
                             '→ Stable'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Summary Statistics
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{reportData.totalStudents}</div>
              <div className="text-sm text-gray-500">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600">{reportData.ptaPaidStudents}</div>
              <div className="text-sm text-gray-500">PTA Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-danger-600">
                {reportData.totalStudents - reportData.ptaPaidStudents}
              </div>
              <div className="text-sm text-gray-500">PTA Unpaid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {formatCurrency(reportData.ptaPaidStudents * 250)}
              </div>
              <div className="text-sm text-gray-500">PTA Collections</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}