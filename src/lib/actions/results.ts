'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth/utils';
import { revalidatePath } from 'next/cache';

// ============ RESULTS ============

export async function getResults(filters?: {
  student_id?: string;
  class_id?: string;
  session_id?: string;
  term_id?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from('student_results')
    .select(`
      *,
      students(full_name, admission_number),
      subjects(name, code),
      terms(name),
      academic_sessions(name)
    `)
    .order('created_at', { ascending: false });

  if (filters?.student_id) query = query.eq('student_id', filters.student_id);
  if (filters?.class_id) query = query.eq('class_id', filters.class_id);
  if (filters?.session_id) query = query.eq('session_id', filters.session_id);
  if (filters?.term_id) query = query.eq('term_id', filters.term_id);

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function createResult(data: {
  student_id: string;
  class_id: string;
  subject_id: string;
  session_id: string;
  term_id: string;
  ca_score?: number;
  mid_term_score?: number;
  end_term_score?: number;
  assignment_score?: number;
  total_score?: number;
  grade?: string;
  remark?: string;
}) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin', 'teacher'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from('student_results')
    .insert(data)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/results');
  return { success: true, error: null, data: result };
}

export async function updateResult(id: string, data: Record<string, unknown>) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin', 'teacher'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('student_results').update(data).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/results');
  return { success: true, error: null };
}

export async function approveResults(ids: string[]) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('student_results')
    .update({ is_approved: true, approved_by: profile.id, approved_at: new Date().toISOString() })
    .in('id', ids);

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/results');
  return { success: true, error: null };
}

export async function publishResults(ids: string[]) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('student_results')
    .update({ is_published: true, published_at: new Date().toISOString() })
    .in('id', ids);

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/results');
  return { success: true, error: null };
}

// ============ RESULT CONFIGURATION ============

export async function getResultConfig(sessionId?: string) {
  const supabase = await createClient();
  let query = supabase.from('result_configurations').select('*');
  if (sessionId) query = query.eq('session_id', sessionId);
  const { data, error } = await query;
  return { data: data || [], error };
}

export async function saveResultConfig(data: {
  session_id: string;
  ca_weight?: number;
  mid_term_weight?: number;
  end_term_weight?: number;
  assignment_weight?: number;
  grading_scale?: Record<string, unknown>;
}) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { data: config, error } = await supabase
    .from('result_configurations')
    .upsert(data, { onConflict: 'session_id' })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/results');
  return { success: true, error: null, data: config };
}

// ============ SCRATCH CARDS ============

export async function getScratchCards(filters?: {
  batch_id?: string;
  status?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from('result_scratch_cards')
    .select(`
      *,
      students(full_name, admission_number)
    `)
    .order('created_at', { ascending: false });

  if (filters?.batch_id) query = query.eq('batch_id', filters.batch_id);
  if (filters?.status) query = query.eq('status', filters.status);

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function getScratchCardBatches() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('scratch_card_batches')
    .select('*')
    .order('created_at', { ascending: false });
  return { data: data || [], error };
}

export async function generateScratchCardBatch(data: {
  card_count: number;
  session_id: string;
  term_id: string;
  class_id?: string;
}) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'super_admin') {
    return { success: false, error: 'Only super admin can generate scratch cards' };
  }

  const supabase = await createClient();

  // Create batch
  const { data: batch, error: batchError } = await supabase
    .from('scratch_card_batches')
    .insert({
      card_count: data.card_count,
      session_id: data.session_id,
      term_id: data.term_id,
      class_id: data.class_id,
      generated_by: profile.id,
    })
    .select()
    .single();

  if (batchError) return { success: false, error: batchError.message };
  if (!batch) return { success: false, error: 'Failed to create batch' };

  // Generate cards with random PINs
  const cards = [];
  for (let i = 0; i < data.card_count; i++) {
    const pin = generatePin();
    const serial = `SC-${batch.id.substring(0, 8).toUpperCase()}-${String(i + 1).padStart(4, '0')}`;
    cards.push({
      batch_id: batch.id,
      serial_number: serial,
      pin,
      session_id: data.session_id,
      term_id: data.term_id,
      class_id: data.class_id,
      max_attempts: 5,
      remaining_attempts: 5,
    });
  }

  const { error: cardsError } = await supabase.from('result_scratch_cards').insert(cards);
  if (cardsError) return { success: false, error: cardsError.message };

  revalidatePath('/super-admin/scratch-cards');
  return { success: true, error: null, batchId: batch.id };
}

function generatePin(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let pin = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) pin += '-';
    pin += chars[Math.floor(Math.random() * chars.length)];
  }
  return pin;
}

export async function consumeScratchCard(cardId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('consume_scratch_card_attempt', { p_card_id: cardId });
  if (error) return { success: false, error: error.message };
  return { success: true, error: null, data };
}

// ============ ID CARDS ============

export async function getIDCards(filters?: { class_id?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from('id_cards')
    .select(`
      *,
      students(full_name, admission_number, date_of_birth, gender, photo_url),
      classes(name, class_level, arm)
    `)
    .order('created_at', { ascending: false });

  if (filters?.class_id) query = query.eq('class_id', filters.class_id);

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function generateIDCards(classId: string, sessionId: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'super_admin') {
    return { success: false, error: 'Only super admin can generate ID cards' };
  }

  const supabase = await createClient();

  // Get all students in the class
  const { data: students } = await supabase
    .from('students')
    .select('id, full_name, admission_number, photo_url')
    .eq('current_class_id', classId)
    .is('deleted_at', null);

  if (!students || students.length === 0) {
    return { success: false, error: 'No students in this class' };
  }

  const cards = students.map(s => ({
    student_id: s.id,
    class_id: classId,
    session_id: sessionId,
    card_number: `ID-${s.admission_number}`,
    is_active: true,
  }));

  const { error } = await supabase.from('id_cards').upsert(cards, { onConflict: 'student_id,session_id' });
  if (error) return { success: false, error: error.message };

  revalidatePath('/super-admin/id-cards');
  return { success: true, error: null, count: cards.length };
}
