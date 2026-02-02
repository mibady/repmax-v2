import Link from 'next/link';

interface StaffMember {
  id: string;
  name: string;
  region: string;
  rank?: number;
  calls: number;
  emails: number;
  visits: number;
  commits: number;
  imageUrl: string;
}

const mockStaff: StaffMember[] = [
  {
    id: '1',
    name: 'Michael Thompson',
    region: 'Midwest Region',
    rank: 1,
    calls: 142,
    emails: 89,
    visits: 12,
    commits: 24,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyNLexujFhCy-TMljmEGrRUhyFoQYnAgLvxHeW25My0OkhKYAab71UtSWgXert5jWiYoX-lpii-3t80kU78Z-cxMuitdv4tDdXXrzivJm6pGXg7lRAq1LTd-LFQpKzpjRidjQBYJXvNdbReXV-d5L9Yz9Vi7fMHwuM1zkZbZS0XwZru7YNuy71t6dQXTnn72HVOlPw3uO4NorhDolwQP-uRDsKknOMmZEZIEegjhqm075shm0_NZDBpgGmIEaqmDX8fknDXamz7tI',
  },
  {
    id: '2',
    name: 'Sarah Jenkins',
    region: 'West Coast',
    rank: 2,
    calls: 118,
    emails: 104,
    visits: 9,
    commits: 18,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqkieKy6P5Y0WVEERRqdwJiR1i6kz33YF6sCMpOZ3A5mxStgZFFdIdflZQut-UX-qez0lR-FczUi4UOgUzFcA0f_BbD6dZsv9Hl2ni1aIRFbqD1Po6VeTxiWPS3SrVOCleKeRlQsSTcx7dB7fKA7AorSr5N45lClEnzIjhcPRUOW5HR2wAjGz4eDEFap0IBwdrHM1MFalFvVm77_WT_AzQK_t69LyasrtNyH06OoAFrzlNc9BCePpbcELpqQqidmVmxvHPdNRshgs',
  },
  {
    id: '3',
    name: 'David Chen',
    region: 'Northeast',
    rank: 3,
    calls: 98,
    emails: 67,
    visits: 15,
    commits: 14,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAz6PmTSU6EfPPCFCJASwdWNG8D6vQvs7MBesHKCTUUX-VKQy846AxlG7puHdHxxxOpqAeVKS6tJs4DRZp51jW-Vl8yJHXf6m-_xoxnJynu7AdBJZOWD_cfkXbHb2LpKg4hwCkWGWq7aXYBLGXQix1WQLDQeGo3mIsszE3CZggV9u8FhAjDO_h-CI36KVVzhLKFr6C3Es6MLzKTPsKMhSlrrm5YpdExbArPkgQgGpQeRzcZL1CicJV47K4nBTqRAhchSxwy4L_PWdo',
  },
  {
    id: '4',
    name: 'Robert Fox',
    region: 'South',
    calls: 85,
    emails: 92,
    visits: 6,
    commits: 11,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1iaTjS5A0jTJsQ4FqHfzgqE1wdxxDj4SdCklyggrjbsacR5JqzQUxXbB2ZXRWQ--Twc5uEZ3EwmxNVPp8hnS2wftKDGcHeR15Q7iw4IEcNyOZ3rWfbQm2iVW9A8L2XWwVBeXeRNm3ppiwewpzizvs-oTwx9eM2kl3h0XuvBYKLkZ2jleqvbWy1JXdO7ysZFTtjuT2imz8BWaySVqP3Xfuqa90ZGcxydORJJKfztg7ZnqytUFIw8Z3gmubP75FF9xZDEIfOoVJYBk',
  },
];

const zoneCoverage = [
  { zone: 'Zone 1', prospects: 450, height: '45%' },
  { zone: 'Zone 2', prospects: 750, height: '75%' },
  { zone: 'Zone 3', prospects: 300, height: '30%' },
  { zone: 'Zone 4', prospects: 600, height: '60%' },
  { zone: 'Zone 5', prospects: 850, height: '85%' },
  { zone: 'Zone 6', prospects: 400, height: '40%' },
];

