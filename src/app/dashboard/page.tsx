import { getCurrentProfile } from '@/lib/auth/utils';

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  const roleGreeting: Record<string, string> = {
    super_admin: 'Welcome, Super Admin',
    school_admin: 'Welcome, Admin',
    teacher: 'Welcome, Teacher',
    student_parent: 'Welcome',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {roleGreeting[profile?.role || 'student_parent']}
      </h1>
      <p className="text-gray-600 mb-8">Spring Montessori School Management System</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
          <p className="text-xs text-gray-400 mt-1">Enrolled this session</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Staff</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
          <p className="text-xs text-gray-400 mt-1">Active staff members</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Classes</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
          <p className="text-xs text-gray-400 mt-1">Active classes</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Attendance Today</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">--%</p>
          <p className="text-xs text-gray-400 mt-1">Present rate</p>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/dashboard/students" className="text-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <p className="text-sm font-medium text-blue-700">Students</p>
          </a>
          <a href="/dashboard/attendance" className="text-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <p className="text-sm font-medium text-green-700">Attendance</p>
          </a>
          <a href="/dashboard/results" className="text-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <p className="text-sm font-medium text-purple-700">Results</p>
          </a>
          <a href="/dashboard/announcements" className="text-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
            <p className="text-sm font-medium text-orange-700">Announcements</p>
          </a>
        </div>
      </div>
    </div>
  );
}
