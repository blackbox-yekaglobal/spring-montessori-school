'use client';

import { useState } from 'react';
import { softDeleteStudent } from '@/lib/actions/students';
import { AppRole } from '@/types/database';

interface Student {
  id: string;
  admission_number: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  is_active: boolean;
  current_class_id: string | null;
  classes?: { name: string; class_level: string; arm: string | null } | null;
}

interface ClassItem {
  id: string;
  name: string;
  class_level: string;
  arm: string | null;
}

export default function StudentListClient({
  students: initialStudents,
  classes,
  userRole,
}: {
  students: Student[];
  classes: ClassItem[];
  userRole: AppRole;
}) {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = userRole === 'super_admin' || userRole === 'school_admin';

  const filtered = students.filter(s => {
    const matchesSearch = !search ||
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(search.toLowerCase());
    const matchesClass = !classFilter || s.current_class_id === classFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && s.is_active) ||
      (statusFilter === 'inactive' && !s.is_active);
    return matchesSearch && matchesClass && matchesStatus;
  });

  async function handleDelete(id: string) {
    if (!confirm('Delete this student record? This is a soft delete.')) return;
    setLoading(true);
    const result = await softDeleteStudent(id);
    if (result.error) {
      setError(result.error);
    } else {
      setStudents(students.filter(s => s.id !== id));
    }
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap gap-3">
        <input type="text" placeholder="Search by name or admission no..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
          <option value="">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
          <button onClick={() => setError('')} className="ml-2 font-bold">&times;</button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adm No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DOB</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              {isAdmin && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map(student => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{student.admission_number}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium text-sm">
                      {student.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-900">{student.full_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{student.gender}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(student.date_of_birth).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.classes?.name || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.is_active ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Inactive</span>
                  )}
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <a href={`/dashboard/students/${student.id}`} className="text-blue-600 hover:text-blue-900">Edit</a>
                    {userRole === 'super_admin' && (
                      <button onClick={() => handleDelete(student.id)} disabled={loading} className="text-red-600 hover:text-red-900">Delete</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={isAdmin ? 7 : 6} className="px-6 py-8 text-center text-sm text-gray-500">
                {students.length === 0 ? 'No students yet.' : 'No students match your filters.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 border-t border-gray-200 text-sm text-gray-500">
        Showing {filtered.length} of {students.length} students
      </div>
    </div>
  );
}
