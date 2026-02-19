'use client';

import { useState, useCallback } from 'react';
import { Loader2, X } from 'lucide-react';
import { useCommunicationLogs, type CommunicationLog } from '@/lib/hooks';

function getTypeStyles(type: CommunicationLog['type']) {
  switch (type) {
    case 'call':
      return { icon: 'call', label: 'Call', classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    case 'visit':
      return { icon: 'tour', label: 'Visit', classes: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
    case 'email':
      return { icon: 'mail', label: 'Email', classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    case 'message':
      return { icon: 'chat_bubble', label: 'Message', classes: 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20' };
    default:
      return { icon: 'description', label: 'Other', classes: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
  }
}

function debounce<T extends (...args: string[]) => void>(fn: T, delay: number): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: string[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}

export default function CommunicationsPage() {
  const {
    logs,
    staffMembers,
    pagination,
    isLoading,
    error,
    filters,
    setTypeFilter,
    setSearchFilter,
    setStaffFilter,
    setDateFilter,
    goToPage,
    logCommunication,
  } = useCommunicationLogs();

  const [searchInput, setSearchInput] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchFilter(value);
    }, 300),
    [setSearchFilter]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setTypeFilter(value === 'All Types' ? '' : value.toLowerCase());
  };

  const handleStaffChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStaffFilter(value === 'All Staff' ? '' : value);
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateFrom(value);
    setDateFilter(value, dateTo);
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateTo(value);
    setDateFilter(dateFrom, value);
  };

  const clearDateFilter = () => {
    setDateFrom('');
    setDateTo('');
    setDateFilter('', '');
  };

  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="flex min-w-72 flex-col gap-2">
          <h1 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Communication Log</h1>
          <p className="text-[#c9bc92] text-base font-normal leading-normal max-w-2xl">Track and manage all prospect interactions across the recruiting team.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-[#D4AF37] hover:bg-yellow-400 text-[#221e11] gap-2 text-sm font-bold leading-normal tracking-[0.015em] transition-all shadow-lg shadow-yellow-900/20 whitespace-nowrap w-fit"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span className="truncate">Log Communication</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="w-full bg-[#1A1A1A] rounded-xl border border-[#333] p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Search */}
          <div className="md:col-span-5 lg:col-span-4">
            <label className="block text-xs font-medium text-[#c9bc92] mb-1.5 ml-1">Search Logs</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c9bc92]">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </span>
              <input
                type="text"
                placeholder="Search by name, summary..."
                value={searchInput}
                onChange={handleSearchChange}
                className="w-full bg-[#0F0F0F] border border-[#333] rounded-lg h-10 pl-10 pr-4 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all font-mono"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="md:col-span-3 lg:col-span-2">
            <label className="block text-xs font-medium text-[#c9bc92] mb-1.5 ml-1">Type</label>
            <div className="relative">
              <select
                value={filters.type ? filters.type.charAt(0).toUpperCase() + filters.type.slice(1) : 'All Types'}
                onChange={handleTypeChange}
                className="w-full bg-[#0F0F0F] border border-[#333] rounded-lg h-10 pl-3 pr-8 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] appearance-none cursor-pointer"
              >
                <option>All Types</option>
                <option>Call</option>
                <option>Email</option>
                <option>Visit</option>
                <option>Message</option>
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#c9bc92] pointer-events-none flex items-center">
                <span className="material-symbols-outlined text-[20px]">expand_more</span>
              </span>
            </div>
          </div>

          {/* Date Range */}
          <div className="md:col-span-4 lg:col-span-3">
            <label className="block text-xs font-medium text-[#c9bc92] mb-1.5 ml-1">Date Range</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={handleDateFromChange}
                  className="w-full bg-[#0F0F0F] border border-[#333] rounded-lg h-10 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] font-mono [color-scheme:dark]"
                />
              </div>
              <span className="text-[#888] text-xs">to</span>
              <div className="relative flex-1">
                <input
                  type="date"
                  value={dateTo}
                  onChange={handleDateToChange}
                  className="w-full bg-[#0F0F0F] border border-[#333] rounded-lg h-10 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] font-mono [color-scheme:dark]"
                />
              </div>
              {(dateFrom || dateTo) && (
                <button
                  onClick={clearDateFilter}
                  className="flex items-center justify-center h-10 w-10 rounded-lg border border-[#333] bg-[#0F0F0F] text-[#888] hover:text-white hover:border-[#555] transition-colors"
                  title="Clear date filter"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Staff Filter */}
          <div className="md:col-span-12 lg:col-span-3">
            <label className="block text-xs font-medium text-[#c9bc92] mb-1.5 ml-1">Staff Member</label>
            <div className="relative">
              <select
                value={filters.staff || 'All Staff'}
                onChange={handleStaffChange}
                className="w-full bg-[#0F0F0F] border border-[#333] rounded-lg h-10 pl-3 pr-8 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] appearance-none cursor-pointer"
              >
                <option value="All Staff">All Staff</option>
                {staffMembers.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name}
                  </option>
                ))}
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#c9bc92] pointer-events-none flex items-center">
                <span className="material-symbols-outlined text-[20px]">expand_more</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="w-full bg-[#1F1F22] rounded-xl border border-[#333] overflow-hidden flex flex-col flex-1 shadow-2xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-red-500">{error.message}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="size-16 rounded-full bg-[#2A2A2E] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-[#555]">chat</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No communication logs yet</h3>
            <p className="text-[#888] text-sm">Start messaging prospects to see your communication history here.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#333] bg-[#252529]">
                    <th className="py-4 px-6 text-xs font-semibold text-[#888] uppercase tracking-wider w-[240px]">Prospect</th>
                    <th className="py-4 px-6 text-xs font-semibold text-[#888] uppercase tracking-wider w-[120px]">Type</th>
                    <th className="py-4 px-6 text-xs font-semibold text-[#888] uppercase tracking-wider min-w-[300px]">Summary</th>
                    <th className="py-4 px-6 text-xs font-semibold text-[#888] uppercase tracking-wider w-[180px]">Staff</th>
                    <th className="py-4 px-6 text-xs font-semibold text-[#888] uppercase tracking-wider w-[180px]">Date/Time</th>
                    <th className="py-4 px-6 text-xs font-semibold text-[#888] uppercase tracking-wider w-[60px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333]">
                  {logs.map((log) => {
                    const typeStyles = getTypeStyles(log.type);
                    return (
                      <tr key={log.id} className="group hover:bg-[#2A2A2E] transition-colors cursor-pointer">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${log.prospect.gradientFrom} ${log.prospect.gradientTo} flex items-center justify-center text-xs font-bold text-white border border-white/10`}>
                              {log.prospect.initials}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white">{log.prospect.name}</div>
                              <div className="text-xs text-[#888]">{log.prospect.classYear}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${typeStyles.classes}`}>
                            <span className="material-symbols-outlined text-[14px]">{typeStyles.icon}</span>
                            {typeStyles.label}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-[#ddd] line-clamp-1">{log.summary}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-[#444] overflow-hidden">
                              <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-[10px] text-zinc-400">{log.staff.initials}</div>
                            </div>
                            <span className="text-sm text-[#aaa] font-mono">{log.staff.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-[#aaa] font-mono">{log.datetime}</span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-[#666] opacity-50" title="Row actions coming soon">
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer / Pagination */}
            <div className="border-t border-[#333] bg-[#222] px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
              <span className="text-xs text-[#888] font-mono">
                Showing <span className="text-white">{startIndex}-{endIndex}</span> of <span className="text-white">{pagination.total}</span> logs
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="flex items-center justify-center h-8 px-3 rounded border border-[#333] bg-[#2A2A2E] text-xs font-medium text-[#aaa] hover:bg-[#333] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs text-[#888] px-2">
                  Page {pagination.page} of {pagination.totalPages || 1}
                </span>
                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="flex items-center justify-center h-8 px-3 rounded border border-[#333] bg-[#2A2A2E] text-xs font-medium text-[#aaa] hover:bg-[#333] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Log Communication Modal */}
      {isModalOpen && (
        <LogCommunicationModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={async (athleteId, commType, summary) => {
            const result = await logCommunication(athleteId, commType, summary);
            return result;
          }}
        />
      )}
    </div>
  );
}

function LogCommunicationModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (
    athleteId: string,
    commType: 'call' | 'email' | 'visit' | 'message',
    summary: string
  ) => Promise<{ success?: boolean; error?: string }>;
}) {
  const [formData, setFormData] = useState({
    athleteId: '',
    type: 'call' as 'call' | 'email' | 'visit' | 'message',
    summary: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.athleteId.trim()) {
      setSubmitError('Athlete ID is required');
      return;
    }
    setIsSubmitting(true);
    setSubmitError('');

    const summaryText = formData.summary || `${formData.type} logged on ${formData.date} at ${formData.time}`;
    const result = await onSubmit(formData.athleteId, formData.type, summaryText);

    if (result.error) {
      setSubmitError(result.error);
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#1A1A1A] rounded-xl border border-[#333] w-full max-w-lg mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#333]">
          <h2 className="text-lg font-bold text-white">Log Communication</h2>
          <button
            onClick={onClose}
            className="text-[#888] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Athlete ID */}
          <div>
            <label className="block text-xs font-medium text-[#c9bc92] mb-1.5">
              Athlete ID
            </label>
            <input
              type="text"
              value={formData.athleteId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, athleteId: e.target.value }))
              }
              placeholder="Enter athlete UUID"
              required
              className="w-full bg-[#0F0F0F] border border-[#333] rounded-lg h-10 px-3 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
            />
            {submitError && (
              <p className="text-red-400 text-xs mt-1">{submitError}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-[#c9bc92] mb-1.5">
              Communication Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  type: e.target.value as 'call' | 'email' | 'visit' | 'message',
                }))
              }
              className="w-full bg-[#0F0F0F] border border-[#333] rounded-lg h-10 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] appearance-none cursor-pointer"
            >
              <option value="call">Phone Call</option>
              <option value="email">Email</option>
              <option value="visit">Campus Visit</option>
              <option value="message">Direct Message</option>
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#c9bc92] mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                required
                className="w-full bg-[#0F0F0F] border border-[#333] rounded-lg h-10 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#c9bc92] mb-1.5">
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, time: e.target.value }))
                }
                required
                className="w-full bg-[#0F0F0F] border border-[#333] rounded-lg h-10 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-medium text-[#c9bc92] mb-1.5">
              Summary / Notes
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, summary: e.target.value }))
              }
              placeholder="Describe the communication..."
              rows={4}
              className="w-full bg-[#0F0F0F] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-lg border border-[#333] bg-transparent text-sm font-medium text-[#aaa] hover:bg-[#2A2A2E] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-5 rounded-lg bg-[#D4AF37] hover:bg-yellow-400 text-[#221e11] text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Log Communication
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
