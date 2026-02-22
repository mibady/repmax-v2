'use client';

import { useState } from 'react';
import { useSchoolMembers } from '@/lib/hooks';

function RoleBadge({ role }: { role: 'admin' | 'coach' | 'staff' }) {
  const styles = {
    admin: 'bg-primary/10 text-primary border-primary/20',
    coach: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    staff: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${styles[role]}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

export default function SchoolMembersPage() {
  const { members, isLoading, error, addMember, removeMember } = useSchoolMembers();

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'coach' | 'staff'>('staff');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [removeLoading, setRemoveLoading] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteLoading(true);
    setInviteError(null);

    try {
      await addMember(inviteEmail.trim(), inviteRole);
      setInviteEmail('');
      setInviteRole('staff');
      setShowInviteForm(false);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    setRemoveLoading(memberId);
    try {
      await removeMember(memberId);
    } catch {
      // Error is handled by the hook
    } finally {
      setRemoveLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load members</h3>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Members</h1>
          <p className="text-gray-400 text-sm mt-1">{members.length} team member{members.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">person_add</span>
          Invite Member
        </button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <div className="bg-[#141414] border border-white/5 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Invite New Member</h3>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email address"
              required
              className="flex-1 px-4 py-2.5 bg-[#1F1F22] border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary/50"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'admin' | 'coach' | 'staff')}
              className="px-4 py-2.5 bg-[#1F1F22] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary/50"
            >
              <option value="staff">Staff</option>
              <option value="coach">Coach</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              disabled={inviteLoading}
              className="px-5 py-2.5 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {inviteLoading ? 'Adding...' : 'Add'}
            </button>
          </form>
          {inviteError && (
            <p className="text-red-400 text-sm mt-3">{inviteError}</p>
          )}
        </div>
      )}

      {/* Members Table */}
      <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-gray-400 text-xs font-semibold uppercase tracking-wider px-5 py-3">Name</th>
                <th className="text-left text-gray-400 text-xs font-semibold uppercase tracking-wider px-5 py-3">Email</th>
                <th className="text-left text-gray-400 text-xs font-semibold uppercase tracking-wider px-5 py-3">Role</th>
                <th className="text-left text-gray-400 text-xs font-semibold uppercase tracking-wider px-5 py-3">Joined</th>
                <th className="text-right text-gray-400 text-xs font-semibold uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">group</span>
                    <p className="text-slate-500">No members yet. Invite your team to get started.</p>
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-8 rounded-full bg-primary/20">
                          <span className="material-symbols-outlined text-primary text-sm">person</span>
                        </div>
                        <span className="text-white text-sm font-medium">{member.full_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-gray-400 text-sm">{member.email || '-'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <RoleBadge role={member.role} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-gray-400 text-sm">
                        {new Date(member.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleRemove(member.id)}
                        disabled={removeLoading === member.id}
                        className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {removeLoading === member.id ? 'Removing...' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
