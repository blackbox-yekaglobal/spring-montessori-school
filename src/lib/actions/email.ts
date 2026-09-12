'use server';

import { createClient } from '@/lib/supabase/server';

export async function createContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from('contact_messages').insert({
    full_name: data.name,
    email: data.email,
    subject: data.subject,
    message: data.message,
    status: 'unread',
  });

  if (error) {
    console.error('Failed to save contact message:', error.message);
    return { success: false, error: error.message };
  }

  // TODO: Send email notification via Resend when configured
  // import { Resend } from 'resend';
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: process.env.MAIL_FROM || 'noreply@springmontessori.edu.ng',
  //   to: process.env.SCHOOL_EMAIL || 'info@springmontessori.edu.ng',
  //   subject: `Contact Form: ${data.subject}`,
  //   html: `<p>From: ${data.name} (${data.email})</p><p>${data.message}</p>`,
  // });

  return { success: true, error: null };
}

export async function sendEmailNotification(to: string, subject: string, html: string) {
  // This function will be used when Resend is configured
  // import { Resend } from 'resend';
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // return resend.emails.send({
  //   from: process.env.MAIL_FROM || 'noreply@springmontessori.edu.ng',
  //   to,
  //   subject,
  //   html,
  // });
  console.log('Email notification (Resend not configured):', { to, subject });
  return { success: true, id: null };
}

export async function getContactMessages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function markMessageRead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('contact_messages')
    .update({ status: 'read' })
    .eq('id', id);

  return { success: !error, error: error?.message || null };
}
