'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, DatabaseService } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import {
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface Parent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  occupation: string;
  emergency_contact: string;
  emergency_phone: string;
  created_at: string;
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

export default function ParentsPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    occupation: '',
    emergency_contact: '',
    emergency_phone: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        // Mock data for now - will be replaced with actual API calls
        setParents([
          {
            id: '1',
            first_name: 'Juan',
            last_name: 'Dela Cruz',
            email: 'juan.delacruz@email.com',
            phone: '09123456789',
            address: '123 Main St, Barangay Centro, City',
            occupation: 'Engineer',
            emergency_contact: 'Maria Dela Cruz',
            emergency_phone: '09987654321',
            created_at: '2024-01-01T00:00:00Z',
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
            email: 'maria.santos@email.com',
            phone: '09987654321',
            address: '456 Oak Ave, Barangay San Jose, City',
            occupation: 'Teacher',
            emergency_contact: 'Pedro Santos',
            emergency_phone: '09123456789',
            created_at: '2024-01-02T00:00:00Z',
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
          {
            id: '3',
            first_name: 'Roberto',
            last_name: 'Garcia',
            email: 'roberto.garcia@email.com',
            phone: '09555123456',
            address: '789 Pine St, Barangay Poblacion, City',
            occupation: 'Business Owner',
            emergency_contact: 'Carmen Garcia',
            emergency_phone: '09555654321',
            created_at: '2024-01-03T00:00:00Z',
            students: [
              {
                id: '4',
                first_name: 'Carlos',
                last_name: 'Garcia',
                grade_level: 'Grade 4',
                section: 'Aguinaldo',
                pta_paid: true,
              },
              {
                id: '5',
                first_name: 'Sofia',
                last_name: 'Garcia',
                grade_level: 'Grade 6',
                section: 'Luna',
                pta_paid: false,
              },
            ],
          },
        ]);
      } catch (error) {
        console.error('Error loading parents data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredParents = parents.filter(parent =>
    `${parent.first_name} ${parent.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.phone.includes(searchTerm)
  );

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      occupation: '',
      emergency_contact: '',
      emergency_phone: '',
    });
  };

  const handleAdd = () => {
    resetForm();
    setShowAddForm(true);
  };

  const handleEdit = (parent: Parent) => {
    setFormData({
      first_name: parent.first_name,
      last_name: parent.last_name,
      email: parent.email,
      phone: parent.phone,
      address: parent.address,
      occupation: parent.occupation,
      emergency_contact: parent.emergency_contact,
      emergency_phone: parent.emergency_phone,
    });
    setSelectedParent(parent);
    setShowEditForm(true);
  };

  const handleView = (parent: Parent) => {
    setSelectedParent(parent);
    setShowViewModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) return;

    setSubmitting(true);
    try {
      if (showEditForm && selectedParent) {
        // Update parent
        console.log('Updating parent:', { id: selectedParent.id, ...formData });
        
        setParents(prev => 
          prev.map(p => 
            p.id === selectedParent.id 
              ? { ...p, ...formData }
              : p
          )
        );
        
        setShowEditForm(false);
        alert('Parent updated successfully!');
      } else {
        // Create new parent
        console.log('Creating parent:', formData);
        
        const newParent: Parent = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date().toISOString(),
          students: [],
        };
        
        setParents(prev => [...prev, newParent]);
        setShowAddForm(false);
        alert('Parent added successfully!');
      }

      resetForm();
      setSelectedParent(null);
    } catch (error) {
      console.error('Error saving parent:', error);
      alert('Error saving parent. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (parentId: string) => {
    if (!confirm('Are you sure you want to delete this parent? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Deleting parent:', parentId);
      
      setParents(prev => prev.filter(p => p.id !== parentId));
      alert('Parent deleted successfully!');
    } catch (error) {
      console.error('Error deleting parent:', error);
      alert('Error deleting parent. Please try again.');
    }
  };

  const getUserRole = () => {
    return user?.user_metadata?.role || 'parent';
  };

  const canEdit = () => {
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
            Parents Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage parent information and contact details
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          {canEdit() && (
            <button
              onClick={handleAdd}
              className="btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Parent
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search parents by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
          </div>
        </div>
      </div>

      {/* Parents List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Parents ({filteredParents.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PTA Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredParents.map((parent) => {
                  const ptaPaid = parent.students.some(s => s.pta_paid);
                  
                  return (
                    <tr key={parent.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <UsersIcon className="h-5 w-5 text-primary-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {parent.first_name} {parent.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{parent.occupation}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{parent.email}</div>
                        <div className="text-sm text-gray-500">{parent.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {parent.students.length} student(s)
                        </div>
                        <div className="text-sm text-gray-500">
                          {parent.students.map(s => `${s.first_name} (${s.grade_level})`).join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ptaPaid
                            ? 'bg-success-100 text-success-800'
                            : 'bg-danger-100 text-danger-800'
                        }`}>
                          {ptaPaid ? (
                            <>
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Paid
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="h-3 w-3 mr-1" />
                              Unpaid
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(parent)}
                            className="text-primary-600 hover:text-primary-900"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {canEdit() && (
                            <>
                              <button
                                onClick={() => handleEdit(parent)}
                                className="text-warning-600 hover:text-warning-900"
                                title="Edit"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(parent.id)}
                                className="text-danger-600 hover:text-danger-900"
                                title="Delete"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
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

      {/* Add/Edit Form Modal */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {showEditForm ? 'Edit Parent' : 'Add New Parent'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setShowEditForm(false);
                  resetForm();
                  setSelectedParent(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="input-field"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Occupation
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.emergency_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergency_phone: e.target.value }))}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setShowEditForm(false);
                    resetForm();
                    setSelectedParent(null);
                  }}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : showEditForm ? 'Update Parent' : 'Add Parent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedParent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Parent Details</h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedParent(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedParent.first_name} {selectedParent.last_name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Occupation</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedParent.occupation}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedParent.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedParent.phone}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="mt-1 text-sm text-gray-900">{selectedParent.address}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedParent.emergency_contact}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Emergency Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedParent.emergency_phone}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Students</label>
                <div className="space-y-2">
                  {selectedParent.students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {student.grade_level} - {student.section}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.pta_paid
                          ? 'bg-success-100 text-success-800'
                          : 'bg-danger-100 text-danger-800'
                      }`}>
                        {student.pta_paid ? 'PTA Paid' : 'PTA Unpaid'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Registration Date</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedParent.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}