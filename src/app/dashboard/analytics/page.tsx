import { getDashboardStats, getClassEnrollment, getAttendanceTrend, getRecentActivities, getGenderDistribution, getStaffByRole } from '@/lib/actions/analytics';
import AnalyticsClient from './AnalyticsClient';

export default async function AnalyticsPage() {
  const [stats, enrollment, attendanceTrend, activities, gender, staffRoles] = await Promise.all([
    getDashboardStats(),
    getClassEnrollment(),
    getAttendanceTrend(7),
    getRecentActivities(),
    getGenderDistribution(),
    getStaffByRole(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">School performance overview and insights</p>
      </div>
      <AnalyticsClient
        stats={stats}
        enrollment={enrollment}
        attendanceTrend={attendanceTrend}
        activities={activities}
        gender={gender}
        staffRoles={staffRoles}
      />
    </div>
  );
}
