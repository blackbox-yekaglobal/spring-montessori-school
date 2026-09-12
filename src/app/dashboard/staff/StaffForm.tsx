'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createStaff, updateStaff } from '@/lib/actions/staff';

interface StaffFormProps {
  staff?: {
    id: string;
    staff_id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    role: string;
    department: string | null;
    qualification: string | null;
    date_of_birth: string | null;
    date_of_joining: string | null;
    address: string | null;
    gender: string | null;
    photo_url: string | null;
    is_active: boolean;
  };
  isEdit?: boolean;
}

export default function StaffForm({ staff, isEdit = false }: StaffFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    staff_id: staff?.staff_id || '',
    full_name: staff?.full_name || '',
    email: staff?.email || '',
    phone: staff?.phone || '',
    role: staff?.role || 'teacher',
    department: staff?.department || '',
    qualification: staff?.qualification || '',
    date_of_birth: staff?.date_of_birth || '',
    date_of_joining: staff?.date_of_joining || '',
    address: staff?.address || '',
    gender: staff?.gender || '',
  });

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload: Record<string, string | null> = {};
    for (const [key, value] of Object.entries(formData)) {
      payload[key] = value || null;
    }

    let result;
    if (isEdit && staff) {
      result = await updateStaff(staff.id, payload);
    } else {
      result = await createStaff(payload as Parameters<typeof createStaff>[0]);
    }

    if (result.error) {
      setError(result.error);
    } else {
      router.push('/dashboard/staff');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
          <button onClick={() => setError('')} className="ml-2 font-bold">&times;</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Staff ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Staff ID *</label>
          <input type="text" value={formData.staff_id} onChange={e => handleChange('staff_id', e.target.value)} required
            disabled={isEdit}
            placeholder="e.g. STF-001"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2 disabled:bg-gray-100" />
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name *</label>
          <input type="text" value={formData.full_name} onChange={e => handleChange('full_name', e.target.value)} required
            placeholder="e.g. John Doe"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)}
            placeholder="e.g. john@school.com"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)}
            placeholder="e.g. 08012345678"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Role *</label>
          <select value={formData.role} onChange={e => handleChange('role', e.target.value)} required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
            <option value="teacher">Teacher</option>
            <option value="non_teaching">Non-Teaching</option>
            <option value="admin">Admin</option>
            <option value="principal">Principal</option>
            <option value="vice_principal">Vice Principal</option>
            <option value="librarian">Librarian</option>
            <option value="nurse">Nurse</option>
            <option value="accountant">Accountant</option>
            <option value="security">Security</option>
            <option value="driver">Driver</option>
            <option value="cleaner">Cleaner</option>
          </select>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select value={formData.gender} onChange={e => handleChange('gender', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <input type="text" value={formData.department} onChange={e => handleChange('department', e.target.value)}
            placeholder="e.g. Science"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
        </div>

        {/* Qualification */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Qualification</label>
          <input type="text" value={formData.qualification} onChange={e => handleChange('qualification', e.target.value)}
            placeholder="e.g. B.Ed, M.Sc"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input type="date" value={formData.date_of_birth} onChange={e => handleChange('date_of_birth', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
        </div>

        {/* Date of Joining */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Joining</label>
          <input type="date" value={formData.date_of_joining} onChange={e => handleChange('date_of_joining', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
        </div>

        {/* Address */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <textarea value={formData.address} onChange={e => handleChange('address', e.target.value)} rows={2}
            placeholder="Home address"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <button type="submit" disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Saving...' : isEdit ? 'Update Staff' : 'Create Staff'}
        </button>
        <button type="button" onClick={() => router.push('/dashboard/staff')}
          className="px-6 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300">
          Cancel
        </button>
      </div>
    </form>
  );
}
