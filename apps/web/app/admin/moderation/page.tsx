'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAdminModeration, type ModerationItem } from '@/lib/hooks';

function getTypeBadge(type: string) {
  switch (type) {
    case 'photo':
      return { icon: 'image', label: 'Photo', classes: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
    case 'bio':
      return { icon: 'text_fields', label: 'Bio', classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    case 'film':
      return { icon: 'movie', label: 'Film', classes: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
    default:
      return { icon: 'description', label: 'Other', classes: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
  }
}

export default function ContentModerationPage() {
  const [typeFilter, setTypeFilter] = useState<'all' | 'photo' | 'bio' | 'film'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'warned' | 'removed'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { items, stats, isLoading, error, approveItem, warnUser, removeContent } = useAdminModeration({
    type: typeFilter,
    status: statusFilter,
  });

  const handleApprove = async (item: ModerationItem) => {
    setActionLoading(item.id);
    await approveItem(item.id);
    setActionLoading(null);
  };

  const handleWarn = async (item: ModerationItem) => {
    setActionLoading(item.id);
    await warnUser(item.id, item.user.id);
    setActionLoading(null);
  };

  const handleRemove = async (item: ModerationItem) => {
    setActionLoading(item.id);
    await removeContent(item.id, item.type, item.user.id);
    setActionLoading(null);
  };

  return (
    <div className="bg-[#050505] font-display text-white antialiased overflow-hidden">
      <div className="flex h-screen w-full overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-72 h-full border-r border-white/10 bg-[#121212] shrink-0">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#ef4343] to-orange-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#ef4343]/20">
                R
              </div>
              <div className="flex flex-col">
                <h1 className="text-base font-bold leading-none tracking-tight">RepMax</h1>
                <p className="text-xs text-slate-400 mt-1">Admin Panel</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
            <Link href="/admin/analytics" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 rounded-lg transition-colors group">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#ef4343] transition-colors">dashboard</span>
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link href="/admin/moderation" className="flex items-center gap-3 px-4 py-3 bg-[#ef4343]/10 text-[#ef4343] rounded-lg transition-colors">
              <span className="material-symbols-outlined">shield_person</span>
              <span className="text-sm font-medium">Content Moderation</span>
              {stats && stats.pendingReview > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#ef4343] text-[10px] font-bold text-white">
                  {stats.pendingReview}
                </span>
              )}
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 rounded-lg transition-colors group">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#ef4343] transition-colors">group</span>
              <span className="text-sm font-medium">User Management</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 rounded-lg transition-colors group">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#ef4343] transition-colors">description</span>
              <span className="text-sm font-medium">Reports</span>
            </Link>
            <div className="my-2 h-px bg-white/10 mx-4"></div>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 rounded-lg transition-colors group">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#ef4343] transition-colors">settings</span>
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </nav>
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="h-9 w-9 rounded-full bg-white/10"></div>
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-medium truncate text-white">Alex Morgan</p>
                <p className="text-xs text-slate-500 truncate">Super Admin</p>
              </div>
              <button className="ml-auto text-slate-400 hover:text-white">
                <span className="material-symbols-outlined text-xl">logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Top Header & Filter Bar */}
          <div className="flex flex-col border-b border-white/10 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight text-white">Content Moderation</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#ef4343]/10 border border-[#ef4343]/20 px-2.5 py-0.5 text-xs font-semibold text-[#ef4343]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ef4343] animate-pulse"></span>
                    Live Queue
                  </span>
                </div>
                <p className="text-slate-400 text-sm">Review reported content and take action.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                  <span className="text-sm font-bold">
                    {isLoading ? '...' : `${stats?.pendingReview ?? 0} items flagged`}
                  </span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="px-6 pb-4 flex flex-wrap gap-2 items-center">
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[18px]">filter_list</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                  className="pl-9 pr-8 py-2 bg-[#1E1E1E] border-none rounded-lg text-sm font-medium text-slate-200 focus:ring-2 focus:ring-[#ef4343] outline-none appearance-none cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="photo">Photo</option>
                  <option value="bio">Bio</option>
                  <option value="film">Film</option>
                </select>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[18px] pointer-events-none">arrow_drop_down</span>
              </div>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[18px]">schedule</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="pl-9 pr-8 py-2 bg-[#1E1E1E] border-none rounded-lg text-sm font-medium text-slate-200 focus:ring-2 focus:ring-[#ef4343] outline-none appearance-none cursor-pointer"
                >
                  <option value="pending">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="warned">Warned</option>
                  <option value="removed">Removed</option>
                  <option value="all">All Statuses</option>
                </select>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[18px] pointer-events-none">arrow_drop_down</span>
              </div>
              <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block"></div>
              <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 rounded-lg transition-colors ml-auto sm:ml-0">
                <span className="material-symbols-outlined text-[18px]">sort</span>
                <span>Oldest first</span>
              </button>
            </div>
          </div>

          {/* Content Area (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="h-10 w-10 rounded-full border-2 border-[#ef4343] border-t-transparent animate-spin mb-4"></div>
                <p className="text-slate-400 text-sm">Loading moderation queue...</p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>
                <p className="text-red-400 text-lg font-medium mb-2">Failed to load moderation queue</p>
                <p className="text-slate-500 text-sm">{error.message}</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-green-500 text-4xl">check_circle</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
                <p className="text-slate-400 text-sm text-center max-w-md">
                  {statusFilter === 'pending'
                    ? 'There are no items pending review. Great job keeping the platform clean!'
                    : `No items found with status "${statusFilter}".`}
                </p>
              </div>
            )}

            {/* Items Grid */}
            {!isLoading && !error && items.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 max-w-[1600px] mx-auto pb-10">
                {items.map((item) => {
                  const typeBadge = getTypeBadge(item.type);
                  const isActionLoading = actionLoading === item.id;

                  return (
                    <div key={item.id} className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden shadow-sm flex flex-col group hover:border-[#ef4343]/30 transition-all duration-300">
                      {/* Card Header */}
                      <div className="p-4 flex items-start justify-between border-b border-white/5 bg-[#1E1E1E]/30">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 rounded-full bg-cover bg-center ring-2 ring-white/10"
                            style={{ backgroundImage: item.user.imageUrl ? `url('${item.user.imageUrl}')` : undefined }}
                          >
                            {!item.user.imageUrl && (
                              <div className="h-full w-full rounded-full bg-slate-700 flex items-center justify-center text-slate-400 text-sm font-medium">
                                {item.user.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-white">{item.user.name}</h3>
                              <span className="text-xs text-slate-500 font-mono">ID: #{item.id.slice(0, 4)}</span>
                            </div>
                            <p className="text-xs text-slate-500">Reported {item.reportedAgo}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${typeBadge.classes}`}>
                          <span className="material-symbols-outlined text-[14px]">{typeBadge.icon}</span>
                          {typeBadge.label}
                        </span>
                      </div>

                      {/* Content Preview */}
                      {item.type === 'bio' ? (
                        <div className="p-6 flex-1 flex flex-col bg-[#1E1E1E]/20">
                          <div className="mb-3">
                            <div className="bg-red-500/10 text-red-500 inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold border border-red-500/20">
                              <span className="material-symbols-outlined text-[14px]">flag</span>
                              Flagged: {item.flagReason}
                            </div>
                          </div>
                          <div className="bg-[#1E1E1E] p-4 rounded-lg border border-white/5 relative">
                            <span className="material-symbols-outlined absolute -top-2 -left-2 text-white/20 text-3xl bg-[#1E1E1E] rounded-full">format_quote</span>
                            <p className="text-slate-200 font-medium leading-relaxed italic">
                              {item.content || 'No content preview available'}
                            </p>
                          </div>
                          {item.matchConfidence && (
                            <p className="text-xs text-slate-400 mt-3 text-right">Match Confidence: {item.matchConfidence}</p>
                          )}
                        </div>
                      ) : (
                        <div className="relative aspect-video bg-black/50 overflow-hidden group/image">
                          {/* Blurred content overlay for sensitive items */}
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center">
                            <span className="material-symbols-outlined text-white/20 text-6xl">{item.type === 'film' ? 'movie' : 'image'}</span>
                          </div>
                          {item.flagReason === 'Nudity' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10 transition-opacity duration-300 group-hover/image:opacity-0 cursor-pointer">
                              <span className="material-symbols-outlined text-white text-4xl mb-2">visibility_off</span>
                              <p className="text-white font-medium text-sm">Sensitive Content</p>
                              <p className="text-white/60 text-xs">Click to reveal</p>
                            </div>
                          )}
                          {item.type === 'film' && (
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                              <button className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform text-white border border-white/30">
                                <span className="material-symbols-outlined text-3xl">play_arrow</span>
                              </button>
                            </div>
                          )}
                          <div className="absolute bottom-3 left-3 z-20">
                            <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-lg">
                              <span className="material-symbols-outlined text-[14px]">flag</span>
                              Flagged: {item.flagReason}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="p-4 flex items-center gap-2 mt-auto border-t border-white/5 bg-[#1E1E1E]/10">
                        <button
                          onClick={() => handleApprove(item)}
                          disabled={isActionLoading}
                          className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm font-semibold transition-colors border border-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isActionLoading ? (
                            <div className="h-4 w-4 rounded-full border-2 border-green-400 border-t-transparent animate-spin"></div>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[18px]">check_circle</span>
                              Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleWarn(item)}
                          disabled={isActionLoading}
                          className="h-10 w-10 flex items-center justify-center rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 transition-colors border border-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Warn User"
                        >
                          <span className="material-symbols-outlined text-[20px]">warning</span>
                        </button>
                        <button
                          onClick={() => handleRemove(item)}
                          disabled={isActionLoading}
                          className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-[#ef4343] hover:bg-red-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-[#ef4343]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isActionLoading ? (
                            <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                              Remove
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
