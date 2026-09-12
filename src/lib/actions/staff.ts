'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { getCurrentProfile } from '@/lib/auth/utils';
import { revalidatePath } from 'next/cache';

export async function getStaffList(filters?: {
  role?: string;
  is_active?: boolean;
  search?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from('staff')
    .select('*, staff_profiles:user_id(full_name, email)')
    .is('deleted_at', null)
    .order('full_name');

  if (filters?.role) query = query.eq('role', filters.role);
  if (filters?.is_active !== undefined) query = query.eq('is_active', filters.is_active);
  if (filters?.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,staff_id.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function getStaffById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('staff')
    .select('*, staff_profiles:user_id(full_name, email)')
    .eq('id', id)
    .is('deleted_at', null)
    .single();
  return { data, error };
}

export async function createStaff(data: {
  staff_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  role: string;
  department?: string;
  qualification?: string;
  date_of_birth?: string;
  date_of_joining?: string;
  address?: string;
  gender?: string;
  photo_url?: string;
}) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();

  // Check for duplicate staff_id
  const { data: existing } = await supabase
    .from('staff')
    .select('id')
    .eq('staff_id', data.staff_id)
    .is('deleted_at', null)
    .maybeSingle();

  if (existing) {
    return { success: false, error: 'Staff with this ID already exists' };
  }

  const { data: staff, error } = await supabase
    .from('staff')
    .insert(data)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/staff');
  return { success: true, error: null, data: staff };
}

export async function updateStaff(id: string, data: Record<string, unknown>) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('staff')
    .update(data)
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/staff');
  return { success: true, error: null };
}

export async function deactivateStaff(id: string) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('staff')
    .update({ is_active: false })
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/staff');
  return { success: true, error: null };
}

export async function softDeleteStaff(id: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'super_admin') {
    return { success: false, error: 'Only super admin can delete staff' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('staff')
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/staff');
  return { success: true, error: null };
}

// Create a user account for a staff member (super_admin only)
export async function createStaffUserAccount(staffId: string, email: string, password: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'super_admin') {
    return { success: false, error: 'Only super admin can create user accounts' };
  }

  const supabase = await createClient();

  // Get the staff record
  const { data: staff, error: staffError } = await supabase
    .from('staff')
    .select('id, full_name')
    .eq('id', staffId)
    .is('deleted_at', null)
    .single();

  if (staffError || !staff) {
    return { success: false, error: 'Staff record not found' };
  }

  // Create auth user via service role
  const serviceRole = createServiceRoleClient();
  const { data: authData, error: authError } = await serviceRole.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: staff.full_name, role: 'teacher' },
  });

  if (authError) return { success: false, error: authError.message };
  if (!authData.user) return { success: false, error: 'Failed to create user' };

  // Update staff record with user_id
  const { error: updateError } = await supabase
    .from('staff')
    .update({ user_id: authData.user.id, email })
    .eq('id', staffId);

  if (updateError) return { success: false, error: updateError.message };

  revalidatePath('/dashboard/staff');
  return { success: true, error: null, userId: authData.user.id };
}

// Get staff with their assigned classes (for teacher scope)
export async function getStaffWithClasses(staffId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('teacher_classes')
    .select('*, classes(name, class_level, arm)')
    .eq('staff_id', staffId);
  return { data: data || [], error };
}

// Assign teacher to a class
export async function assignTeacherToClass(staffId: string, classId: string) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('teacher_classes')
    .insert({ staff_id: staffId, class_id: classId });

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/staff');
  return { success: true, error: null };
}

// Remove teacher from a class
export async function removeTeacherFromClass(staffId: string, classId: string) {
  const profile = await getCurrentProfile();
  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('teacher_classes')
    .delete()
    .eq('staff_id', staffId)
    .eq('class_id', classId);

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/staff');
  return { success: true, error: null };
}
