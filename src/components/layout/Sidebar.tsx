'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/lib/auth/actions';
import { AppRole } from '@/types/database';

interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

const navConfig: Record<AppRole, NavItem[]> = {
  super_admin: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Students', href: '/dashboard/students' },
    { label: 'Staff', href: '/dashboard/staff' },
    { label: 'Classes', href: '/dashboard/classes' },
    { label: 'Subjects', href: '/dashboard/subjects' },
    { label: 'Sessions & Terms', href: '/dashboard/sessions' },
    { label: 'Attendance', href: '/dashboard/attendance' },
    { label: 'Payments', href: '/dashboard/payments' },
    { label: 'Timetable', href: '/dashboard/timetable' },
    { label: 'Assignments', href: '/dashboard/assignments' },
    { label: 'Notes', href: '/dashboard/notes' },
    { label: 'CBT', href: '/dashboard/cbt' },
    { label: 'Results', href: '/dashboard/results' },
    { label: 'Analytics', href: '/dashboard/analytics' },
    { label: 'Announcements', href: '/dashboard/announcements' },
    { label: 'Notifications', href: '/dashboard/notifications' },
    { label: 'ID Cards', href: '/super-admin/id-cards' },
    { label: 'Scratch Cards', href: '/super-admin/scratch-cards' },
    { label: 'Audit Logs', href: '/super-admin/audit-logs' },
    { label: 'System Settings', href: '/super-admin/system-settings' },
  ],
  school_admin: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Students', href: '/dashboard/students' },
    { label: 'Staff', href: '/dashboard/staff' },
    { label: 'Classes', href: '/dashboard/classes' },
    { label: 'Subjects', href: '/dashboard/subjects' },
    { label: 'Sessions & Terms', href: '/dashboard/sessions' },
    { label: 'Attendance', href: '/dashboard/attendance' },
    { label: 'Payments', href: '/dashboard/payments' },
    { label: 'Timetable', href: '/dashboard/timetable' },
    { label: 'Assignments', href: '/dashboard/assignments' },
    { label: 'Notes', href: '/dashboard/notes' },
    { label: 'CBT', href: '/dashboard/cbt' },
    { label: 'Results', href: '/dashboard/results' },
    { label: 'Analytics', href: '/dashboard/analytics' },
    { label: 'Announcements', href: '/dashboard/announcements' },
    { label: 'Notifications', href: '/dashboard/notifications' },
    { label: 'Audit Logs', href: '/super-admin/audit-logs' },
    // NOTE: ID Cards and Scratch Cards are intentionally excluded
  ],
  teacher: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'My Classes', href: '/dashboard/my-classes' },
    { label: 'My Subjects', href: '/dashboard/my-subjects' },
    { label: 'Students', href: '/dashboard/students' },
    { label: 'Attendance', href: '/dashboard/attendance' },
    { label: 'Assignments', href: '/dashboard/assignments' },
    { label: 'Notes', href: '/dashboard/notes' },
    { label: 'Question Bank', href: '/dashboard/question-bank' },
    { label: 'CBT', href: '/dashboard/cbt' },
    { label: 'Results', href: '/dashboard/results' },
    { label: 'Timetable', href: '/dashboard/timetable' },
    { label: 'Announcements', href: '/dashboard/announcements' },
    { label: 'Notifications', href: '/dashboard/notifications' },
  ],
  student_parent: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'My Children', href: '/dashboard/my-children' },
    { label: 'Timetable', href: '/dashboard/timetable' },
    { label: 'Assignments', href: '/dashboard/assignments' },
    { label: 'Notes', href: '/dashboard/notes' },
    { label: 'CBT', href: '/dashboard/cbt' },
    { label: 'Results', href: '/dashboard/results' },
    { label: 'Attendance', href: '/dashboard/attendance' },
    { label: 'Payments', href: '/dashboard/payments' },
    { label: 'Announcements', href: '/dashboard/announcements' },
    { label: 'Notifications', href: '/dashboard/notifications' },
  ],
};

const roleLabels: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  school_admin: 'School Admin',
  teacher: 'Teacher',
  student_parent: 'Student / Parent',
};

interface SidebarProps {
  role: AppRole;
  userName: string;
}

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const navItems = navConfig[role] || [];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Logo / School Name */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-lg font-bold">Spring Montessori</h1>
        <p className="text-xs text-gray-400 mt-1">{roleLabels[role]}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-sm text-gray-300 truncate">{userName}</p>
        <form action={signOut}>
          <button
            type="submit"
            className="mt-2 w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
