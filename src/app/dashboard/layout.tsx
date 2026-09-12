import { getCurrentProfile } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role={profile.role} userName={profile.full_name} />
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{profile.email}</span>
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
