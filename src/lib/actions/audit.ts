'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth/utils';

export async function getAuditLogs(filters?: {
  action?: string;
  entity_type?: string;
  user_id?: string;
  page?: number;
  limit?: number;
}) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'super_admin') {
    return { data: null, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const page = filters?.page || 1;
  const limit = filters?.limit || 50;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('school_audit_logs')
    .select('*, profiles:user_id(full_name, email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (filters?.action) {
    query = query.eq('action', filters.action);
  }
  if (filters?.entity_type) {
    query = query.eq('entity_type', filters.entity_type);
  }
  if (filters?.user_id) {
    query = query.eq('user_id', filters.user_id);
  }

  const { data, error, count } = await query;
  if (error) return { data: null, error: error.message, count: 0 };
  return { data, error: null, count: count || 0 };
}

export async function getSecurityLogs(page?: number) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'super_admin') {
    return { data: null, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const limit = 50;
  const from = ((page || 1) - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('system_security_logs')
    .select('*, profiles:user_id(full_name, email)')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function getAuditLogStats() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'super_admin') {
    return { data: null, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const [todayLogs, totalLogs, actionBreakdown] = await Promise.all([
    supabase.from('school_audit_logs').select('id', { count: 'exact', head: true }).gte('created_at', today),
    supabase.from('school_audit_logs').select('id', { count: 'exact', head: true }),
    supabase.from('school_audit_logs').select('action'),
  ]);

  const actions: Record<string, number> = {};
  (actionBreakdown.data || []).forEach((log: { action: string }) => {
    actions[log.action] = (actions[log.action] || 0) + 1;
  });

  return {
    todayCount: todayLogs.count || 0,
    totalCount: totalLogs.count || 0,
    actionBreakdown: actions,
  };
}
