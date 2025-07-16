'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, handleApiError } from '@/lib/api';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  UserIcon,
  AcademicCapIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';

interface Teacher {
  id: string;
  user_id: string;
  employee_id?: string;
  department?: string;
  position?: string;
  hire_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export default function TeacherFormPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isNew = params.id === 'new';
  const [teacher, setTeacher] = useState<Partial<Teacher>>({
    employee_id: '',
    department: '',
    position: '',
    hire_date: '',
    is_active: true,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load users with teacher role
        const usersResponse = await api.members.getAll();
        if (!usersResponse.success) {
          throw new Error(usersResponse.error || 'Failed to load users');
        }
        
        // Filter users with teacher role
        const teacherUsers = usersResponse.data?.filter(user => user.role === 'teacher') || [];
        setUsers(teacherUsers);

        // If editing existing teacher, load teacher data
        if (!isNew) {
          const response = await api.teachers.getById(params.id);
          if (!response.success) {
            throw new Error(response.error || 'Failed to load teacher');
          }
          
          if (response.data) {
            setTeacher(response.data);
          } else {
            setError('Teacher not found');
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError(handleApiError(error, 'Teacher Form'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isNew, params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setTeacher(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      if (!teacher.user_id) {
        throw new Error('Please select a user');
      }
      
      let response;
      
      if (isNew) {
        response = await api.teachers.create(teacher);
      } else {
        const { id, user, created_at, updated_at, ...updateData } = teacher as Teacher;
        response = await api.teachers.update(params.id, updateData);
      }
      
      if (!response.success) {
        throw new Error(response.error || `Failed to ${isNew ? 'create' : 'update'} teacher`);
      }
      
      setSuccess(`Teacher successfully ${isNew ? 'created' : 'updated'}`);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard/teachers');
      }, 1500);
      
    } catch (error) {
      console.error('Error saving teacher:', error);
      setError(handleApiError(error, 'Save Teacher'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link
          href="/dashboard/teachers"
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? 'Add New Teacher' : 'Edit Teacher'}
        </h1>
      </div>

      {error && (
        <div className="alert-danger mb-6">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="alert-success mb-6">
          <p>{success}</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="user_id" className="form-label">
                User <span className="text-danger-600">*</span>
              </label>
              <select
                id="user_id"
                name="user_id"
                className="form-input"
                value={teacher.user_id || ''}
                onChange={handleChange}
                required
                disabled={!isNew || saving}
              >
                <option value="">Select a user</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select a user with teacher role
              </p>
            </div>

            <div>
              <label htmlFor="employee_id" className="form-label">
                Employee ID
              </label>
              <input
                type="text"
                id="employee_id"
                name="employee_id"
                className="form-input"
                value={teacher.employee_id || ''}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div>
              <label htmlFor="department" className="form-label">
                Department
              </label>
              <input
                type="text"
                id="department"
                name="department"
                className="form-input"
                value={teacher.department || ''}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div>
              <label htmlFor="position" className="form-label">
                Position
              </label>
              <input
                type="text"
                id="position"
                name="position"
                className="form-input"
                value={teacher.position || ''}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div>
              <label htmlFor="hire_date" className="form-label">
                Hire Date
              </label>
              <input
                type="date"
                id="hire_date"
                name="hire_date"
                className="form-input"
                value={teacher.hire_date || ''}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div className="flex items-center h-full pt-6">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  className="form-checkbox"
                  checked={teacher.is_active}
                  onChange={handleChange}
                  disabled={saving}
                />
                <span className="ml-2">Active</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href="/dashboard/teachers"
              className="btn-outline"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner h-4 w-4 mr-2"></span>
                  Saving...
                </>
              ) : (
                'Save Teacher'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}