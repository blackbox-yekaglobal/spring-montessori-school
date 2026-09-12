'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth/utils';
import { revalidatePath } from 'next/cache';

// ============ ATTENDANCE ============

export async function getAttendanceByClass(classId: string, date: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('attendance_records')
    .select(`
      *,
      students(id, full_name, admission_number)
    `)
    .eq('class_id', classId)
    .eq('attendance_date', date)
    .order('students(full_name)');
  return { data: data || [], error };
}

export async function getStudentAttendance(studentId: string, startDate?: string, endDate?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('attendance_records')
    .select('*')
    .eq('student_id', studentId)
    .order('attendance_date', { ascending: false });

  if (startDate) query = query.gte('attendance_date', startDate);
  if (endDate) query = query.lte('attendance_date', endDate);

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function markAttendance(records: {
  student_id: string;
  class_id: string;
  attendance_date: string;
  status: string;
  notes?: string;
}[]) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin', 'teacher'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();

  // Upsert attendance records
  const { error } = await supabase
    .from('attendance_records')
    .upsert(records, {
      onConflict: 'student_id,attendance_date',
      ignoreDuplicates: false,
    });

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/attendance');
  return { success: true, error: null };
}

export async function getAttendanceSummary(classId: string, startDate: string, endDate: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('attendance_records')
    .select('student_id, status, attendance_date')
    .eq('class_id', classId)
    .gte('attendance_date', startDate)
    .lte('attendance_date', endDate);

  if (error) return { data: null, error: error.message };

  // Summarize
  const summary: Record<string, { present: number; absent: number; late: number; total: number }> = {};
  for (const record of data || []) {
    if (!summary[record.student_id]) {
      summary[record.student_id] = { present: 0, absent: 0, late: 0, total: 0 };
    }
    summary[record.student_id].total++;
    if (record.status === 'present') summary[record.student_id].present++;
    else if (record.status === 'absent') summary[record.student_id].absent++;
    else if (record.status === 'late') summary[record.student_id].late++;
  }

  return { data: summary, error: null };
}

// ============ TIMETABLE ============

export async function getTimetable(classId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('timetable_entries')
    .select(`
      *,
      subjects(name, code),
      staff(full_name)
    `)
    .eq('class_id', classId)
    .order('day_of_week')
    .order('start_time');
  return { data: data || [], error };
}

export async function createTimetableEntry(data: {
  class_id: string;
  subject_id: string;
  staff_id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room?: string;
}) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin', 'teacher'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { data: entry, error } = await supabase
    .from('timetable_entries')
    .insert(data)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/timetable');
  return { success: true, error: null, data: entry };
}

export async function updateTimetableEntry(id: string, data: Record<string, unknown>) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin', 'teacher'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('timetable_entries').update(data).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/timetable');
  return { success: true, error: null };
}

export async function deleteTimetableEntry(id: string) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('timetable_entries').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/timetable');
  return { success: true, error: null };
}

// ============ PAYMENTS ============

export async function getPayments(filters?: {
  student_id?: string;
  status?: string;
  session_id?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from('payments')
    .select(`
      *,
      students(full_name, admission_number)
    `)
    .order('payment_date', { ascending: false });

  if (filters?.student_id) query = query.eq('student_id', filters.student_id);
  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.session_id) query = query.eq('session_id', filters.session_id);

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function createPayment(data: {
  student_id: string;
  session_id: string;
  amount: number;
  payment_type: string;
  payment_method: string;
  reference_number?: string;
  description?: string;
  due_date?: string;
}) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { data: payment, error } = await supabase
    .from('payments')
    .insert(data)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/payments');
  return { success: true, error: null, data: payment };
}

export async function updatePaymentStatus(id: string, status: string, receiptUrl?: string) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const updateData: Record<string, unknown> = { status };
  if (status === 'paid') updateData.paid_at = new Date().toISOString();
  if (receiptUrl) updateData.receipt_url = receiptUrl;

  const { error } = await supabase.from('payments').update(updateData).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/payments');
  return { success: true, error: null };
}

export async function getPaymentSummary(sessionId?: string) {
  const supabase = await createClient();
  let query = supabase.from('payments').select('amount, status');
  if (sessionId) query = query.eq('session_id', sessionId);

  const { data, error } = await query;
  if (error) return { data: null, error: error.message };

  let totalExpected = 0;
  let totalPaid = 0;
  let totalPending = 0;
  let totalOverdue = 0;

  for (const p of data || []) {
    totalExpected += Number(p.amount);
    if (p.status === 'paid') totalPaid += Number(p.amount);
    else if (p.status === 'pending') totalPending += Number(p.amount);
    else if (p.status === 'overdue') totalOverdue += Number(p.amount);
  }

  return {
    data: { totalExpected, totalPaid, totalPending, totalOverdue },
    error: null,
  };
}
