'use client';

import { useState } from 'react';
import { createStaffUserAccount } from '@/lib/actions/staff';

export default function CreateAccountButton({ staffId, staffName }: { staffId: string; staffName: string }) {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    const result = await createStaffUserAccount(staffId, email, password);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
        User account created successfully! The staff member can now log in.
      </div>
    );
  }

  return (
    <div>
      {!showForm ? (
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">
          Create User Account for {staffName}
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="Login email for this staff member"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password (min 8 chars)</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
              placeholder="Temporary password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={loading}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
