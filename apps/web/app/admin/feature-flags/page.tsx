'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  status: 'enabled' | 'beta' | 'disabled' | 'canary';
  scope: string;
  rollout?: string;
  isNew?: boolean;
  icon: string;
  iconColor: string;
}

const mockFlags: FeatureFlag[] = [
  { id: '1', name: 'Messaging', key: 'feat_messaging_v1', status: 'enabled', scope: 'All Users', icon: 'chat', iconColor: 'text-green-500 bg-green-500/10' },
  { id: '2', name: 'Film Upload', key: 'feat_vid_upload_beta', status: 'beta', scope: 'Pro & Team', icon: 'video_library', iconColor: 'text-yellow-500 bg-yellow-500/10' },
  { id: '3', name: 'AI Scouting Reports', key: 'feat_ai_reports_gen', status: 'disabled', scope: 'Staff Only', icon: 'psychology', iconColor: 'text-red-500 bg-red-500/10' },
  { id: '4', name: 'Zone Map v2', key: 'feat_zone_map_canary', status: 'canary', scope: 'Percentage Rollout', rollout: '15%', isNew: true, icon: 'map', iconColor: 'text-blue-500 bg-blue-500/10' },
];

function getStatusStyles(status: string) {
  switch (status) {
    case 'enabled':
      return { label: 'Enabled', classes: 'bg-green-500/10 text-green-500 border-green-500/20', dotClass: 'bg-green-500' };
    case 'beta':
      return { label: 'Beta', classes: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', dotClass: 'bg-yellow-500 animate-pulse' };
    case 'canary':
      return { label: 'Canary', classes: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', dotClass: 'bg-yellow-500 animate-pulse' };
    case 'disabled':
      return { label: 'Disabled', classes: 'bg-red-500/10 text-red-500 border-red-500/20', dotClass: 'bg-red-500' };
    default:
      return { label: 'Unknown', classes: 'bg-gray-500/10 text-gray-500 border-gray-500/20', dotClass: 'bg-gray-500' };
  }
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState(mockFlags);

  const toggleFlag = (id: string) => {
    setFlags(flags.map(flag => {
      if (flag.id === id) {
        const newStatus = flag.status === 'enabled' || flag.status === 'beta' || flag.status === 'canary' ? 'disabled' : 'enabled';
        return { ...flag, status: newStatus as 'enabled' | 'disabled' };
      }
      return flag;
    }));
  };

  return (
    <div className="bg-[#050505] text-white font-display overflow-hidden antialiased">
      <div className="flex h-screen w-full">
        {/* Side Navigation */}
        <aside className="w-64 flex-shrink-0 border-r border-[#27272a] bg-[#0a0a0a] flex flex-col justify-between p-4 hidden md:flex">
          <div className="flex flex-col gap-6">
            {/* Branding */}
            <div className="flex gap-3 items-center px-2">
              <div className="size-10 rounded-lg bg-[#ef4343]/20 flex items-center justify-center text-[#ef4343]">
                <span className="material-symbols-outlined">flag</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-white text-base font-bold leading-normal tracking-tight">RepMax</h1>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Admin Console</p>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-col gap-2 mt-4">
              <Link href="/admin/analytics" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors group">
                <span className="material-symbols-outlined text-gray-500 group-hover:text-white transition-colors">dashboard</span>
                <span className="text-sm font-medium">Dashboard</span>
              </Link>
              <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors group">
                <span className="material-symbols-outlined text-gray-500 group-hover:text-white transition-colors">group</span>
                <span className="text-sm font-medium">Users</span>
              </Link>
              <Link href="/admin/feature-flags" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#ef4343]/10 text-[#ef4343] border border-[#ef4343]/20">
                <span className="material-symbols-outlined">flag</span>
                <span className="text-sm font-bold">Feature Flags</span>
              </Link>
              <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors group">
                <span className="material-symbols-outlined text-gray-500 group-hover:text-white transition-colors">settings</span>
                <span className="text-sm font-medium">Settings</span>
              </Link>
              <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors group">
                <span className="material-symbols-outlined text-gray-500 group-hover:text-white transition-colors">description</span>
                <span className="text-sm font-medium">Logs</span>
              </Link>
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className="px-2">
            <button className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition-colors">
              <span className="material-symbols-outlined">logout</span>
              <span className="text-sm font-medium">Log Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#050505]">
          {/* Top Header */}
          <header className="flex items-center justify-between border-b border-[#27272a] px-8 py-4 bg-[#0a0a0a]">
            <div className="flex items-center gap-2 text-gray-400">
              <span className="material-symbols-outlined text-[20px]">home</span>
              <span className="text-sm">/</span>
              <span className="text-sm font-medium text-white">Feature Management</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 pl-4 border-l border-[#27272a]">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">Sarah Jenkins</p>
                  <p className="text-xs text-gray-500">Lead Engineer</p>
                </div>
                <div className="size-9 rounded-full bg-gray-600 ring-2 ring-[#27272a]"></div>
              </div>
            </div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
              {/* Page Heading & Actions */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-black text-white tracking-tight">Feature Flags</h1>
                  <p className="text-gray-400 max-w-2xl">Manage platform capabilities, toggle visibility, and control rollout scopes for the RepMax admin and user portals.</p>
                </div>
                <button className="flex items-center gap-2 bg-[#ef4343] hover:bg-red-500 text-white px-5 py-2.5 rounded-lg font-bold shadow-[0_0_15px_rgba(239,67,67,0.3)] transition-all active:scale-95">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  <span>Add New Flag</span>
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-[#121212] p-2 rounded-xl border border-[#27272a]">
                {/* Search */}
                <div className="relative w-full lg:max-w-md group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-500 group-focus-within:text-[#ef4343] transition-colors">search</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Search features by name, key, or tag..."
                    className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-[#0a0a0a] text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#ef4343]/50 sm:text-sm"
                  />
                </div>

                {/* Segmented Controls */}
                <div className="flex p-1 bg-[#0a0a0a] rounded-lg w-full lg:w-auto overflow-x-auto">
                  <label className="cursor-pointer">
                    <input type="radio" name="filter" className="peer sr-only" defaultChecked />
                    <span className="block px-4 py-1.5 rounded-md text-sm font-medium text-gray-400 peer-checked:bg-[#121212] peer-checked:text-white peer-checked:shadow transition-all whitespace-nowrap">All Features</span>
                  </label>
                  <label className="cursor-pointer">
                    <input type="radio" name="filter" className="peer sr-only" />
                    <span className="block px-4 py-1.5 rounded-md text-sm font-medium text-gray-400 peer-checked:bg-[#121212] peer-checked:text-white peer-checked:shadow transition-all whitespace-nowrap">Active</span>
                  </label>
                  <label className="cursor-pointer">
                    <input type="radio" name="filter" className="peer sr-only" />
                    <span className="block px-4 py-1.5 rounded-md text-sm font-medium text-gray-400 peer-checked:bg-[#121212] peer-checked:text-white peer-checked:shadow transition-all whitespace-nowrap">Beta</span>
                  </label>
                  <label className="cursor-pointer">
                    <input type="radio" name="filter" className="peer sr-only" />
                    <span className="block px-4 py-1.5 rounded-md text-sm font-medium text-gray-400 peer-checked:bg-[#121212] peer-checked:text-white peer-checked:shadow transition-all whitespace-nowrap">Deprecated</span>
                  </label>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-[#121212] rounded-xl border border-[#27272a] overflow-hidden shadow-2xl shadow-black/50">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#1a1a1a] border-b border-[#27272a] text-xs uppercase tracking-wider text-gray-500 font-semibold">
                        <th className="px-6 py-4">Feature Name</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Target Scope</th>
                        <th className="px-6 py-4">Rollout %</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#27272a]">
                      {flags.map((flag) => {
                        const statusStyles = getStatusStyles(flag.status);
                        const isEnabled = flag.status === 'enabled' || flag.status === 'beta' || flag.status === 'canary';
                        return (
                          <tr key={flag.id} className={`group hover:bg-[#1a1a1a] transition-colors ${flag.isNew ? 'bg-gradient-to-r from-transparent to-[#ef4343]/5' : ''}`}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${flag.iconColor}`}>
                                  <span className="material-symbols-outlined">{flag.icon}</span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-white text-sm">{flag.name}</p>
                                    {flag.isNew && <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500 text-white font-bold">NEW</span>}
                                  </div>
                                  <p className="text-xs text-gray-500 font-mono mt-0.5">{flag.key}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles.classes}`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusStyles.dotClass}`}></span>
                                {statusStyles.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="relative">
                                <select className="block w-full pl-3 pr-8 py-1.5 text-xs bg-[#0a0a0a] border border-[#27272a] text-white rounded-md focus:outline-none focus:ring-1 focus:ring-[#ef4343] focus:border-[#ef4343] appearance-none cursor-pointer hover:border-gray-600 transition-colors">
                                  <option>{flag.scope}</option>
                                  <option>All Users</option>
                                  <option>Pro & Team</option>
                                  <option>Staff Only</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                  <span className="material-symbols-outlined text-[16px]">expand_more</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {flag.rollout ? (
                                <div className="flex items-center gap-2">
                                  <div className="relative w-24">
                                    <select className="block w-full pl-2 pr-6 py-1 text-xs bg-[#222] border border-[#ef4343]/40 text-white rounded focus:outline-none focus:border-[#ef4343] appearance-none cursor-pointer">
                                      <option>10%</option>
                                      <option>{flag.rollout}</option>
                                      <option>25%</option>
                                      <option>50%</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-400">
                                      <span className="material-symbols-outlined text-[14px]">unfold_more</span>
                                    </div>
                                  </div>
                                  <span className="text-[10px] text-gray-500">Traffic</span>
                                </div>
                              ) : (
                                <span className="text-gray-600 text-xs italic">{flag.status === 'enabled' ? '100% rollout' : 'N/A'}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <label className="inline-flex relative items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isEnabled}
                                  onChange={() => toggleFlag(flag.id)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#eab308] shadow-inner"></div>
                              </label>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-[#27272a] bg-[#121212] flex items-center justify-between text-xs text-gray-500">
                  <div>
                    Showing <span className="text-white font-medium">1-4</span> of <span className="text-white font-medium">12</span> flags
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 rounded bg-[#0a0a0a] border border-[#27272a] hover:text-white hover:border-gray-500 disabled:opacity-50" disabled>Previous</button>
                    <button className="px-3 py-1 rounded bg-[#0a0a0a] border border-[#27272a] hover:text-white hover:border-gray-500">Next</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
