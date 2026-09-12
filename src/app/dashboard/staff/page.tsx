import { getStaffList } from '@/lib/actions/staff';
import { isAdmin } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';
import StaffListClient from './StaffListClient';

export default async function StaffPage() {
  const admin = await isAdmin();
  if (!admin) redirect('/dashboard');

  const staffResult = await getStaffList();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-1">Manage school staff records and user accounts</p>
        </div>
        <a
          href="/dashboard/staff/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          + Add Staff
        </a>
      </div>

      <StaffListClient staff={staffResult.data || []} />
    </div>
  );
}
