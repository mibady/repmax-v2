'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useClubDashboard } from '@/lib/hooks';

function VerificationTypeBadge({ type }: { type: 'identity' | 'academic' | 'athletic' }) {
  const styles = {
    identity: 'bg-purple-500/10 text-purple-400',
    academic: 'bg-blue-500/10 text-blue-400',
    athletic: 'bg-orange-500/10 text-orange-400',
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${styles[type]}`}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

function VerificationStatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  const styles = {
    pending: 'bg-yellow-500/10 text-yellow-400',
    approved: 'bg-green-500/10 text-green-400',
    rejected: 'bg-red-500/10 text-red-400',
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function ClubVerificationsPage() {
  const { verifications, refresh, isLoading, error } = useClubDashboard();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading verifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load verifications</h3>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  const pendingCount = verifications.filter(v => v.status === 'pending').length;
  const filtered = filter === 'all' ? verifications : verifications.filter(v => v.status === filter);

  async function handleAction(id: string, status: 'approved' | 'rejected') {
    setActionLoading(id);
    try {
      const res = await fetch('/api/club/verifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error('Verification action failed:', data.error);
      }

      refresh();
    } catch (err) {
      console.error('Verification action error:', err);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/club"
            className="size-10 rounded-lg bg-[#141414] border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-gray-400">arrow_back</span>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-white text-2xl font-bold">Verification Queue</h1>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-primary text-black rounded">
                  {pendingCount} pending
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm mt-1">Review athlete verification requests</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((value) => (
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

      {/* Verification List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-[#141414] border border-white/5 rounded-xl px-5 py-12 text-center">
            <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">verified_user</span>
            <p className="text-slate-500">No verifications found</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-[#141414] border border-white/5 rounded-xl px-5 py-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-semibold">{item.athleteName}</span>
                    <VerificationTypeBadge type={item.type} />
                    <VerificationStatusBadge status={item.status} />
                  </div>
                  <span className="text-gray-500 text-sm">Submitted {item.submittedAt}</span>
                </div>
                {item.status === 'pending' && (
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleAction(item.id, 'approved')}
                      disabled={actionLoading === item.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-400 text-sm font-medium rounded-lg border border-green-500/20 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-lg">check</span>
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(item.id, 'rejected')}
                      disabled={actionLoading === item.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 text-sm font-medium rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
