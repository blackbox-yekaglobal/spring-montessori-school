import { getIDCards, generateIDCards } from '@/lib/actions/results';
import { getClasses } from '@/lib/actions/academic';
import { getAcademicSessions } from '@/lib/actions/academic';
import IDCardManager from './IDCardManager';

export default async function IDCardsPage() {
  const [cardsResult, classesResult, sessionsResult] = await Promise.all([
    getIDCards(),
    getClasses(),
    getAcademicSessions(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ID Card Management</h1>
        <p className="text-gray-600 mt-1">Generate and manage student ID cards</p>
      </div>
      <IDCardManager
        cards={cardsResult.data || []}
        classes={(classesResult as any)?.data || classesResult || []}
        sessions={(sessionsResult as any)?.data || sessionsResult || []}
      />
    </div>
  );
}
