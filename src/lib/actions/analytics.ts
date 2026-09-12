'use server';

import { createClient } from '@/lib/supabase/server';

export async function getDashboardStats() {
  const supabase = await createClient();

  const [
    studentsRes,
    staffRes,
    classesRes,
    attendanceRes,
    paymentsRes,
  ] = await Promise.all([
    supabase.from('students').select('id', { count: 'exact', head: true }).is('deleted_at', null).eq('is_active', true),
    supabase.from('staff').select('id', { count: 'exact', head: true }).is('deleted_at', null).eq('is_active', true),
    supabase.from('classes').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('attendance_records')
      .select('status')
      .eq('attendance_date', new Date().toISOString().split('T')[0]),
    supabase.from('payments').select('amount, status'),
  ]);

  // Attendance calculations
  const todayAttendance = attendanceRes.data || [];
  const presentCount = todayAttendance.filter(r => r.status === 'present').length;
  const totalToday = todayAttendance.length;
  const attendanceRate = totalToday > 0 ? Math.round((presentCount / totalToday) * 100) : 0;

  // Payment calculations
  const payments = paymentsRes.data || [];
  const totalExpected = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const collectionRate = totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0;

  return {
    totalStudents: studentsRes.count || 0,
    totalStaff: staffRes.count || 0,
    totalClasses: classesRes.count || 0,
    attendanceRate,
    presentToday: presentCount,
    absentToday: totalToday - presentCount,
    totalExpected,
    totalPaid,
    collectionRate,
  };
}

export async function getClassEnrollment() {
  const supabase = await createClient();
  const { data: classes } = await supabase
    .from('classes')
    .select('id, name, capacity')
    .eq('is_active', true)
    .order('class_level');

  if (!classes) return [];

  const result = [];
  for (const cls of classes) {
    const { count } = await supabase
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('current_class_id', cls.id)
      .is('deleted_at', null)
      .eq('is_active', true);

    result.push({
      name: cls.name,
      enrolled: count || 0,
      capacity: cls.capacity || 40,
      percentage: cls.capacity ? Math.round(((count || 0) / cls.capacity) * 100) : 0,
    });
  }
  return result;
}

export async function getAttendanceTrend(days: number = 7) {
  const supabase = await createClient();
  const trend = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const { data } = await supabase
      .from('attendance_records')
      .select('status')
      .eq('attendance_date', dateStr);

    const records = data || [];
    const present = records.filter(r => r.status === 'present').length;
    const total = records.length;

    trend.push({
      date: dateStr,
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      present,
      absent: total - present,
      rate: total > 0 ? Math.round((present / total) * 100) : 0,
    });
  }
  return trend;
}

export async function getRecentActivities() {
  const supabase = await createClient();

  const [recentPayments, recentStudents, recentAnnouncements] = await Promise.all([
    supabase.from('payments')
      .select('amount, status, payment_date, students(full_name)')
      .order('payment_date', { ascending: false })
      .limit(5),
    supabase.from('students')
      .select('full_name, admission_number, created_at')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('announcements')
      .select('title, created_at, target_role')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  return {
    payments: recentPayments.data || [],
    students: recentStudents.data || [],
    announcements: recentAnnouncements.data || [],
  };
}

export async function getGenderDistribution() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('students')
    .select('gender')
    .is('deleted_at', null)
    .eq('is_active', true);

  const records = data || [];
  const male = records.filter(r => r.gender === 'male').length;
  const female = records.filter(r => r.gender === 'female').length;
  return { male, female, total: records.length };
}

export async function getStaffByRole() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('staff')
    .select('role')
    .is('deleted_at', null)
    .eq('is_active', true);

  const records = data || [];
  const grouped: Record<string, number> = {};
  records.forEach(r => {
    grouped[r.role] = (grouped[r.role] || 0) + 1;
  });
  return Object.entries(grouped).map(([role, count]) => ({ role, count }));
}
