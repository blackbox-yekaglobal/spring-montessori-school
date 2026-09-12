'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth/utils';
import { revalidatePath } from 'next/cache';

// ============ SCHOOL SETTINGS ============

export async function getSchoolSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('school_settings')
    .select('*')
    .limit(1)
    .single();
  return { data, error };
}

export async function updateSchoolSettings(formData: Record<string, unknown>) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('school_settings')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', formData.id as string);

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard');
  return { success: true, error: null };
}

// ============ ACADEMIC SESSIONS ============

export async function getAcademicSessions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('academic_sessions')
    .select('*')
    .order('start_date', { ascending: false });
  return { data: data || [], error };
}

export async function createAcademicSession(data: {
  name: string;
  start_date: string;
  end_date: string;
  is_active?: boolean;
}) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();

  // If setting as active, deactivate others first
  if (data.is_active) {
    await supabase.from('academic_sessions').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');
  }

  const { data: session, error } = await supabase
    .from('academic_sessions')
    .insert(data)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/sessions');
  return { success: true, error: null, data: session };
}

export async function updateAcademicSession(id: string, data: {
  name?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();

  if (data.is_active) {
    await supabase.from('academic_sessions').update({ is_active: false }).neq('id', id);
  }

  const { error } = await supabase
    .from('academic_sessions')
    .update(data)
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/sessions');
  return { success: true, error: null };
}

export async function deleteAcademicSession(id: string) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('academic_sessions').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/sessions');
  return { success: true, error: null };
}

// ============ TERMS ============

export async function getTerms(sessionId?: string) {
  const supabase = await createClient();
  let query = supabase.from('terms').select('*, academic_sessions(name)').order('term_number');
  if (sessionId) query = query.eq('session_id', sessionId);
  const { data, error } = await query;
  return { data: data || [], error };
}

export async function createTerm(data: {
  session_id: string;
  name: string;
  term_number: number;
  start_date: string;
  end_date: string;
  is_active?: boolean;
}) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();

  if (data.is_active) {
    await supabase.from('terms').update({ is_active: false }).eq('session_id', data.session_id);
  }

  const { data: term, error } = await supabase.from('terms').insert(data).select().single();
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/sessions');
  return { success: true, error: null, data: term };
}

export async function updateTerm(id: string, data: Record<string, unknown>) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();

  if (data.is_active && data.session_id) {
    await supabase.from('terms').update({ is_active: false })
      .eq('session_id', data.session_id as string).neq('id', id);
  }

  const { error } = await supabase.from('terms').update(data).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/sessions');
  return { success: true, error: null };
}

export async function deleteTerm(id: string) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('terms').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/sessions');
  return { success: true, error: null };
}

// ============ CLASSES ============

export async function getClasses(sessionId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('classes')
    .select('*, academic_sessions(name), staff:staff_id(full_name)')
    .order('class_level')
    .order('arm');
  if (sessionId) query = query.eq('session_id', sessionId);
  const { data, error } = await query;
  return { data: data || [], error };
}

export async function getClassById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('classes')
    .select('*, academic_sessions(name), staff:staff_id(full_name)')
    .eq('id', id)
    .single();
  return { data, error };
}

export async function createClass(data: {
  name: string;
  class_level: string;
  arm?: string;
  session_id: string;
  class_teacher_id?: string;
  capacity?: number;
  description?: string;
}) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { data: cls, error } = await supabase.from('classes').insert(data).select().single();
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/classes');
  return { success: true, error: null, data: cls };
}

export async function updateClass(id: string, data: Record<string, unknown>) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('classes').update(data).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/classes');
  return { success: true, error: null };
}

export async function deleteClass(id: string) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('classes').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/classes');
  return { success: true, error: null };
}

// ============ SUBJECTS ============

export async function getSubjects() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('name');
  return { data: data || [], error };
}

export async function createSubject(data: {
  name: string;
  code: string;
  description?: string;
}) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { data: subject, error } = await supabase.from('subjects').insert(data).select().single();
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/subjects');
  return { success: true, error: null, data: subject };
}

export async function updateSubject(id: string, data: Record<string, unknown>) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('subjects').update(data).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/subjects');
  return { success: true, error: null };
}

export async function deleteSubject(id: string) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('subjects').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/subjects');
  return { success: true, error: null };
}

// ============ CLASS-SUBJECTS ============

export async function getClassSubjects(classId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('class_subjects')
    .select('*, subjects(name, code)')
    .eq('class_id', classId);
  return { data: data || [], error };
}

export async function assignSubjectToClass(classId: string, subjectId: string) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('class_subjects')
    .insert({ class_id: classId, subject_id: subjectId });

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/classes');
  return { success: true, error: null };
}

export async function removeSubjectFromClass(classId: string, subjectId: string) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('class_subjects')
    .delete()
    .eq('class_id', classId)
    .eq('subject_id', subjectId);

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/classes');
  return { success: true, error: null };
}

// ============ STAFF LIST (for teacher assignment dropdowns) ============

export async function getStaffList() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('staff')
    .select('id, staff_id, full_name, role')
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('full_name');
  return { data: data || [], error };
}
