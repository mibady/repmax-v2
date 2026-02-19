'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useClubDashboard } from '@/lib/hooks';

function PaymentStatusBadge({ status }: { status: 'completed' | 'pending' | 'failed' }) {
  const styles = {
    completed: 'bg-green-500/10 text-green-400',
    pending: 'bg-yellow-500/10 text-yellow-400',
    failed: 'bg-red-500/10 text-red-400',
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function ClubPaymentsPage() {
  const { payments, metrics, isLoading, error } = useClubDashboard();
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load payments</h3>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/club"
          className="size-10 rounded-lg bg-[#141414] border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-gray-400">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-white text-2xl font-bold">Payments</h1>
          <p className="text-gray-400 text-sm mt-1">{payments.length} total transactions</p>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="bg-[#141414] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl">payments</span>
          </div>
          <span className="text-gray-400 text-sm font-medium">Total Revenue</span>
        </div>
        <span className="text-white text-3xl font-bold">
          ${metrics?.totalRevenue?.toLocaleString() || '0'}
        </span>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'completed', 'pending', 'failed'] as const).map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filter === value
                ? 'bg-primary text-black'
                : 'bg-[#141414] text-gray-400 border border-white/5 hover:text-white'
            }`}
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </button>
        ))}
      </div>

      {/* Payments List */}
      <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
        <div className="divide-y divide-white/5">
          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">payments</span>
              <p className="text-slate-500">No payments found</p>
            </div>
          ) : (
            filtered.map((payment) => (
              <div key={payment.id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium truncate max-w-[300px]">
                    {payment.description}
                  </span>
                  <PaymentStatusBadge status={payment.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">{payment.date}</span>
                  <span className="text-white text-sm font-semibold">
                    ${payment.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
