'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { getCurrentProfile } from '@/lib/auth/utils';
import { revalidatePath } from 'next/cache';

export async function getStudentList(filters?: {
  class_id?: string;
  search?: string;
  is_active?: boolean;
}) {
  const supabase = await createClient();
  let query = supabase
    .from('students')
    .select(`
      *,
      classes(name, class_level, arm),
      student_enrollments(
        class_id,
        classes(name, class_level, arm)
      )
    `)
    .is('deleted_at', null)
    .order('full_name');

  if (filters?.class_id) {
    query = query.eq('current_class_id', filters.class_id);
  }
  if (filters?.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }
  if (filters?.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,admission_number.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function getStudentById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      classes(name, class_level, arm),
      families(id, family_name, parent_user_id)
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single();
  return { data, error };
}

export async function createStudent(data: {
  admission_number: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  current_class_id?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  address?: string;
  blood_group?: string;
  genotype?: string;
  photo_url?: string;
}) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();

  // Check for duplicate admission number
  const { data: existing } = await supabase
    .from('students')
    .select('id')
    .eq('admission_number', data.admission_number)
    .is('deleted_at', null)
    .maybeSingle();

  if (existing) {
    return { success: false, error: 'Student with this admission number already exists' };
  }

  const { data: student, error } = await supabase
    .from('students')
    .insert(data)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  // If class is assigned, create enrollment record
  if (data.current_class_id) {
    const { data: session } = await supabase
      .from('academic_sessions')
      .select('id')
      .eq('is_active', true)
      .single();

    if (session) {
      await supabase.from('student_enrollments').insert({
        student_id: student.id,
        class_id: data.current_class_id,
        session_id: session.id,
        enrollment_date: new Date().toISOString().split('T')[0],
      });
    }
  }

  revalidatePath('/dashboard/students');
  return { success: true, error: null, data: student };
}

export async function updateStudent(id: string, data: Record<string, unknown>) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('students').update(data).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/students');
  return { success: true, error: null };
}

export async function softDeleteStudent(id: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'super_admin') {
    return { success: false, error: 'Only super admin can delete students' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('students')
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/students');
  return { success: true, error: null };
}

// ============ FAMILY / PARENT LINKING ============

export async function getFamilies() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('families')
    .select(`
      *,
      students:family_students(id, full_name, admission_number, date_of_birth)
    `)
    .order('family_name');
  return { data: data || [], error };
}

export async function getFamilyById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('families')
    .select(`
      *,
      students:family_students(id, full_name, admission_number, date_of_birth, current_class_id, classes(name))
    `)
    .eq('id', id)
    .single();
  return { data, error };
}

export async function createFamily(data: {
  family_name: string;
  parent_user_id?: string;
}) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { data: family, error } = await supabase.from('families').insert(data).select().single();
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/students');
  return { success: true, error: null, data: family };
}

export async function linkStudentToFamily(studentId: string, familyId: string) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('family_students')
    .insert({ family_id: familyId, student_id: studentId });

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/students');
  return { success: true, error: null };
}

export async function unlinkStudentFromFamily(studentId: string, familyId: string) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('family_students')
    .delete()
    .eq('family_id', familyId)
    .eq('student_id', studentId);

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/students');
  return { success: true, error: null };
}

// Create parent user account
export async function createParentUserAccount(familyId: string, email: string, password: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'super_admin') {
    return { success: false, error: 'Only super admin can create user accounts' };
  }

  const supabase = await createClient();

  // Get family info
  const { data: family } = await supabase
    .from('families')
    .select('family_name')
    .eq('id', familyId)
    .single();

  if (!family) return { success: false, error: 'Family not found' };

  // Create auth user
  const serviceRole = createServiceRoleClient();
  const { data: authData, error: authError } = await serviceRole.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: family.family_name, role: 'student_parent' },
  });

  if (authError) return { success: false, error: authError.message };
  if (!authData.user) return { success: false, error: 'Failed to create user' };

  // Update family with user_id
  const { error: updateError } = await supabase
    .from('families')
    .update({ parent_user_id: authData.user.id })
    .eq('id', familyId);

  if (updateError) return { success: false, error: updateError.message };

  revalidatePath('/dashboard/students');
  return { success: true, error: null, userId: authData.user.id };
}

// Get parent's children (for parent view)
export async function getParentChildren(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('family_students')
    .select(`
      student_id,
      students(
        id, full_name, admission_number, date_of_birth, gender,
        current_class_id,
        classes(name, class_level, arm)
      )
    `)
    .eq('family_id', 
      (await supabase.from('families').select('id').eq('parent_user_id', userId).single()).data?.id
    );
  return { data: data || [], error };
}

// Promote students to next class
export async function promoteStudents(
  studentIds: string[],
  targetClassId: string,
  sessionId: string
) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();

  // Update current class for each student
  for (const studentId of studentIds) {
    await supabase.from('students').update({ current_class_id: targetClassId }).eq('id', studentId);

    // Create enrollment record
    await supabase.from('student_enrollments').insert({
      student_id: studentId,
      class_id: targetClassId,
      session_id: sessionId,
      enrollment_date: new Date().toISOString().split('T')[0],
    });
  }

  revalidatePath('/dashboard/students');
  return { success: true, error: null };
}
