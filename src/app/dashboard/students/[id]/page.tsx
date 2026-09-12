import { getStudentById } from '@/lib/actions/students';
import { getClasses } from '@/lib/actions/academic';
import { isAdmin } from '@/lib/auth/utils';
import { redirect, notFound } from 'next/navigation';
import StudentForm from '../StudentForm';

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await isAdmin();
  if (!admin) redirect('/dashboard');

  const { id } = await params;
  const [studentResult, classesResult] = await Promise.all([
    getStudentById(id),
    getClasses(),
  ]);

  if (studentResult.error || !studentResult.data) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Student: {studentResult.data.full_name}</h1>
        <p className="text-gray-600 mt-1">Admission No: {studentResult.data.admission_number}</p>
      </div>
      <StudentForm
        student={studentResult.data}
        classes={classesResult.data || []}
        isEdit
      />
    </div>
  );
}
