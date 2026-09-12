import { getSchoolSettings, getAcademicSessions, getTerms } from '@/lib/actions/academic';
import SystemSettingsForm from './SystemSettingsForm';

export default async function SystemSettingsPage() {
  const [settings, sessions, terms] = await Promise.all([
    getSchoolSettings(),
    getAcademicSessions(),
    getTerms(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-1">Configure school-wide system settings</p>
      </div>
      <SystemSettingsForm
        settings={(settings as any)?.data || settings}
        sessions={(sessions as any)?.data || sessions || []}
        terms={(terms as any)?.data || terms || []}
      />
    </div>
  );
}
