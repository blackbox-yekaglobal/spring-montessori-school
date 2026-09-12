'use client';

interface Stats {
  totalStudents: number;
  totalStaff: number;
  totalClasses: number;
  attendanceRate: number;
  presentToday: number;
  absentToday: number;
  totalExpected: number;
  totalPaid: number;
  collectionRate: number;
}

interface EnrollmentItem { name: string; enrolled: number; capacity: number; percentage: number; }
interface TrendItem { date: string; day: string; present: number; absent: number; rate: number; }
interface GenderData { male: number; female: number; total: number; }
interface StaffRole { role: string; count: number; }

export default function AnalyticsClient({
  stats, enrollment, attendanceTrend, activities, gender, staffRoles,
}: {
  stats: Stats;
  enrollment: EnrollmentItem[];
  attendanceTrend: TrendItem[];
  activities: { payments: any[]; students: any[]; announcements: any[] };
  gender: GenderData;
  staffRoles: StaffRole[];
}) {
  const maxTrend = Math.max(...attendanceTrend.map(t => t.present + t.absent), 1);

  return (
    <div className="space-y-6">
      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={stats.totalStudents.toString()} color="blue" />
        <StatCard label="Total Staff" value={stats.totalStaff.toString()} color="green" />
        <StatCard label="Total Classes" value={stats.totalClasses.toString()} color="purple" />
        <StatCard label="Attendance Today" value={`${stats.attendanceRate}%`} subtitle={`${stats.presentToday} present`} color="yellow" />
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm text-gray-500 mb-1">Total Expected</div>
          <div className="text-2xl font-bold text-gray-900">₦{stats.totalExpected.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm text-gray-500 mb-1">Total Collected</div>
          <div className="text-2xl font-bold text-green-600">₦{stats.totalPaid.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm text-gray-500 mb-1">Collection Rate</div>
          <div className="text-2xl font-bold text-blue-600">{stats.collectionRate}%</div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stats.collectionRate}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trend (7 Days)</h3>
          <div className="flex items-end gap-2 h-40">
            {attendanceTrend.map((day) => {
              const total = day.present + day.absent;
              const height = total > 0 ? (total / maxTrend) * 100 : 5;
              const presentHeight = total > 0 ? (day.present / total) * height : 0;
              const absentHeight = height - presentHeight;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center justify-end">
                  <div className="text-xs text-gray-500 mb-1">{day.rate}%</div>
                  <div className="w-full flex flex-col" style={{ height: `${Math.max(height, 5)}%` }}>
                    <div className="bg-red-300 rounded-t" style={{ height: `${absentHeight}%` }} />
                    <div className="bg-green-500 rounded-b" style={{ height: `${presentHeight}%` }} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{day.day}</div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded" /> Present</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-300 rounded" /> Absent</span>
          </div>
        </div>

        {/* Class Enrollment */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Enrollment</h3>
          <div className="space-y-3 max-h-52 overflow-y-auto">
            {enrollment.map(cls => (
              <div key={cls.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{cls.name}</span>
                  <span className="text-gray-500">{cls.enrolled}/{cls.capacity}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${cls.percentage > 90 ? 'bg-red-500' : cls.percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(cls.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {enrollment.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No classes configured yet.</p>}
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h3>
          {gender.total > 0 ? (
            <div>
              <div className="flex gap-4 mb-4">
                <div className="flex-1 text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{gender.male}</div>
                  <div className="text-sm text-blue-500">Male ({Math.round((gender.male / gender.total) * 100)}%)</div>
                </div>
                <div className="flex-1 text-center p-3 bg-pink-50 rounded-lg">
                  <div className="text-2xl font-bold text-pink-600">{gender.female}</div>
                  <div className="text-sm text-pink-500">Female ({Math.round((gender.female / gender.total) * 100)}%)</div>
                </div>
              </div>
              <div className="w-full bg-pink-200 rounded-full h-4 flex overflow-hidden">
                <div className="bg-blue-500 h-4" style={{ width: `${(gender.male / gender.total) * 100}%` }} />
                <div className="bg-pink-400 h-4" style={{ width: `${(gender.female / gender.total) * 100}%` }} />
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No students enrolled yet.</p>
          )}
        </div>

        {/* Staff by Role */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff by Role</h3>
          <div className="space-y-2">
            {staffRoles.map(r => (
              <div key={r.role} className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-700 capitalize">{r.role.replace('_', ' ')}</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{r.count}</span>
              </div>
            ))}
            {staffRoles.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No staff records yet.</p>}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActivityCard
          title="Recent Payments"
          items={activities.payments.map(p => ({
            text: `${p.students?.full_name || 'Unknown'} — ₦${Number(p.amount).toLocaleString()}`,
            sub: p.status,
            color: p.status === 'paid' ? 'text-green-600' : 'text-yellow-600',
          }))}
        />
        <ActivityCard
          title="New Students"
          items={activities.students.map(s => ({
            text: s.full_name,
            sub: s.admission_number,
            color: 'text-blue-600',
          }))}
        />
        <ActivityCard
          title="Recent Announcements"
          items={activities.announcements.map(a => ({
            text: a.title,
            sub: a.target_role ? `For: ${a.target_role.replace('_', ' ')}` : 'Everyone',
            color: 'text-purple-600',
          }))}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, subtitle, color }: { label: string; value: string; subtitle?: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'border-blue-500 bg-blue-50',
    green: 'border-green-500 bg-green-50',
    purple: 'border-purple-500 bg-purple-50',
    yellow: 'border-yellow-500 bg-yellow-50',
  };
  return (
    <div className={`bg-white rounded-lg shadow p-5 border-l-4 ${colors[color] || colors.blue}`}>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-3xl font-bold text-gray-900 mt-1">{value}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}

function ActivityCard({ title, items }: { title: string; items: { text: string; sub: string; color: string }[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
            <div>
              <div className="text-sm text-gray-900">{item.text}</div>
              <div className={`text-xs ${item.color}`}>{item.sub}</div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-500 text-center py-2">No activity yet.</p>}
      </div>
    </div>
  );
}
