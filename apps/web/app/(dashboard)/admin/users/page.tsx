'use client';

import { useState, useCallback } from 'react';
import { useAdminUsers, type AdminUser } from '@/lib/hooks';

const ROLES = ['all', 'athlete', 'coach', 'recruiter', 'parent', 'club', 'admin'] as const;

const roleBadgeColors: Record<string, { bg: string; text: string }> = {
  athlete: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  coach: { bg: 'bg-green-500/10', text: 'text-green-400' },
  recruiter: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
  parent: { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  club: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
  admin: { bg: 'bg-red-500/10', text: 'text-red-400' },
};

const statusColors: Record<string, { dot: string; text: string; label: string }> = {
  active: { dot: 'bg-green-400', text: 'text-green-400', label: 'Active' },
  suspended: { dot: 'bg-red-400', text: 'text-red-400', label: 'Suspended' },
  pending: { dot: 'bg-yellow-400', text: 'text-yellow-400', label: 'Pending' },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { users, stats, pagination, isLoading, error, updateUser } = useAdminUsers({
    search,
    role: roleFilter,
    page,
    limit: 10,
  });

  const handleRoleChange = useCallback(
    async (userId: string, newRole: string) => {
      await updateUser(userId, { role: newRole });
    },
    [updateUser]
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load users</h3>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">User Management</h1>
          <p className="text-slate-400">Manage platform users, roles, and account status</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1F1F22] rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <span className="material-symbols-outlined text-[20px]">group</span>
              Total Users
            </div>
            <span className="text-3xl font-bold text-white">{stats?.totalUsers ?? 0}</span>
          </div>
          <div className="bg-[#1F1F22] rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <span className="material-symbols-outlined text-[20px]">person_check</span>
              Active Today
            </div>
            <span className="text-3xl font-bold text-white">{stats?.activeToday ?? 0}</span>
          </div>
          <div className="bg-[#1F1F22] rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              New Signups (24h)
            </div>
            <span className="text-3xl font-bold text-white">{stats?.newSignups ?? 0}</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-[#1F1F22] rounded-xl border border-white/5 mb-6">
          <div className="p-4 flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <span className="material-symbols-outlined text-[20px] text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
                search
              </span>
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-[#2A2A2E] text-white text-sm rounded-lg pl-10 pr-4 py-2.5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none placeholder:text-slate-500"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#2A2A2E] text-white text-sm rounded-lg px-3 py-2.5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[#1F1F22] rounded-xl border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <span className="material-symbols-outlined text-slate-600 text-4xl mb-2 block">
                        person_search
                      </span>
                      <p className="text-slate-500">No users found</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user: AdminUser) => {
                    const primaryRole = user.roles[0] || 'unknown';
                    const roleStyle = roleBadgeColors[primaryRole] || {
                      bg: 'bg-slate-500/10',
                      text: 'text-slate-400',
                    };
                    const userStatus = statusColors[user.status] || statusColors.pending;

                    return (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors">
                        {/* User */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-[#2A2A2E] flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {getInitials(user.name)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                {user.isOnlineNow && (
                                  <span className="size-2 rounded-full bg-green-400 shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded ${roleStyle.bg} ${roleStyle.text}`}
                          >
                            {primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1)}
                          </span>
                        </td>

                        {/* Joined */}
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-400">{formatDate(user.joinedDate)}</span>
                        </td>

                        {/* Last Active */}
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-400">{formatDate(user.lastActive)}</span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`size-2 rounded-full ${userStatus.dot}`} />
                            <span className={`text-xs font-medium ${userStatus.text}`}>
                              {userStatus.label}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <select
                            value={primaryRole}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="bg-[#2A2A2E] text-white text-xs rounded-lg px-2 py-1.5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                          >
                            <option value="athlete">Athlete</option>
                            <option value="coach">Coach</option>
                            <option value="recruiter">Recruiter</option>
                            <option value="parent">Parent</option>
                            <option value="club">Club</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 border-t border-white/5 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Showing {(pagination.page - 1) * pagination.limit + 1}
                {' '}-{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} users
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={pagination.page <= 1}
                  className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    // Show first, last, and nearby pages
                    return (
                      p === 1 ||
                      p === pagination.totalPages ||
                      Math.abs(p - pagination.page) <= 1
                    );
                  })
                  .reduce<(number | string)[]>((acc, p, idx, arr) => {
                    if (idx > 0) {
                      const prev = arr[idx - 1];
                      if (typeof prev === 'number' && p - prev > 1) {
                        acc.push('...');
                      }
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    typeof item === 'string' ? (
                      <span key={`ellipsis-${idx}`} className="text-slate-500 px-1">
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item)}
                        className={`size-8 rounded text-sm font-medium transition-colors ${
                          item === pagination.page
                            ? 'bg-primary text-black'
                            : 'text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
