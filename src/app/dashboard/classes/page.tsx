import { getClasses, getAcademicSessions, getStaffList } from '@/lib/actions/academic';
import { isAdmin } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';
import ClassesManager from './ClassesManager';

export default async function ClassesPage() {
  const admin = await isAdmin();
  if (!admin) redirect('/dashboard');

  const [classesResult, sessionsResult, staffResult] = await Promise.all([
    getClasses(),
    getAcademicSessions(),
    getStaffList(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
        <p className="text-gray-600 mt-1">Manage classes, arms, and class teacher assignments</p>
      </div>

      <ClassesManager
        classes={classesResult.data || []}
        sessions={sessionsResult.data || []}
        staff={staffResult.data || []}
      />
    </div>
  );
}
