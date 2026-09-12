import { isAdmin } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';
import StaffForm from '../StaffForm';

export default async function NewStaffPage() {
  const admin = await isAdmin();
  if (!admin) redirect('/dashboard');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Staff</h1>
        <p className="text-gray-600 mt-1">Create a new staff record</p>
      </div>
      <StaffForm />
    </div>
  );
}
