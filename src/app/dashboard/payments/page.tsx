'use client';

import { useState, useEffect } from 'react';
import { getPayments, createPayment, updatePaymentStatus, getPaymentSummary } from '@/lib/actions/attendance';
import { getClasses } from '@/lib/actions/academic';
import { getStudentList } from '@/lib/actions/students';

interface Payment {
  id: string;
  student_id: string;
  amount: number;
  payment_type: string;
  payment_method: string;
  status: string;
  payment_date: string;
  due_date: string | null;
  paid_at: string | null;
  reference_number: string | null;
  description: string | null;
  students?: { full_name: string; admission_number: string };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState({ totalExpected: 0, totalPaid: 0, totalPending: 0, totalOverdue: 0 });
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [students, setStudents] = useState<{ id: string; full_name: string; admission_number: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState('tuition');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadPayments();
    getPaymentSummary().then(res => { if (res.data) setSummary(res.data); });
    getClasses().then(res => { if (res.data) setClasses(res.data); });
  }, []);

  useEffect(() => {
    if (selectedClass) {
      getStudentList({ class_id: selectedClass }).then(res => {
        if (res.data) setStudents(res.data as { id: string; full_name: string; admission_number: string }[]);
      });
    }
  }, [selectedClass]);

  async function loadPayments() {
    setLoading(true);
    const filters: Record<string, string> = {};
    if (statusFilter) filters.status = statusFilter;
    const res = await getPayments(filters);
    if (res.data) setPayments(res.data);
    setLoading(false);
  }

  function resetForm() {
    setStudentId('');
    setAmount('');
    setPaymentType('tuition');
    setPaymentMethod('bank_transfer');
    setDueDate('');
    setDescription('');
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Need active session - for now use a placeholder
    const result = await createPayment({
      student_id: studentId,
      session_id: '00000000-0000-0000-0000-000000000000', // Will be replaced with active session
      amount: Number(amount),
      payment_type: paymentType,
      payment_method: paymentMethod,
      due_date: dueDate || undefined,
      description: description || undefined,
    });

    if (result.error) {
      setError(result.error);
    } else {
      await loadPayments();
      resetForm();
    }
  }

  async function handleMarkPaid(id: string) {
    const result = await updatePaymentStatus(id, 'paid');
    if (result.error) {
      setError(result.error);
    } else {
      await loadPayments();
    }
  }

  const statusColors: Record<string, string> = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
    partial: 'bg-blue-100 text-blue-800',
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-1">Track and manage school fee payments</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
          + New Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Expected</div>
          <div className="text-xl font-bold text-gray-900">₦{summary.totalExpected.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Paid</div>
          <div className="text-xl font-bold text-green-600">₦{summary.totalPaid.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Pending</div>
          <div className="text-xl font-bold text-yellow-600">₦{summary.totalPending.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Overdue</div>
          <div className="text-xl font-bold text-red-600">₦{summary.totalOverdue.toLocaleString()}</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
          {error}
          <button onClick={() => setError('')} className="ml-2 font-bold">&times;</button>
        </div>
      )}

      {/* New Payment Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Class</label>
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                <option value="">Select class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Student *</label>
              <select value={studentId} onChange={e => setStudentId(e.target.value)} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                <option value="">Select student</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.admission_number})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount (₦) *</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Type</label>
              <select value={paymentType} onChange={e => setPaymentType(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                <option value="tuition">Tuition</option>
                <option value="exam_fee">Exam Fee</option>
                <option value="development_levy">Development Levy</option>
                <option value="textbook">Textbook</option>
                <option value="uniform">Uniform</option>
                <option value="transport">Transport</option>
                <option value="feeding">Feeding</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="pos">POS</option>
                <option value="online">Online</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Optional description"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">Create</button>
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300">Cancel</button>
            </div>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); loadPayments(); }}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map(payment => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{payment.students?.full_name || '—'}</div>
                  <div className="text-xs text-gray-500">{payment.students?.admission_number}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{payment.payment_type.replace('_', ' ')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₦{Number(payment.amount).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{payment.payment_method.replace('_', ' ')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.due_date ? new Date(payment.due_date).toLocaleDateString() : '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[payment.status] || 'bg-gray-100 text-gray-800'}`}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {payment.status !== 'paid' && (
                    <button onClick={() => handleMarkPaid(payment.id)} className="text-green-600 hover:text-green-900">Mark Paid</button>
                  )}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">No payments found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
