'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, DatabaseService } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import {
  AcademicCapIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  student_id: string;
  grade_level: string;
  section: string;
  birth_date: string;
  gender: 'male' | 'female';
  address: string;
  parent_id: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  pta_paid: boolean;
  created_at: string;
}

interface Grade {
  id: string;
  name: string;
  sections: Section[];
}

interface Section {
  id: string;
  name: string;
  grade_id: string;
  teacher_id?: string;
  teacher_name?: string;
  capacity: number;
  current_count: number;
}

export default function StudentsPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [ptaFilter, setPtaFilter] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    student_id: '',
    grade_level: '',
    section: '',
    birth_date: '',
    gender: 'male' as 'male' | 'female',
    address: '',
    parent_id: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        // Mock data for now - will be replaced with actual API calls
        setGrades([
          {
            id: '1',
            name: 'Grade 1',
            sections: [
              { id: '1', name: 'Rizal', grade_id: '1', teacher_name: 'Ms. Garcia', capacity: 30, current_count: 28 },
              { id: '2', name: 'Bonifacio', grade_id: '1', teacher_name: 'Ms. Santos', capacity: 30, current_count: 25 },
            ],
          },
          {
            id: '2',
            name: 'Grade 2',
            sections: [
              { id: '3', name: 'Mabini', grade_id: '2', teacher_name: 'Ms. Cruz', capacity: 30, current_count: 29 },
              { id: '4', name: 'Luna', grade_id: '2', teacher_name: 'Ms. Reyes', capacity: 30, current_count: 27 },
            ],
          },
          {
            id: '3',
            name: 'Grade 3',
            sections: [
              { id: '5', name: 'Aguinaldo', grade_id: '3', teacher_name: 'Ms. Torres', capacity: 30, current_count: 26 },
              { id: '6', name: 'Del Pilar', grade_id: '3', teacher_name: 'Ms. Morales', capacity: 30, current_count: 24 },
            ],
          },
        ]);

        setStudents([
          {
            id: '1',
            first_name: 'Maria',
            last_name: 'Dela Cruz',
            student_id: 'VEL-2024-001',
            grade_level: 'Grade 3',
            section: 'Mabini',
            birth_date: '2015-03-15',
            gender: 'female',
            address: '123 Main St, Barangay Centro, City',
            parent_id: '1',
            parent_name: 'Juan Dela Cruz',
            parent_email: 'juan.delacruz@email.com',
            parent_phone: '09123456789',
            pta_paid: false,
            created_at: '2024-01-01T00:00:00Z',
          },
          {
            id: '2',
            first_name: 'Jose',
            last_name: 'Dela Cruz',
            student_id: 'VEL-2024-002',
            grade_level: 'Grade 1',
            section: 'Rizal',
            birth_date: '2017-08-22',
            gender: 'male',
            address: '123 Main St, Barangay Centro, City',
            parent_id: '1',
            parent_name: 'Juan Dela Cruz',
            parent_email: 'juan.delacruz@email.com',
            parent_phone: '09123456789',
            pta_paid: false,
            created_at: '2024-01-01T00:00:00Z',
          },
          {
            id: '3',
            first_name: 'Ana',
            last_name: 'Santos',
            student_id: 'VEL-2024-003',
            grade_level: 'Grade 2',
            section: 'Bonifacio',
            birth_date: '2016-05-10',
            gender: 'female',
            address: '456 Oak Ave, Barangay San Jose, City',
            parent_id: '2',
            parent_name: 'Maria Santos',
            parent_email: 'maria.santos@email.com',
            parent_phone: '09987654321',
            pta_paid: true,
            created_at: '2024-01-02T00:00:00Z',
          },
          {
            id: '4',
            first_name: 'Carlos',
            last_name: 'Garcia',
            student_id: 'VEL-2024-004',
            grade_level: 'Grade 4',
            section: 'Aguinaldo',
            birth_date: '2014-11-03',
            gender: 'male',
            address: '789 Pine St, Barangay Poblacion, City',
            parent_id: '3',
            parent_name: 'Roberto Garcia',
            parent_email: 'roberto.garcia@email.com',
            parent_phone: '09555123456',
            pta_paid: true,
            created_at: '2024-01-03T00:00:00Z',
          },
        ]);
      } catch (error) {
        console.error('Error loading students data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parent_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrade = !selectedGrade || student.grade_level === selectedGrade;
    const matchesSection = !selectedSection || student.section === selectedSection;
    const matchesPta = !ptaFilter || 
      (ptaFilter === 'paid' && student.pta_paid) ||
      (ptaFilter === 'unpaid' && !student.pta_paid);

    return matchesSearch && matchesGrade && matchesSection && matchesPta;
  });

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      student_id: '',
      grade_level: '',
      section: '',
      birth_date: '',
      gender: 'male',
      address: '',
      parent_id: '',
    });
  };

  const generateStudentId = () => {
    const year = new Date().getFullYear();
    const count = students.length + 1;
    return `VEL-${year}-${count.toString().padStart(3, '0')}`;
  };

  const handleAdd = () => {
    resetForm();
    setFormData(prev => ({ ...prev, student_id: generateStudentId() }));
    setShowAddForm(true);
  };

  const handleEdit = (student: Student) => {
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      student_id: student.student_id,
      grade_level: student.grade_level,
      section: student.section,
      birth_date: student.birth_date,
      gender: student.gender,
      address: student.address,
      parent_id: student.parent_id,
    });
    setSelectedStudent(student);
    setShowEditForm(true);
  };

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.grade_level || !formData.section) return;

    setSubmitting(true);
    try {
      if (showEditForm && selectedStudent) {
        // Update student
        console.log('Updating student:', { id: selectedStudent.id, ...formData });
        
        setStudents(prev => 
          prev.map(s => 
            s.id === selectedStudent.id 
              ? { ...s, ...formData }
              : s
          )
        );
        
        setShowEditForm(false);
        alert('Student updated successfully!');
      } else {
        // Create new student
        console.log('Creating student:', formData);
        
        const newStudent: Student = {
          id: Date.now().toString(),
          ...formData,
          parent_name: 'Parent Name', // This would come from parent selection
          parent_email: 'parent@email.com',
          parent_phone: '09123456789',
          pta_paid: false,
          created_at: new Date().toISOString(),
        };
        
        setStudents(prev => [...prev, newStudent]);
        setShowAddForm(false);
        alert('Student added successfully!');
      }

      resetForm();
      setSelectedStudent(null);
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Error saving student. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Deleting student:', studentId);
      
      setStudents(prev => prev.filter(s => s.id !== studentId));
      alert('Student deleted successfully!');
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Error deleting student. Please try again.');
    }
  };

  const getUserRole = () => {
    return user?.user_metadata?.role || 'parent';
  };

  const canEdit = () => {
    const role = getUserRole();
    return role === 'admin' || role === 'principal';
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
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
            Students Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage student information and enrollment
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          {canEdit() && (
            <button
              onClick={handleAdd}
              className="btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Student
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
            </div>

            {/* Grade Filter */}
            <div>
              <select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setSelectedSection(''); // Reset section when grade changes
                }}
                className="input-field"
              >
                <option value="">All Grades</option>
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.name}>
                    {grade.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Section Filter */}
            <div>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="input-field"
                disabled={!selectedGrade}
              >
                <option value="">All Sections</option>
                {selectedGrade && grades
                  .find(g => g.name === selectedGrade)
                  ?.sections.map((section) => (
                    <option key={section.id} value={section.name}>
                      {section.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* PTA Filter */}
            <div>
              <select
                value={ptaFilter}
                onChange={(e) => setPtaFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All PTA Status</option>
                <option value="paid">PTA Paid</option>
                <option value="unpaid">PTA Unpaid</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Students ({filteredStudents.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade & Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
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
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <AcademicCapIcon className="h-5 w-5 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.first_name} {student.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{student.student_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.grade_level}</div>
                      <div className="text-sm text-gray-500">{student.section}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.parent_name}</div>
                      <div className="text-sm text-gray-500">{student.parent_phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {calculateAge(student.birth_date)} years old
                      </div>
                      <div className="text-sm text-gray-500 capitalize">{student.gender}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.pta_paid
                          ? 'bg-success-100 text-success-800'
                          : 'bg-danger-100 text-danger-800'
                      }`}>
                        {student.pta_paid ? (
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
                          onClick={() => handleView(student)}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {canEdit() && (
                          <>
                            <button
                              onClick={() => handleEdit(student)}
                              className="text-warning-600 hover:text-warning-900"
                              title="Edit"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(student.id)}
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
                ))}
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
                {showEditForm ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setShowEditForm(false);
                  resetForm();
                  setSelectedStudent(null);
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
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={formData.student_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, student_id: e.target.value }))}
                    className="input-field"
                    required
                    readOnly={showEditForm}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade Level
                  </label>
                  <select
                    value={formData.grade_level}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, grade_level: e.target.value, section: '' }));
                    }}
                    className="input-field"
                    required
                  >
                    <option value="">Select Grade</option>
                    {grades.map((grade) => (
                      <option key={grade.id} value={grade.name}>
                        {grade.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section
                  </label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                    className="input-field"
                    required
                    disabled={!formData.grade_level}
                  >
                    <option value="">Select Section</option>
                    {formData.grade_level && grades
                      .find(g => g.name === formData.grade_level)
                      ?.sections.map((section) => (
                        <option key={section.id} value={section.name}>
                          {section.name} ({section.current_count}/{section.capacity})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                  className="input-field"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
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

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setShowEditForm(false);
                    resetForm();
                    setSelectedStudent(null);
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
                  {submitting ? 'Saving...' : showEditForm ? 'Update Student' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Student Details</h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedStudent(null);
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
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student ID</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedStudent.student_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Grade & Section</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedStudent.grade_level} - {selectedStudent.section}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age & Gender</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">
                    {calculateAge(selectedStudent.birth_date)} years old, {selectedStudent.gender}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Birth Date</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedStudent.birth_date).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="mt-1 text-sm text-gray-900">{selectedStudent.address}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Parent</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedStudent.parent_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Parent Contact</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedStudent.parent_phone}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">PTA Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                  selectedStudent.pta_paid
                    ? 'bg-success-100 text-success-800'
                    : 'bg-danger-100 text-danger-800'
                }`}>
                  {selectedStudent.pta_paid ? (
                    <>
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      PTA Paid
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-3 w-3 mr-1" />
                      PTA Unpaid
                    </>
                  )}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Enrollment Date</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedStudent.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}