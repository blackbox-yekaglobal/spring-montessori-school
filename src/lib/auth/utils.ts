import { createClient } from '@/lib/supabase/server';
import { AppRole, Profile } from '@/types/database';

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

export async function getUserRole(): Promise<AppRole | null> {
  const profile = await getCurrentProfile();
  return profile?.role ?? null;
}

export async function isSuperAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'super_admin';
}

export async function isSchoolAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'school_admin';
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'super_admin' || role === 'school_admin';
}

export async function isTeacher(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'teacher';
}

export async function isStudentParent(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'student_parent';
}

// Check if teacher has access to a specific class
export async function hasTeacherClassAccess(userId: string, classId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc('is_teacher_of_class', {
    p_user_id: userId,
    p_class_id: classId,
  });
  return data ?? false;
}

// Check if teacher has access to a specific subject in a class
export async function hasTeacherSubjectAccess(userId: string, subjectId: string, classId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc('is_teacher_of_subject_in_class', {
    p_user_id: userId,
    p_subject_id: subjectId,
    p_class_id: classId,
  });
  return data ?? false;
}

// Check if user is parent of a student
export async function hasParentAccess(userId: string, studentId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc('is_parent_of_student', {
    p_user_id: userId,
    p_student_id: studentId,
  });
  return data ?? false;
}
