'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, DatabaseService } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import {
  BanknotesIcon,
  PlusIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
  budget_limit?: number;
}

interface ExpenseTransaction {
  id: string;
  category_id: string;
  amount: number;
  description: string;
  receipt_url?: string;
  vendor: string;
  expense_date: string;
  status: 'pending' | 'approved' | 'rejected';
  created_by: string;
  approved_by?: string;
  created_at: string;
}

export default function ExpensesPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [transactions, setTransactions] = useState<ExpenseTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [vendor, setVendor] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<ExpenseTransaction | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        // Mock data for now - will be replaced with actual API calls
        setCategories([
          {
            id: '1',
            name: 'Security Services',
            description: 'Security guard payments and related expenses',
            budget_limit: 15000,
          },
          {
            id: '2',
            name: 'Maintenance & Repairs',
            description: 'Building and equipment maintenance',
            budget_limit: 10000,
          },
          {
            id: '3',
            name: 'Office Supplies',
            description: 'Stationery, forms, and office materials',
            budget_limit: 5000,
          },
          {
            id: '4',
            name: 'Events & Activities',
            description: 'School events, programs, and activities',
            budget_limit: 20000,
          },
          {
            id: '5',
            name: 'Utilities',
            description: 'Electricity, water, internet, and other utilities',
            budget_limit: 8000,
          },
          {
            id: '6',
            name: 'Transportation',
            description: 'Vehicle fuel, maintenance, and transportation costs',
            budget_limit: 3000,
          },
        ]);

        setTransactions([
          {
            id: '1',
            category_id: '1',
            amount: 5000,
            description: 'Monthly security guard payment - January 2024',
            vendor: 'ABC Security Services',
            expense_date: '2024-01-15',
            status: 'approved',
            created_by: 'admin@school.com',
            approved_by: 'principal@school.com',
            created_at: '2024-01-15T10:00:00Z',
            receipt_url: '/receipts/security-jan-2024.pdf',
          },
          {
            id: '2',
            category_id: '3',
            amount: 1500,
            description: 'Office supplies for administrative work',
            vendor: 'Office Depot',
            expense_date: '2024-01-14',
            status: 'pending',
            created_by: 'treasurer@school.com',
            created_at: '2024-01-14T14:30:00Z',
            receipt_url: '/receipts/office-supplies-jan-2024.jpg',
          },
          {
            id: '3',
            category_id: '4',
            amount: 3000,
            description: 'Supplies for Science Fair event',
            vendor: 'Educational Materials Inc.',
            expense_date: '2024-01-13',
            status: 'approved',
            created_by: 'teacher@school.com',
            approved_by: 'principal@school.com',
            created_at: '2024-01-13T09:15:00Z',
          },
        ]);
      } catch (error) {
        console.error('Error loading expense data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !amount || !vendor || !description) return;

    setSubmitting(true);
    try {
      // Here we would make the actual API call to create the expense transaction
      console.log('Creating expense transaction:', {
        category_id: selectedCategory,
        amount,
        description,
        vendor,
        expense_date: expenseDate,
        receipt_file: receiptFile,
      });

      // Mock success - in real implementation, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reset form
      setShowAddForm(false);
      setSelectedCategory('');
      setAmount(0);
      setDescription('');
      setVendor('');
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setReceiptFile(null);

      // Show success message (you might want to use a toast library)
      alert('Expense transaction recorded successfully!');
    } catch (error) {
      console.error('Error creating expense transaction:', error);
      alert('Error recording expense transaction. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (transactionId: string) => {
    try {
      console.log('Approving transaction:', transactionId);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTransactions(prev => 
        prev.map(t => 
          t.id === transactionId 
            ? { ...t, status: 'approved' as const, approved_by: user?.email || '' }
            : t
        )
      );
      
      alert('Transaction approved successfully!');
    } catch (error) {
      console.error('Error approving transaction:', error);
      alert('Error approving transaction. Please try again.');
    }
  };

  const handleReject = async (transactionId: string) => {
    try {
      console.log('Rejecting transaction:', transactionId);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTransactions(prev => 
        prev.map(t => 
          t.id === transactionId 
            ? { ...t, status: 'rejected' as const, approved_by: user?.email || '' }
            : t
        )
      );
      
      alert('Transaction rejected successfully!');
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      alert('Error rejecting transaction. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const getCategoryBudget = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.budget_limit || 0;
  };

  const getCategorySpent = (categoryId: string) => {
    return transactions
      .filter(t => t.category_id === categoryId && t.status === 'approved')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getUserRole = () => {
    return user?.user_metadata?.role || 'parent';
  };

  const canApprove = () => {
    const role = getUserRole();
    return role === 'admin' || role === 'principal';
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
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
            Expense Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage PTA expenses and budget allocation
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          {(getUserRole() === 'admin' || getUserRole() === 'treasurer') && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Record Expense
            </button>
          )}
        </div>
      </div>

      {/* Budget Overview */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Budget Overview
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const spent = getCategorySpent(category.id);
              const budget = category.budget_limit || 0;
              const percentage = budget > 0 ? (spent / budget) * 100 : 0;
              
              return (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{category.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      percentage > 90 ? 'bg-danger-100 text-danger-800' :
                      percentage > 75 ? 'bg-warning-100 text-warning-800' :
                      'bg-success-100 text-success-800'
                    }`}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Spent:</span>
                      <span className="font-medium">{formatCurrency(spent)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Budget:</span>
                      <span className="font-medium">{formatCurrency(budget)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          percentage > 90 ? 'bg-danger-600' :
                          percentage > 75 ? 'bg-warning-600' :
                          'bg-success-600'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Expense Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Record New Expense</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expense Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} (Budget: {formatCurrency(category.budget_limit || 0)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Vendor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor/Supplier
                </label>
                <input
                  type="text"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="input-field"
                  placeholder="Enter vendor or supplier name"
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (PHP)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="input-field"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Expense Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expense Date
                </label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Detailed description of the expense..."
                  required
                />
              </div>

              {/* Receipt Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receipt <span className="text-danger-600">*</span>
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                        <span>Upload receipt</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*,.pdf"
                          onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                  </div>
                </div>
                {receiptFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected: {receiptFile.name}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting || !selectedCategory || !amount || !vendor || !description || !receiptFile}
                >
                  {submitting ? 'Recording...' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedTransaction?.receipt_url && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Receipt</h3>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="text-center">
              {selectedTransaction.receipt_url.endsWith('.pdf') ? (
                <iframe
                  src={selectedTransaction.receipt_url}
                  className="w-full h-96 border border-gray-300 rounded"
                  title="Receipt PDF"
                />
              ) : (
                <img
                  src={selectedTransaction.receipt_url}
                  alt="Receipt"
                  className="max-w-full h-auto mx-auto border border-gray-300 rounded"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expense Transactions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Expense Transactions
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.expense_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getCategoryName(transaction.category_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.vendor}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'approved'
                          ? 'bg-success-100 text-success-800'
                          : transaction.status === 'pending'
                          ? 'bg-warning-100 text-warning-800'
                          : 'bg-danger-100 text-danger-800'
                      }`}>
                        {transaction.status === 'approved' && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {transaction.receipt_url && (
                          <button
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowReceiptModal(true);
                            }}
                            className="text-primary-600 hover:text-primary-900"
                            title="View Receipt"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        )}
                        {canApprove() && transaction.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(transaction.id)}
                              className="text-success-600 hover:text-success-900"
                              title="Approve"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReject(transaction.id)}
                              className="text-danger-600 hover:text-danger-900"
                              title="Reject"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}