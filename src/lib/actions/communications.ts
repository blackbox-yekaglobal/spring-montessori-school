'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth/utils';
import { revalidatePath } from 'next/cache';

// ============ ASSIGNMENTS ============

export async function getAssignments(filters?: {
  class_id?: string;
  subject_id?: string;
  staff_id?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from('assignments')
    .select(`
      *,
      classes(name),
      subjects(name, code),
      staff(full_name)
    `)
    .order('due_date', { ascending: false });

  if (filters?.class_id) query = query.eq('class_id', filters.class_id);
  if (filters?.subject_id) query = query.eq('subject_id', filters.subject_id);
  if (filters?.staff_id) query = query.eq('staff_id', filters.staff_id);

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function createAssignment(data: {
  title: string;
  description?: string;
  class_id: string;
  subject_id: string;
  staff_id: string;
  due_date: string;
  max_score?: number;
  instructions?: string;
}) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin', 'teacher'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { data: assignment, error } = await supabase
    .from('assignments')
    .insert(data)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/assignments');
  return { success: true, error: null, data: assignment };
}

export async function updateAssignment(id: string, data: Record<string, unknown>) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin', 'teacher'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('assignments').update(data).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/assignments');
  return { success: true, error: null };
}

export async function deleteAssignment(id: string) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin', 'teacher'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('assignments').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/assignments');
  return { success: true, error: null };
}

// ============ NOTES ============

export async function getNotes(filters?: {
  class_id?: string;
  subject_id?: string;
  staff_id?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from('notes')
    .select(`
      *,
      classes(name),
      subjects(name, code),
      staff(full_name)
    `)
    .order('created_at', { ascending: false });

  if (filters?.class_id) query = query.eq('class_id', filters.class_id);
  if (filters?.subject_id) query = query.eq('subject_id', filters.subject_id);
  if (filters?.staff_id) query = query.eq('staff_id', filters.staff_id);

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function createNote(data: {
  title: string;
  content: string;
  class_id: string;
  subject_id: string;
  staff_id: string;
  note_type?: string;
  file_url?: string;
}) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin', 'teacher'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { data: note, error } = await supabase
    .from('notes')
    .insert(data)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/notes');
  return { success: true, error: null, data: note };
}

export async function updateNote(id: string, data: Record<string, unknown>) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin', 'teacher'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('notes').update(data).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/notes');
  return { success: true, error: null };
}

export async function deleteNote(id: string) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin', 'teacher'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/notes');
  return { success: true, error: null };
}

// ============ ANNOUNCEMENTS ============

export async function getAnnouncements(filters?: {
  target_role?: string;
  is_pinned?: boolean;
}) {
  const supabase = await createClient();
  let query = supabase
    .from('announcements')
    .select(`
      *,
      profiles:author_id(full_name)
    `)
    .order('created_at', { ascending: false });

  if (filters?.target_role) query = query.eq('target_role', filters.target_role);
  if (filters?.is_pinned !== undefined) query = query.eq('is_pinned', filters.is_pinned);

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function createAnnouncement(data: {
  title: string;
  content: string;
  target_role?: string;
  is_pinned?: boolean;
  expires_at?: string;
}) {
  const profile = await getCurrentProfile();
  if (!profile) return { success: false, error: 'Not authenticated' };

  const supabase = await createClient();
  const { data: announcement, error } = await supabase
    .from('announcements')
    .insert({
      ...data,
      author_id: profile.id,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/announcements');
  return { success: true, error: null, data: announcement };
}

export async function updateAnnouncement(id: string, data: Record<string, unknown>) {
  const profile = await getCurrentProfile();
  if (!profile) return { success: false, error: 'Not authenticated' };

  const supabase = await createClient();
  const { error } = await supabase.from('announcements').update(data).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/announcements');
  return { success: true, error: null };
}

export async function deleteAnnouncement(id: string) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('announcements').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/announcements');
  return { success: true, error: null };
}
