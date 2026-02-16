'use client';

import { useCallback } from 'react';
import {
  useFeatureFlags,
  getScopeDisplayText,
  isFlagActive,
  type FeatureFlag,
  type FeatureFlagsFilter,
} from '@/lib/hooks';

const statusBadgeColors: Record<string, { bg: string; text: string }> = {
  enabled: { bg: 'bg-green-500/10', text: 'text-green-400' },
  beta: { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  disabled: { bg: 'bg-red-500/10', text: 'text-red-400' },
  canary: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
};

const STATUS_FILTERS: { value: FeatureFlagsFilter['status']; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'deprecated', label: 'Disabled' },
];

export default function AdminFeatureFlagsPage() {
  const {
    flags,
    total,
    filtered,
    isLoading,
    isUpdating,
    error,
    filter,
    setFilter,
    toggleFlag,
  } = useFeatureFlags();

  const handleSearchChange = useCallback(
    (value: string) => {
      setFilter({ ...filter, search: value });
    },
    [filter, setFilter]
  );

  const handleStatusFilterChange = useCallback(
    (value: FeatureFlagsFilter['status']) => {
      setFilter({ ...filter, status: value });
    },
    [filter, setFilter]
  );

  const handleToggle = useCallback(
    async (flagId: string) => {
      await toggleFlag(flagId);
    },
    [toggleFlag]
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
          <h3 className="text-white font-semibold mb-2">Failed to load feature flags</h3>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Feature Flags</h1>
              <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
                {total}
              </span>
            </div>
            <p className="text-slate-400 mt-1">
              Manage feature rollout and configuration
              {filtered !== total && (
                <span className="text-slate-500"> &middot; Showing {filtered} of {total}</span>
              )}
            </p>
          </div>
        </div>

        {/* Search & Status Filter */}
        <div className="bg-[#1F1F22] rounded-xl border border-white/5 mb-6">
          <div className="p-4 flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <span className="material-symbols-outlined text-[20px] text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
                search
              </span>
              <input
                type="text"
                placeholder="Search flags by name or key..."
                value={filter.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-[#2A2A2E] text-white text-sm rounded-lg pl-10 pr-4 py-2.5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none placeholder:text-slate-500"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-2">
              {STATUS_FILTERS.map((sf) => (
                <button
                  key={sf.value}
                  onClick={() => handleStatusFilterChange(sf.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter.status === sf.value
                      ? 'bg-primary text-black'
                      : 'bg-[#2A2A2E] text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {sf.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Flags Table */}
        <div className="bg-[#1F1F22] rounded-xl border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Flag
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Scope
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Rollout %
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {flags.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <span className="material-symbols-outlined text-slate-600 text-4xl mb-2 block">
                        toggle_off
                      </span>
                      <p className="text-slate-500">No feature flags found</p>
                    </td>
                  </tr>
                ) : (
                  flags.map((flag: FeatureFlag) => {
                    const statusStyle = statusBadgeColors[flag.status] || statusBadgeColors.disabled;
                    const active = isFlagActive(flag);
                    const updating = isUpdating === flag.id;

                    return (
                      <tr key={flag.id} className="hover:bg-white/5 transition-colors">
                        {/* Flag Info */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="size-9 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${flag.iconColor}20` }}
                            >
                              <span
                                className="material-symbols-outlined text-[20px]"
                                style={{ color: flag.iconColor }}
                              >
                                {flag.icon}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-white">{flag.name}</p>
                                {flag.isNew && (
                                  <span className="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                                    NEW
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 font-mono">{flag.key}</p>
                              {flag.description && (
                                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                                  {flag.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded ${statusStyle.bg} ${statusStyle.text}`}
                          >
                            {flag.status.charAt(0).toUpperCase() + flag.status.slice(1)}
                          </span>
                        </td>

                        {/* Scope */}
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-400">
                            {getScopeDisplayText(flag.scope)}
                          </span>
                        </td>

                        {/* Rollout % */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-[#2A2A2E] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-300"
                                style={{ width: `${flag.rolloutPercentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-400 font-mono w-8 text-right">
                              {flag.rolloutPercentage}%
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleToggle(flag.id)}
                            disabled={updating}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#1F1F22] disabled:opacity-50 ${
                              active ? 'bg-primary' : 'bg-[#2A2A2E]'
                            }`}
                          >
                            <span
                              className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                                active ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
