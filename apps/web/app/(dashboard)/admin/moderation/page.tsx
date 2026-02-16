'use client';

import { useState, useCallback } from 'react';
import { useAdminModeration, type ModerationItem } from '@/lib/hooks';

type ContentFilter = 'all' | 'photo' | 'bio' | 'film';

const typeIcons: Record<string, string> = {
  photo: 'photo_camera',
  bio: 'description',
  film: 'videocam',
};

const typeLabels: Record<string, string> = {
  photo: 'Photo',
  bio: 'Bio Text',
  film: 'Film',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function AdminModerationPage() {
  const [typeFilter, setTypeFilter] = useState<ContentFilter>('all');

  const { items, stats, isLoading, error, approveItem, warnUser, removeContent } =
    useAdminModeration({ type: typeFilter });

  const handleApprove = useCallback(
    async (item: ModerationItem) => {
      await approveItem(item.id);
    },
    [approveItem]
  );

  const handleWarn = useCallback(
    async (item: ModerationItem) => {
      await warnUser(item.id, item.user.id);
    },
    [warnUser]
  );

  const handleRemove = useCallback(
    async (item: ModerationItem) => {
      await removeContent(item.id, item.type, item.user.id);
    },
    [removeContent]
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
          <h3 className="text-white font-semibold mb-2">Failed to load moderation queue</h3>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  const filterTabs: { value: ContentFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'photo', label: 'Photos' },
    { value: 'bio', label: 'Bios' },
    { value: 'film', label: 'Film' },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Content Moderation</h1>
          <p className="text-slate-400">Review flagged content and take moderation actions</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1F1F22] rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <span className="material-symbols-outlined text-[20px]">flag</span>
              Total Flagged
            </div>
            <span className="text-3xl font-bold text-white">{stats?.totalFlagged ?? 0}</span>
          </div>
          <div className="bg-[#1F1F22] rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <span className="material-symbols-outlined text-[20px]">pending</span>
              Pending Review
            </div>
            <span className="text-3xl font-bold text-yellow-400">{stats?.pendingReview ?? 0}</span>
          </div>
          <div className="bg-[#1F1F22] rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              Resolved Today
            </div>
            <span className="text-3xl font-bold text-green-400">{stats?.resolvedToday ?? 0}</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setTypeFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === tab.value
                  ? 'bg-primary text-black'
                  : 'bg-[#1F1F22] text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {items.length === 0 ? (
          /* Empty State */
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-12 text-center">
            <span className="material-symbols-outlined text-slate-600 text-5xl mb-4 block">
              shield
            </span>
            <h3 className="text-white font-semibold text-lg mb-2">No flagged content</h3>
            <p className="text-slate-400 text-sm">All content has been reviewed</p>
          </div>
        ) : (
          /* Card Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((item: ModerationItem) => (
              <div
                key={item.id}
                className="bg-[#1F1F22] rounded-xl border border-white/5 overflow-hidden flex flex-col"
              >
                {/* Content Preview */}
                <div className="p-4 border-b border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">
                      {typeIcons[item.type] || 'article'}
                    </span>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      {typeLabels[item.type] || item.type}
                    </span>
                    {item.matchConfidence && (
                      <span className="ml-auto text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded">
                        {item.matchConfidence} match
                      </span>
                    )}
                  </div>
                  {item.content && (
                    <p className="text-sm text-slate-300 line-clamp-3">{item.content}</p>
                  )}
                  {!item.content && item.type === 'photo' && (
                    <div className="h-24 bg-[#2A2A2E] rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-600 text-3xl">
                        image
                      </span>
                    </div>
                  )}
                  {!item.content && item.type === 'film' && (
                    <div className="h-24 bg-[#2A2A2E] rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-600 text-3xl">
                        play_circle
                      </span>
                    </div>
                  )}
                </div>

                {/* User Info & Flag Reason */}
                <div className="p-4 flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="size-8 rounded-full bg-[#2A2A2E] flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {getInitials(item.user.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.user.name}</p>
                      <p className="text-xs text-slate-500">{item.reportedAgo}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-yellow-400 shrink-0 mt-0.5">
                      warning
                    </span>
                    <p className="text-xs text-slate-400">{item.flagReason}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 border-t border-white/5 flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-500/10 text-green-400 text-sm font-medium px-3 py-2 rounded-lg hover:bg-green-500/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">check</span>
                    Approve
                  </button>
                  <button
                    onClick={() => handleWarn(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-yellow-500/10 text-yellow-400 text-sm font-medium px-3 py-2 rounded-lg hover:bg-yellow-500/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    Warn
                  </button>
                  <button
                    onClick={() => handleRemove(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 text-red-400 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
