'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createStudent, updateStudent } from '@/lib/actions/students';

interface ClassItem {
  id: string;
  name: string;
}

interface StudentFormProps {
  student?: {
    id: string;
    admission_number: string;
    full_name: string;
    date_of_birth: string;
    gender: string;
    current_class_id: string | null;
    parent_name: string | null;
    parent_phone: string | null;
    parent_email: string | null;
    address: string | null;
    blood_group: string | null;
    genotype: string | null;
  };
  classes: ClassItem[];
  isEdit?: boolean;
}

export default function StudentForm({ student, classes, isEdit = false }: StudentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    admission_number: student?.admission_number || '',
    full_name: student?.full_name || '',
    date_of_birth: student?.date_of_birth || '',
    gender: student?.gender || '',
    current_class_id: student?.current_class_id || '',
    parent_name: student?.parent_name || '',
    parent_phone: student?.parent_phone || '',
    parent_email: student?.parent_email || '',
    address: student?.address || '',
    blood_group: student?.blood_group || '',
    genotype: student?.genotype || '',
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
    if (isEdit && student) {
      result = await updateStudent(student.id, payload);
    } else {
      result = await createStudent(payload as Parameters<typeof createStudent>[0]);
    }

    if (result.error) {
      setError(result.error);
    } else {
      router.push('/dashboard/students');
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

      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Student Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Admission Number *</label>
          <input type="text" value={formData.admission_number} onChange={e => handleChange('admission_number', e.target.value)} required
            disabled={isEdit} placeholder="e.g. ADM-2026-001"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2 disabled:bg-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name *</label>
          <input type="text" value={formData.full_name} onChange={e => handleChange('full_name', e.target.value)} required
            placeholder="e.g. Jane Doe"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
          <input type="date" value={formData.date_of_birth} onChange={e => handleChange('date_of_birth', e.target.value)} required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Gender *</label>
          <select value={formData.gender} onChange={e => handleChange('gender', e.target.value)} required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Class</label>
          <select value={formData.current_class_id} onChange={e => handleChange('current_class_id', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
            <option value="">None</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Blood Group</label>
          <select value={formData.blood_group} onChange={e => handleChange('blood_group', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
            <option value="">Unknown</option>
            <option value="A+">A+</option><option value="A-">A-</option>
            <option value="B+">B+</option><option value="B-">B-</option>
            <option value="AB+">AB+</option><option value="AB-">AB-</option>
            <option value="O+">O+</option><option value="O-">O-</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Genotype</label>
          <select value={formData.genotype} onChange={e => handleChange('genotype', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
            <option value="">Unknown</option>
            <option value="AA">AA</option><option value="AS">AS</option>
            <option value="SS">SS</option><option value="AC">AC</option>
            <option value="SC">SC</option>
          </select>
        </div>
      </div>

      <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Parent / Guardian Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Parent Name</label>
          <input type="text" value={formData.parent_name} onChange={e => handleChange('parent_name', e.target.value)}
            placeholder="e.g. Mr. John Doe"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Parent Phone</label>
          <input type="tel" value={formData.parent_phone} onChange={e => handleChange('parent_phone', e.target.value)}
            placeholder="e.g. 08012345678"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Parent Email</label>
          <input type="email" value={formData.parent_email} onChange={e => handleChange('parent_email', e.target.value)}
            placeholder="e.g. parent@email.com"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700">Home Address</label>
          <textarea value={formData.address} onChange={e => handleChange('address', e.target.value)} rows={2}
            placeholder="Home address"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t">
        <button type="submit" disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Saving...' : isEdit ? 'Update Student' : 'Create Student'}
        </button>
        <button type="button" onClick={() => router.push('/dashboard/students')}
          className="px-6 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300">
          Cancel
        </button>
      </div>
    </form>
  );
}
