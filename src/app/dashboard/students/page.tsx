import { getStudentList } from '@/lib/actions/students';
import { getClasses } from '@/lib/actions/academic';
import { getCurrentProfile } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';
import StudentListClient from './StudentListClient';

export default async function StudentsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login');

  // All roles can access students page
  const [studentsResult, classesResult] = await Promise.all([
    getStudentList(),
    getClasses(),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600 mt-1">Manage student records, enrollment, and parent linking</p>
        </div>
        {(profile.role === 'super_admin' || profile.role === 'school_admin') && (
          <a href="/dashboard/students/new"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
            + Add Student
          </a>
        )}
      </div>

      <StudentListClient
        students={studentsResult.data || []}
        classes={classesResult.data || []}
        userRole={profile.role}
      />
    </div>
  );
}
