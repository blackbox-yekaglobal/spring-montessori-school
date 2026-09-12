import { getClasses } from '@/lib/actions/academic';
import { isAdmin } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';
import StudentForm from '../StudentForm';

export default async function NewStudentPage() {
  const admin = await isAdmin();
  if (!admin) redirect('/dashboard');

  const classesResult = await getClasses();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
        <p className="text-gray-600 mt-1">Create a new student record</p>
      </div>
      <StudentForm classes={classesResult.data || []} />
    </div>
  );
}
