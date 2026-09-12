'use client';

import { useState } from 'react';
import { deactivateStaff, softDeleteStaff } from '@/lib/actions/staff';
import { isSuperAdmin } from '@/lib/auth/utils';

interface StaffMember {
  id: string;
  staff_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: string;
  department: string | null;
  qualification: string | null;
  is_active: boolean;
  user_id: string | null;
  staff_profiles?: { full_name: string; email: string } | null;
}

const roleColors: Record<string, string> = {
  teacher: 'bg-blue-100 text-blue-800',
  non_teaching: 'bg-gray-100 text-gray-800',
  admin: 'bg-purple-100 text-purple-800',
  principal: 'bg-indigo-100 text-indigo-800',
  vice_principal: 'bg-indigo-100 text-indigo-800',
  librarian: 'bg-green-100 text-green-800',
  nurse: 'bg-red-100 text-red-800',
  accountant: 'bg-yellow-100 text-yellow-800',
  security: 'bg-orange-100 text-orange-800',
  driver: 'bg-teal-100 text-teal-800',
  cleaner: 'bg-pink-100 text-pink-800',
};

export default function StaffListClient({ staff: initialStaff }: { staff: StaffMember[] }) {
  const [staff, setStaff] = useState(initialStaff);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filtered = staff.filter(s => {
    const matchesSearch = !search ||
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.staff_id.toLowerCase().includes(search.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = !roleFilter || s.role === roleFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && s.is_active) ||
      (statusFilter === 'inactive' && !s.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  async function handleDeactivate(id: string) {
    if (!confirm('Deactivate this staff member?')) return;
    setLoading(true);
    const result = await deactivateStaff(id);
    if (result.error) {
      setError(result.error);
    } else {
      setStaff(staff.map(s => s.id === id ? { ...s, is_active: false } : s));
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this staff record? This is a soft delete and can be restored by super admin.')) return;
    setLoading(true);
    const result = await softDeleteStaff(id);
    if (result.error) {
      setError(result.error);
    } else {
      setStaff(staff.filter(s => s.id !== id));
    }
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name, ID, or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
        />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
          <option value="">All Roles</option>
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map(member => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{member.staff_id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                      {member.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{member.full_name}</div>
                      {member.department && <div className="text-xs text-gray-500">{member.department}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[member.role] || 'bg-gray-100 text-gray-800'}`}>
                    {member.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.phone || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {member.is_active ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Inactive</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {member.user_id ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Created</span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <a href={`/dashboard/staff/${member.id}`} className="text-blue-600 hover:text-blue-900">Edit</a>
                  {member.is_active && (
                    <button onClick={() => handleDeactivate(member.id)} disabled={loading} className="text-yellow-600 hover:text-yellow-900">Deactivate</button>
                  )}
                  <button onClick={() => handleDelete(member.id)} disabled={loading} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                {staff.length === 0 ? 'No staff records yet.' : 'No staff match your filters.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 border-t border-gray-200 text-sm text-gray-500">
        Showing {filtered.length} of {staff.length} staff members
      </div>
    </div>
  );
}