function getRankBadgeColor(rank?: number) {
  if (rank === 1) return 'bg-[#D4AF37]';
  if (rank === 2) return 'bg-[#C0C0C0]';
  if (rank === 3) return 'bg-[#CD7F32]';
  return '';
}

export default function RecruitingReportsPage() {
  return (
    <div className="bg-[#050505] text-white overflow-x-hidden antialiased min-h-screen">
      <div className="flex min-h-screen w-full">
        {/* Side Navigation */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-[#333333] bg-[#050505] fixed h-full z-20">
          <div className="flex h-16 items-center px-6 border-b border-[#333333]">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <span className="material-symbols-outlined text-3xl">token</span>
              <span className="text-xl font-bold tracking-tight text-white">RepMax</span>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2">
            <Link href="/dashboard/recruiter" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[#A1A1AA] hover:bg-[#1F1F22] hover:text-white transition-colors group">
              <span className="material-symbols-outlined text-[#A1A1AA] group-hover:text-[#D4AF37]">dashboard</span>
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[#A1A1AA] hover:bg-[#1F1F22] hover:text-white transition-colors group">
              <span className="material-symbols-outlined text-[#A1A1AA] group-hover:text-[#D4AF37]">filter_alt</span>
              <span className="text-sm font-medium">Pipeline</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[#A1A1AA] hover:bg-[#1F1F22] hover:text-white transition-colors group">
              <span className="material-symbols-outlined text-[#A1A1AA] group-hover:text-[#D4AF37]">groups</span>
              <span className="text-sm font-medium">Recruits</span>
            </Link>
            <Link href="/dashboard/recruiter/reports" className="flex items-center gap-3 rounded-lg bg-[#1F1F22] px-3 py-2.5 text-white transition-colors group border-l-2 border-[#D4AF37]">
              <span className="material-symbols-outlined text-[#D4AF37]">bar_chart</span>
              <span className="text-sm font-medium">Reports</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[#A1A1AA] hover:bg-[#1F1F22] hover:text-white transition-colors group">
              <span className="material-symbols-outlined text-[#A1A1AA] group-hover:text-[#D4AF37]">campaign</span>
              <span className="text-sm font-medium">Campaigns</span>
            </Link>
          </nav>
          <div className="p-4 border-t border-[#333333]">
            <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#A1A1AA] hover:text-white transition-colors">
              <span className="material-symbols-outlined">settings</span>
              <span className="text-sm font-medium">Settings</span>
            </Link>
            <div className="mt-4 flex items-center gap-3 px-3">
              <div
                className="size-8 rounded-full bg-cover bg-center border border-[#2A2A2E]"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBn-KWLvWSGNb2gaJ0JDoW05oRf64L8JDwmbLMjvEnZHxeE6FWIo5Lmm_0ce2NT_WNhpgQDH-bwBfLvY925yXoA4RrIxd7zA3ZrJZoIh5H02agXIoPl10Bpprl2cw_ZgWEN-quEVaVWvxxQ-NrqB_XziidSpLaTDnsCTf9bWgltUZ268WOiCcpUqlgsAHsClhqu8kEz8Gpp_jvb7wA-HztfESIGOfbNyo1vQwtW0ti-7VNYjlG-NZZaLe4im_HW8yjWA-vqA1RUfmQ')" }}
              ></div>
              <div className="flex flex-col">
                <p className="text-xs font-medium text-white">Alex Morgan</p>
                <p className="text-[10px] text-[#A1A1AA]">Director of Recruiting</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64 flex flex-col min-h-screen">
          {/* Top Header */}
          <header className="h-16 border-b border-[#333333] bg-[#050505]/95 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between px-6 lg:px-10">
            <h2 className="text-lg font-semibold text-white">Department Overview</h2>
            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#A1A1AA] text-[20px]">search</span>
                <input
                  className="h-9 w-64 rounded-md border-none bg-[#1F1F22] pl-10 pr-4 text-sm text-white placeholder-[#A1A1AA] focus:ring-1 focus:ring-[#D4AF37]"
                  placeholder="Search reports..."
                  type="text"
                />
              </div>
              <button className="relative rounded-full p-1.5 text-[#A1A1AA] hover:bg-[#1F1F22] hover:text-white transition-colors">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[#D4AF37] border border-[#050505]"></span>
              </button>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto w-full">
            {/* Page Heading & Filters */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-white">Recruiting Reports</h1>
                <p className="text-[#A1A1AA]">Pipeline analytics and staff performance metrics</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="flex items-center gap-2 rounded-full border border-[#2A2A2E] bg-[#1F1F22] px-4 py-1.5 text-sm font-medium text-white hover:border-[#D4AF37]/50 transition-colors">
                  <span>Class of 2025</span>
                  <span className="material-symbols-outlined text-[16px]">expand_more</span>
                </button>
                <button className="flex items-center gap-2 rounded-full border border-[#2A2A2E] bg-[#1F1F22] px-4 py-1.5 text-sm font-medium text-white hover:border-[#D4AF37]/50 transition-colors">
                  <span>Varsity Program</span>
                  <span className="material-symbols-outlined text-[16px]">expand_more</span>
                </button>
                <button className="flex items-center gap-2 rounded-full border border-[#2A2A2E] bg-[#1F1F22] px-4 py-1.5 text-sm font-medium text-white hover:border-[#D4AF37]/50 transition-colors">
                  <span className="material-symbols-outlined text-[16px] text-[#D4AF37]">calendar_today</span>
                  <span>This Quarter</span>
                </button>
              </div>
            </div>

            {/* Pipeline Funnel Visualization */}
            <section className="rounded-xl border border-[#333333] bg-[#1F1F22] p-6 shadow-sm overflow-x-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#D4AF37]">filter_list</span>
                  Pipeline Funnel
                </h3>
                <button className="text-xs text-[#D4AF37] hover:text-white font-medium">View Detail</button>
              </div>
              <div className="min-w-[800px] flex flex-col">
                {/* Funnel Bars */}
                <div className="flex items-stretch gap-1 h-32 relative">
                  {/* Stage 1 */}
                  <div className="flex-1 flex flex-col group relative">
                    <div className="flex-1 bg-[#2A2A2E] rounded-l-lg relative border-r border-[#050505] overflow-hidden flex items-center justify-center">
                      <span className="relative z-10 text-2xl font-bold font-mono group-hover:scale-110 transition-transform">1,240</span>
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">Identified</p>
                    </div>
                  </div>
                  {/* Conversion 1-2 */}
                  <div className="absolute left-[18%] top-1/2 -translate-y-1/2 z-20 flex flex-col items-center -translate-y-[20px]">
                    <div className="bg-[#050505] border border-[#333] text-[10px] text-white px-2 py-0.5 rounded-full font-mono shadow-lg">68%</div>
                  </div>
                  {/* Stage 2 */}
                  <div className="flex-1 flex flex-col group relative">
                    <div className="flex-1 bg-[#3a3a3e] relative border-r border-[#050505] overflow-hidden flex items-center justify-center">
                      <span className="relative z-10 text-2xl font-bold font-mono text-white/90 group-hover:scale-110 transition-transform">843</span>
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">Contacted</p>
                    </div>
                  </div>
                  {/* Conversion 2-3 */}
                  <div className="absolute left-[38%] top-1/2 -translate-y-1/2 z-20 flex flex-col items-center -translate-y-[20px]">
                    <div className="bg-[#050505] border border-[#333] text-[10px] text-white px-2 py-0.5 rounded-full font-mono shadow-lg">45%</div>
                  </div>
                  {/* Stage 3 */}
                  <div className="flex-1 flex flex-col group relative">
                    <div className="flex-1 bg-[#4a4a4e] relative border-r border-[#050505] overflow-hidden flex items-center justify-center">
                      <span className="relative z-10 text-2xl font-bold font-mono text-white/90 group-hover:scale-110 transition-transform">379</span>
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">Visited</p>
                    </div>
                  </div>
                  {/* Conversion 3-4 */}
                  <div className="absolute left-[58%] top-1/2 -translate-y-1/2 z-20 flex flex-col items-center -translate-y-[20px]">
                    <div className="bg-[#050505] border border-[#333] text-[10px] text-white px-2 py-0.5 rounded-full font-mono shadow-lg">32%</div>
                  </div>
                  {/* Stage 4 */}
                  <div className="flex-1 flex flex-col group relative">
                    <div className="flex-1 bg-[#5a5a5e] relative border-r border-[#050505] overflow-hidden flex items-center justify-center">
                      <span className="relative z-10 text-2xl font-bold font-mono text-white/90 group-hover:scale-110 transition-transform">121</span>
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">Offered</p>
                    </div>
                  </div>
                  {/* Conversion 4-5 */}
                  <div className="absolute left-[78%] top-1/2 -translate-y-1/2 z-20 flex flex-col items-center -translate-y-[20px]">
                    <div className="bg-[#050505] border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] px-2 py-0.5 rounded-full font-mono shadow-lg shadow-[#D4AF37]/10">75%</div>
                  </div>
                  {/* Stage 5 */}
                  <div className="flex-1 flex flex-col group relative">
                    <div className="flex-1 bg-[#D4AF37]/10 rounded-r-lg relative overflow-hidden flex items-center justify-center border border-[#D4AF37]/20 shadow-[0_0_15px_-5px_rgba(212,175,53,0.3)]">
                      <div className="absolute inset-y-12 inset-x-0 bg-[#D4AF37] group-hover:bg-[#b08d1a] transition-colors"></div>
                      <span className="relative z-10 text-3xl font-bold font-mono text-white drop-shadow-md group-hover:scale-110 transition-transform">91</span>
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-1">Committed</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {/* Stat Card 1 */}
              <div className="rounded-xl border border-[#333333] bg-[#1F1F22] p-6 flex flex-col justify-between hover:border-[#D4AF37]/30 transition-colors group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[#A1A1AA] text-sm font-medium mb-1">Communications</p>
                    <p className="text-xs text-[#A1A1AA]/60">Calls, Emails, &amp; SMS</p>
                  </div>
                  <div className="p-2 bg-[#2A2A2E] rounded-lg text-[#A1A1AA] group-hover:text-white group-hover:bg-[#2A2A2E]/80 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white font-mono">87</span>
                  <span className="text-xs font-medium text-green-500 flex items-center">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span>
                    12%
                  </span>
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="rounded-xl border border-[#333333] bg-[#1F1F22] p-6 flex flex-col justify-between hover:border-[#D4AF37]/30 transition-colors group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[#A1A1AA] text-sm font-medium mb-1">Campus Visits</p>
                    <p className="text-xs text-[#A1A1AA]/60">Official &amp; Unofficial</p>
                  </div>
                  <div className="p-2 bg-[#2A2A2E] rounded-lg text-[#A1A1AA] group-hover:text-white group-hover:bg-[#2A2A2E]/80 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">location_on</span>
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white font-mono">8</span>
                  <span className="text-xs font-medium text-[#A1A1AA] flex items-center">
                    vs. 6 last week
                  </span>
                </div>
              </div>

              {/* Stat Card 3 */}
              <div className="rounded-xl border border-[#333333] bg-[#1F1F22] p-6 flex flex-col justify-between hover:border-[#D4AF37]/30 transition-colors group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[#A1A1AA] text-sm font-medium mb-1">Avg Time to Commit</p>
                    <p className="text-xs text-[#A1A1AA]/60">From Identified Date</p>
                  </div>
                  <div className="p-2 bg-[#2A2A2E] rounded-lg text-[#A1A1AA] group-hover:text-white group-hover:bg-[#2A2A2E]/80 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">schedule</span>
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-[#D4AF37] font-mono">47d</span>
                  <span className="text-xs font-medium text-green-500 flex items-center">
                    <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                    3 days
                  </span>
                </div>
              </div>
            </div>

            {/* Detail Grid: Leaderboard & Chart */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Staff Activity Table */}
              <div className="rounded-xl border border-[#333333] bg-[#1F1F22] overflow-hidden flex flex-col h-full">
                <div className="p-5 border-b border-[#333333] flex justify-between items-center">
                  <h3 className="font-semibold text-white">Staff Activity Leaderboard</h3>
                  <button className="text-[#A1A1AA] hover:text-white">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#2A2A2E]/50 text-[#A1A1AA]">
                      <tr>
                        <th className="px-5 py-3 font-medium">Recruiter</th>
                        <th className="px-5 py-3 font-medium text-center">Calls</th>
                        <th className="px-5 py-3 font-medium text-center">Emails</th>
                        <th className="px-5 py-3 font-medium text-center">Visits</th>
                        <th className="px-5 py-3 font-medium text-right text-[#D4AF37]">Commits</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#333333]">
                      {mockStaff.map((staff) => (
                        <tr key={staff.id} className="hover:bg-[#2A2A2E]/30 transition-colors group cursor-pointer">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div
                                  className="size-9 rounded-full bg-cover bg-center"
                                  style={{ backgroundImage: `url('${staff.imageUrl}')` }}
                                ></div>
                                {staff.rank && (
                                  <div className={`absolute -top-1 -right-1 ${getRankBadgeColor(staff.rank)} text-[#050505] rounded-full size-4 flex items-center justify-center text-[10px] font-bold border border-[#1F1F22]`}>
                                    {staff.rank}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-white">{staff.name}</p>
                                <p className="text-xs text-[#A1A1AA]">{staff.region}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center font-mono text-[#A1A1AA] group-hover:text-white">{staff.calls}</td>
                          <td className="px-5 py-4 text-center font-mono text-[#A1A1AA] group-hover:text-white">{staff.emails}</td>
                          <td className="px-5 py-4 text-center font-mono text-[#A1A1AA] group-hover:text-white">{staff.visits}</td>
                          <td className="px-5 py-4 text-right font-bold text-[#D4AF37] font-mono">{staff.commits}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-3 border-t border-[#333333] flex justify-center">
                  <button className="text-xs font-medium text-[#A1A1AA] hover:text-white">View All Staff</button>
                </div>
              </div>

              {/* Zone Coverage Bar Chart */}
              <div className="rounded-xl border border-[#333333] bg-[#1F1F22] p-6 flex flex-col h-full min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-semibold text-white">Zone Coverage</h3>
                    <p className="text-xs text-[#A1A1AA]">Active prospects distribution</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="size-3 rounded-sm bg-[#D4AF37] block"></span>
                    <span className="text-xs text-[#A1A1AA]">Prospects</span>
                  </div>
                </div>
                <div className="flex-1 flex items-end justify-between gap-4 px-2 pb-2">
                  {zoneCoverage.map((zone) => (
                    <div key={zone.zone} className="flex flex-col items-center gap-2 group w-full">
                      <div className="relative w-full bg-[#2A2A2E]/30 rounded-t-sm h-[200px] flex items-end justify-center">
                        <div
                          className="w-full mx-2 bg-[#D4AF37]/60 group-hover:bg-[#D4AF37] transition-all rounded-t-sm relative"
                          style={{ height: zone.height }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#2A2A2E] text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {zone.prospects}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-[#A1A1AA]">{zone.zone}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
