'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth/utils';
import { revalidatePath } from 'next/cache';

// ============ QUESTION BANK ============

export async function getQuestions(filters?: {
  subject_id?: string;
  class_id?: string;
  question_type?: string;
  difficulty?: string;
  search?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from('question_bank')
    .select(`
      *,
      subjects(name, code),
      classes(name)
    `)
    .order('created_at', { ascending: false });

  if (filters?.subject_id) query = query.eq('subject_id', filters.subject_id);
  if (filters?.class_id) query = query.eq('class_id', filters.class_id);
  if (filters?.question_type) query = query.eq('question_type', filters.question_type);
  if (filters?.difficulty) query = query.eq('difficulty', filters.difficulty);
  if (filters?.search) query = query.ilike('question_text', `%${filters.search}%`);

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function createQuestion(data: {
  subject_id: string;
  class_id: string;
  question_type: string;
  question_text: string;
  options?: Record<string, unknown>;
  correct_answer: string;
  marks: number;
  explanation?: string;
  difficulty?: string;
}) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin', 'teacher'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { data: question, error } = await supabase
    .from('question_bank')
    .insert(data)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/question-bank');
  return { success: true, error: null, data: question };
}

export async function updateQuestion(id: string, data: Record<string, unknown>) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin', 'teacher'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('question_bank').update(data).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/question-bank');
  return { success: true, error: null };
}

export async function deleteQuestion(id: string) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin', 'teacher'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('question_bank').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/question-bank');
  return { success: true, error: null };
}

// ============ EXAMINATIONS ============

export async function getExaminations(filters?: {
  class_id?: string;
  subject_id?: string;
  exam_type?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from('examinations')
    .select(`
      *,
      classes(name),
      subjects(name, code),
      academic_sessions(name)
    `)
    .order('start_date', { ascending: false });

  if (filters?.class_id) query = query.eq('class_id', filters.class_id);
  if (filters?.subject_id) query = query.eq('subject_id', filters.subject_id);
  if (filters?.exam_type) query = query.eq('exam_type', filters.exam_type);

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function getExamById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('examinations')
    .select(`
      *,
      classes(name),
      subjects(name, code),
      academic_sessions(name)
    `)
    .eq('id', id)
    .single();
  return { data, error };
}

export async function createExam(data: {
  title: string;
  exam_type: string;
  class_id: string;
  subject_id: string;
  session_id: string;
  total_marks: number;
  duration_minutes: number;
  start_date: string;
  end_date: string;
  instructions?: string;
  is_locked?: boolean;
}) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin', 'teacher'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { data: exam, error } = await supabase
    .from('examinations')
    .insert(data)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/cbt');
  return { success: true, error: null, data: exam };
}

export async function updateExam(id: string, data: Record<string, unknown>) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin', 'teacher'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('examinations').update(data).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/cbt');
  return { success: true, error: null };
}

export async function deleteExam(id: string) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('examinations').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/cbt');
  return { success: true, error: null };
}

// ============ EXAM QUESTIONS ============

export async function getExamQuestions(examId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('exam_questions')
    .select(`
      *,
      question_bank(question_text, question_type, options, correct_answer, marks, difficulty)
    `)
    .eq('exam_id', examId)
    .order('question_number');
  return { data: data || [], error };
}

export async function addQuestionToExam(examId: string, questionId: string, questionNumber: number, marks?: number) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin', 'teacher'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('exam_questions')
    .insert({
      exam_id: examId,
      question_id: questionId,
      question_number: questionNumber,
      marks_override: marks,
    });

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/cbt');
  return { success: true, error: null };
}

export async function removeQuestionFromExam(examId: string, questionId: string) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin', 'teacher'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('exam_questions')
    .delete()
    .eq('exam_id', examId)
    .eq('question_id', questionId);

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/cbt');
  return { success: true, error: null };
}

// ============ EXAM ATTEMPTS ============

export async function getExamAttempts(examId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('examination_attempts')
    .select(`
      *,
      students(full_name, admission_number)
    `)
    .eq('exam_id', examId)
    .order('started_at', { ascending: false });
  return { data: data || [], error };
}

export async function startExamAttempt(examId: string, studentId: string) {
  const supabase = await createClient();

  // Check if attempt already exists
  const { data: existing } = await supabase
    .from('examination_attempts')
    .select('id')
    .eq('exam_id', examId)
    .eq('student_id', studentId)
    .maybeSingle();

  if (existing) {
    return { success: false, error: 'Attempt already exists', attemptId: existing.id };
  }

  const { data: attempt, error } = await supabase
    .from('examination_attempts')
    .insert({
      exam_id: examId,
      student_id: studentId,
      started_at: new Date().toISOString(),
      status: 'in_progress',
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, error: null, data: attempt };
}

export async function saveAnswer(attemptId: string, questionId: string, answer: string, timeSpent: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('exam_answers')
    .upsert({
      attempt_id: attemptId,
      question_id: questionId,
      student_answer: answer,
      time_spent_seconds: timeSpent,
    }, { onConflict: 'attempt_id,question_id' });

  if (error) return { success: false, error: error.message };
  return { success: true, error: null };
}

export async function submitExamAttempt(attemptId: string, score: number, totalMarks: number) {
  const supabase = await createClient();

  // Use the database function for idempotent submission
  const { data, error } = await supabase.rpc('submit_cbt_attempt', {
    p_attempt_id: attemptId,
    p_score: score,
    p_total_marks: totalMarks,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/cbt');
  return { success: true, error: null, data };
}

export async function getStudentAnswers(attemptId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('exam_answers')
    .select('*')
    .eq('attempt_id', attemptId);
  return { data: data || [], error };
}
