'use client';

import { useState } from 'react';
import { updateSchoolSettings } from '@/lib/actions/academic';

interface Settings {
  id: string;
  school_name: string | null;
  school_motto: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  currency: string | null;
  currency_symbol: string | null;
  current_session_id: string | null;
  current_term_id: string | null;
  grading_system: Record<string, unknown> | null;
  result_config: Record<string, unknown> | null;
}

interface Session { id: string; name: string; }
interface Term { id: string; name: string; session_id: string; }

export default function SystemSettingsForm({ settings, sessions, terms }: {
  settings: Settings | null;
  sessions: Session[];
  terms: Term[];
}) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    school_name: settings?.school_name || '',
    school_motto: settings?.school_motto || '',
    address: settings?.address || '',
    city: settings?.city || '',
    state: settings?.state || '',
    country: settings?.country || 'Nigeria',
    phone: settings?.phone || '',
    email: settings?.email || '',
    website: settings?.website || '',
    currency: settings?.currency || 'NGN',
    currency_symbol: settings?.currency_symbol || '₦',
    current_session_id: settings?.current_session_id || '',
    current_term_id: settings?.current_term_id || '',
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    const result = await updateSchoolSettings(form as unknown as Record<string, unknown>);
    setSaving(false);
    if (result.success) {
      setMessage('Settings saved successfully.');
    } else {
      setMessage(`Error: ${result.error || 'Failed to save settings'}`);
    }
  };

  const filteredTerms = form.current_session_id
    ? terms.filter(t => t.session_id === form.current_session_id)
    : terms;

  return (
    <div className="space-y-6">
      {/* School Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">School Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
            <input
              type="text"
              value={form.school_name}
              onChange={(e) => handleChange('school_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School Motto</label>
            <input
              type="text"
              value={form.school_motto}
              onChange={(e) => handleChange('school_motto', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="e.g., Excellence Through Knowledge"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="text"
              value={form.website}
              onChange={(e) => handleChange('website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={form.state}
              onChange={(e) => handleChange('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              value={form.country}
              onChange={(e) => handleChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      {/* Academic Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Session</label>
            <select
              value={form.current_session_id}
              onChange={(e) => { handleChange('current_session_id', e.target.value); handleChange('current_term_id', ''); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Select session</option>
              {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Term</label>
            <select
              value={form.current_term_id}
              onChange={(e) => handleChange('current_term_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Select term</option>
              {filteredTerms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <input
              type="text"
              value={form.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
            <input
              type="text"
              value={form.currency_symbol}
              onChange={(e) => handleChange('currency_symbol', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {message && (
          <p className={`text-sm ${message.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>
        )}
      </div>
    </div>
  );
}
