'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, DatabaseService } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import {
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface IncomeCategory {
  id: string;
  name: string;
  description: string;
  is_per_student: boolean;
  default_amount: number;
}

interface Parent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  students: Student[];
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: string;
  section: string;
  pta_paid: boolean;
}

interface IncomeTransaction {
  id: string;
  category_id: string;
  parent_id: string;
  student_id?: string;
  amount: number;
  description: string;
  receipt_url?: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

export default function IncomePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [transactions, setTransactions] = useState<IncomeTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        // Mock data for now - will be replaced with actual API calls
        setCategories([
          {
            id: '1',
            name: 'PTA Contribution',
            description: 'Annual PTA membership fee',
            is_per_student: false,
            default_amount: 250,
          },
          {
            id: '2',
            name: 'SPG Fee',
            description: 'Supreme Pupil Government fee',
            is_per_student: true,
            default_amount: 50,
          },
          {
            id: '3',
            name: 'School Supplies',
            description: 'Additional school supplies fee',
            is_per_student: true,
            default_amount: 100,
          },
          {
            id: '4',
            name: 'Field Trip',
            description: 'Educational field trip fee',
            is_per_student: true,
            default_amount: 200,
          },
        ]);

        setParents([
          {
            id: '1',
            first_name: 'Juan',
            last_name: 'Dela Cruz',
            email: 'juan@example.com',
            phone: '09123456789',
            students: [
              {
                id: '1',
                first_name: 'Maria',
                last_name: 'Dela Cruz',
                grade_level: 'Grade 3',
                section: 'Mabini',
                pta_paid: false,
              },
              {
                id: '2',
                first_name: 'Jose',
                last_name: 'Dela Cruz',
                grade_level: 'Grade 1',
                section: 'Rizal',
                pta_paid: false,
              },
            ],
          },
          {
            id: '2',
            first_name: 'Maria',
            last_name: 'Santos',
            email: 'maria@example.com',
            phone: '09987654321',
            students: [
              {
                id: '3',
                first_name: 'Ana',
                last_name: 'Santos',
                grade_level: 'Grade 2',
                section: 'Bonifacio',
                pta_paid: true,
              },
            ],
          },
        ]);

        setTransactions([
          {
            id: '1',
            category_id: '1',
            parent_id: '2',
            amount: 250,
            description: 'PTA Contribution - Santos Family',
            status: 'completed',
            created_at: '2024-01-15T10:00:00Z',
          },
          {
            id: '2',
            category_id: '2',
            parent_id: '1',
            student_id: '1',
            amount: 50,
            description: 'SPG Fee - Maria Dela Cruz',
            status: 'pending',
            created_at: '2024-01-14T14:30:00Z',
          },
        ]);
      } catch (error) {
        console.error('Error loading income data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredParents = parents.filter(parent =>
    `${parent.first_name} ${parent.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      setAmount(category.default_amount);
      setDescription(category.name);
      
      // Reset student selection if switching between per-student and per-family categories
      if (!category.is_per_student) {
        setSelectedStudent(null);
      }
    }
  };

  const handleParentSelect = (parent: Parent) => {
    setSelectedParent(parent);
    setSelectedStudent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !selectedParent || !amount) return;

    setSubmitting(true);
    try {
      // Here we would make the actual API call to create the income transaction
      console.log('Creating income transaction:', {
        category_id: selectedCategory,
        parent_id: selectedParent.id,
        student_id: selectedStudent?.id,
        amount,
        description,
        receipt_file: receiptFile,
      });

      // Mock success - in real implementation, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reset form
      setShowAddForm(false);
      setSelectedCategory('');
      setSelectedParent(null);
      setSelectedStudent(null);
      setAmount(0);
      setDescription('');
      setReceiptFile(null);

      // Show success message (you might want to use a toast library)
      alert('Income transaction recorded successfully!');
    } catch (error) {
      console.error('Error creating income transaction:', error);
      alert('Error recording income transaction. Please try again.');
    } finally {
      setSubmitting(false);
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

  const getParentName = (parentId: string) => {
    const parent = parents.find(p => p.id === parentId);
    return parent ? `${parent.first_name} ${parent.last_name}` : 'Unknown';
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
            Income Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Record and manage PTA income transactions
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Record Income
          </button>
        </div>
      </div>

      {/* Add Income Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Record New Income</h3>
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
                  Income Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} - {formatCurrency(category.default_amount)}
                      {category.is_per_student ? ' (per student)' : ' (per family)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Parent Search and Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent/Guardian
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search parent by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                </div>
                
                {searchTerm && (
                  <div className="mt-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md">
                    {filteredParents.map((parent) => (
                      <button
                        key={parent.id}
                        type="button"
                        onClick={() => {
                          handleParentSelect(parent);
                          setSearchTerm(`${parent.first_name} ${parent.last_name}`);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-200 last:border-b-0"
                      >
                        <div className="font-medium">{parent.first_name} {parent.last_name}</div>
                        <div className="text-sm text-gray-500">{parent.email}</div>
                        <div className="text-xs text-gray-400">
                          {parent.students.length} student(s)
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {selectedParent && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <div className="font-medium">{selectedParent.first_name} {selectedParent.last_name}</div>
                    <div className="text-sm text-gray-500">{selectedParent.email}</div>
                  </div>
                )}
              </div>

              {/* Student Selection (for per-student categories) */}
              {selectedParent && selectedCategory && categories.find(c => c.id === selectedCategory)?.is_per_student && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student
                  </label>
                  <select
                    value={selectedStudent?.id || ''}
                    onChange={(e) => {
                      const student = selectedParent.students.find(s => s.id === e.target.value);
                      setSelectedStudent(student || null);
                    }}
                    className="input-field"
                    required
                  >
                    <option value="">Select a student</option>
                    {selectedParent.students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.first_name} {student.last_name} - {student.grade_level} {student.section}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                  placeholder="Additional details about this transaction..."
                />
              </div>

              {/* Receipt Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receipt (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*,.pdf"
                          onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
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
                  disabled={submitting || !selectedCategory || !selectedParent || !amount}
                >
                  {submitting ? 'Recording...' : 'Record Income'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Income Transactions
          </h3>
          <div className="overflow-hidden">
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
                    Parent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getCategoryName(transaction.category_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getParentName(transaction.parent_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'completed'
                          ? 'bg-success-100 text-success-800'
                          : transaction.status === 'pending'
                          ? 'bg-warning-100 text-warning-800'
                          : 'bg-danger-100 text-danger-800'
                      }`}>
                        {transaction.status === 'completed' && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                        {transaction.status}
                      </span>
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