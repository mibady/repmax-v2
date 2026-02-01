import Link from 'next/link';

interface CommunicationLog {
  id: string;
  prospect: {
    name: string;
    initials: string;
    gradientFrom: string;
    gradientTo: string;
    classYear: string;
  };
  type: 'call' | 'visit' | 'email' | 'message';
  summary: string;
  staff: {
    name: string;
    initials: string;
  };
  datetime: string;
}

const mockLogs: CommunicationLog[] = [
  {
    id: '1',
    prospect: { name: 'Jaylen Washington', initials: 'JW', gradientFrom: 'from-blue-600', gradientTo: 'to-indigo-800', classYear: "Class of '24" },
    type: 'call',
    summary: 'Discussed scholarship offer details and next steps for official visit scheduling.',
    staff: { name: 'Coach Mike', initials: 'CM' },
    datetime: '2023-10-24 14:00',
  },
  {
    id: '2',
    prospect: { name: 'Marcus Thompson', initials: 'MT', gradientFrom: 'from-purple-600', gradientTo: 'to-pink-800', classYear: "Class of '25" },
    type: 'visit',
    summary: 'Campus tour and facility walkthrough with family.',
    staff: { name: 'Admin Sarah', initials: 'AS' },
    datetime: '2023-10-23 09:30',
  },
  {
    id: '3',
    prospect: { name: "Liam O'Connor", initials: 'LO', gradientFrom: 'from-orange-600', gradientTo: 'to-red-800', classYear: 'Transfer Portal' },
    type: 'email',
    summary: 'Sent follow-up on transcript request and eligibility status.',
    staff: { name: 'Recruiter Jen', initials: 'RJ' },
    datetime: '2023-10-22 16:45',
  },
  {
    id: '4',
    prospect: { name: 'Darius Robinson', initials: 'DR', gradientFrom: 'from-teal-600', gradientTo: 'to-cyan-800', classYear: "Class of '24" },
    type: 'message',
    summary: 'Replied to DM regarding game tickets for Saturday.',
    staff: { name: 'Coach Mike', initials: 'CM' },
    datetime: '2023-10-22 10:15',
  },
  {
    id: '5',
    prospect: { name: 'Elijah Williams', initials: 'EW', gradientFrom: 'from-yellow-600', gradientTo: 'to-red-600', classYear: "Class of '25" },
    type: 'call',
    summary: 'Brief check-in call before the away game.',
    staff: { name: 'Recruiter Jen', initials: 'RJ' },
    datetime: '2023-10-21 18:30',
  },
];

function getTypeStyles(type: string) {
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

export default function CommunicationsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-display flex flex-col antialiased selection:bg-[#D4AF37] selection:text-black">
      <div className="flex h-full grow flex-col w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumbs & Header */}
        <div className="flex flex-col gap-6 mb-8">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap gap-2 items-center text-sm">
            <Link href="/" className="text-[#c9bc92] hover:text-[#D4AF37] transition-colors font-medium leading-normal">RepMax</Link>
            <span className="text-[#c9bc92] font-medium leading-normal material-symbols-outlined text-[16px]">chevron_right</span>
            <Link href="/dashboard/recruiter" className="text-[#c9bc92] hover:text-[#D4AF37] transition-colors font-medium leading-normal">Dashboard</Link>
            <span className="text-[#c9bc92] font-medium leading-normal material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-white font-medium leading-normal">Logs</span>
          </div>

          {/* Page Title & Primary Action */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex min-w-72 flex-col gap-2">
              <h1 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Communication Log</h1>
              <p className="text-[#c9bc92] text-base font-normal leading-normal max-w-2xl">Track and manage all prospect interactions across the recruiting team.</p>
            </div>
            <button className="flex items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-[#D4AF37] hover:bg-yellow-400 text-[#221e11] gap-2 text-sm font-bold leading-normal tracking-[0.015em] transition-all shadow-lg shadow-yellow-900/20 whitespace-nowrap w-fit">
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span className="truncate">Log Communication</span>
            </button>
          </div>
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
                  className="w-full bg-[#0F0F0F] border border-[#333] rounded-lg h-10 pl-10 pr-4 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all font-mono"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="md:col-span-3 lg:col-span-2">
              <label className="block text-xs font-medium text-[#c9bc92] mb-1.5 ml-1">Type</label>
              <div className="relative">
                <select className="w-full bg-[#0F0F0F] border border-[#333] rounded-lg h-10 pl-3 pr-8 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] appearance-none cursor-pointer">
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
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c9bc92]">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                </span>
                <input
                  type="text"
                  placeholder="Oct 1 - Oct 31, 2023"
                  className="w-full bg-[#0F0F0F] border border-[#333] rounded-lg h-10 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] font-mono"
                />
              </div>
            </div>

            {/* Staff Filter */}
            <div className="md:col-span-12 lg:col-span-3">
              <label className="block text-xs font-medium text-[#c9bc92] mb-1.5 ml-1">Staff Member</label>
              <div className="relative">
                <select className="w-full bg-[#0F0F0F] border border-[#333] rounded-lg h-10 pl-3 pr-8 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] appearance-none cursor-pointer">
                  <option>All Staff</option>
                  <option>Coach Mike</option>
                  <option>Recruiter Jen</option>
                  <option>Admin Sarah</option>
                </select>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#c9bc92] pointer-events-none flex items-center">
                  <span className="material-symbols-outlined text-[20px]">expand_more</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table Container */}
        <div className="w-full bg-[#1F1F22] rounded-xl border border-[#333] overflow-hidden flex flex-col grow shadow-2xl">
          <div className="overflow-x-auto">
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
                {mockLogs.map((log) => {
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
                        <button className="text-[#666] hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer / Pagination */}
          <div className="border-t border-[#333] bg-[#222] px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-xs text-[#888] font-mono">Showing <span className="text-white">1-5</span> of <span className="text-white">142</span> logs</span>
            <div className="flex items-center gap-2">
              <button className="flex items-center justify-center h-8 px-3 rounded border border-[#333] bg-[#2A2A2E] text-xs font-medium text-[#aaa] hover:bg-[#333] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                Previous
              </button>
              <button className="flex items-center justify-center h-8 px-3 rounded border border-[#333] bg-[#2A2A2E] text-xs font-medium text-[#aaa] hover:bg-[#333] hover:text-white transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
