import { getAcademicSessions, getTerms } from '@/lib/actions/academic';
import { isAdmin } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';
import SessionsManager from './SessionsManager';

export default async function SessionsPage() {
  const admin = await isAdmin();
  if (!admin) redirect('/dashboard');

  const [sessionsResult, termsResult] = await Promise.all([
    getAcademicSessions(),
    getTerms(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Academic Sessions & Terms</h1>
        <p className="text-gray-600 mt-1">Manage academic sessions and their terms</p>
      </div>

      <SessionsManager
        sessions={sessionsResult.data || []}
        terms={termsResult.data || []}
      />
    </div>
  );
}
