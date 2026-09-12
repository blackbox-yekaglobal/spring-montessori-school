import { getStaffById } from '@/lib/actions/staff';
import { isAdmin, isSuperAdmin } from '@/lib/auth/utils';
import { redirect, notFound } from 'next/navigation';
import StaffForm from '../StaffForm';
import CreateAccountButton from './CreateAccountButton';

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await isAdmin();
  if (!admin) redirect('/dashboard');

  const { id } = await params;
  const { data: staff, error } = await getStaffById(id);

  if (error || !staff) {
    notFound();
  }

  const superAdmin = await isSuperAdmin();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Staff: {staff.full_name}</h1>
        <p className="text-gray-600 mt-1">Staff ID: {staff.staff_id}</p>
      </div>

      <StaffForm staff={staff} isEdit />

      {/* Create User Account section (super admin only) */}
      {superAdmin && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Account</h2>
          {staff.user_id ? (
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Account Created
              </span>
              <span className="text-sm text-gray-500">User ID: {staff.user_id}</span>
            </div>
          ) : (
            <CreateAccountButton staffId={staff.id} staffName={staff.full_name} />
          )}
        </div>
      )}
    </div>
  );
}
