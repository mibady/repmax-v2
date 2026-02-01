'use client';

interface UpcomingVisit {
  id: string;
  athleteName: string;
  position: string;
  stars: number;
  avatar: string;
  visitType: 'official' | 'unofficial';
  status: 'confirmed' | 'pending';
  date: string;
  time: string;
  details: string;
}

interface CalendarEvent {
  day: number;
  events: {
    title: string;
    type: 'official' | 'unofficial' | 'event';
    time?: string;
  }[];
}

const stats = [
  { label: 'Total Visits (Oct)', value: '24', icon: 'calendar_today', trend: '+12%', isUp: true },
  { label: 'Official Visits', value: '8', icon: 'verified', trend: '+5%', isUp: true },
  { label: 'Pending', value: '4', icon: 'pending', trend: '-2%', isUp: false },
  { label: 'Win Rate', value: '68%', icon: 'pie_chart', trend: '+1.5%', isUp: true },
];

const upcomingVisits: UpcomingVisit[] = [
  {
    id: '1',
    athleteName: 'Marcus Johnson',
    position: 'Quarterback',
    stars: 5,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfG3DXMI4683sG5hH2W3iOwj1M_ssEpWxHECTwD38L7VBMpLhXc0kEa0wlELdugYwhjXYyOMJicRGDDU8a3d-RqonWg6bgGTf_ve9VN0V3lY4ca_jZ4rOaZb_Uq4tSBuQwDmOa_7S9pVF1oUE7etYXoEp38rTaEBI-WivC51JYE7HoWNKQATtRtXHFrzsmciix2TWcKHTE90D2i6rfCxAfQg7PfqGlJEVSuCkeEjYNW6EsXEja47_hLC5pU6YZsjaUvh0gPkN5CWs',
    visitType: 'official',
    status: 'confirmed',
    date: 'Oct 5',
    time: '2:00 PM',
    details: 'Delta 402 (ATL → LAX)',
  },
  {
    id: '2',
    athleteName: 'Tyrell Davis',
    position: 'Wide Receiver',
    stars: 4,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrsdzwKDzLmjupv4pbnp7K0kbzDmmpSw-wvMur7vtfIrvHIR4tWW83kLua-CAPOHpcR2SJ4YU7Jz1zHPk21cmN4P4TUwJgnahj0CmYI9Zz-Uw_0WMEOX2jhYazesHVD6nGETs05ikA7uzpeutIxAyfpODV6P7DezM4Te0l92j4AMzHob1_cEa29z4kMJjkfzX29AVK9XGA9j2eFlbjA7xiIx2g8kQE4YIYN7RF1aFi2Vh9h8VELKhHjcT9f0zHStwn23CiN5U9SsA',
    visitType: 'unofficial',
    status: 'pending',
    date: 'Oct 7',
    time: '10:00 AM',
    details: 'Practice Facility',
  },
  {
    id: '3',
    athleteName: 'Jordan Smith',
    position: 'Linebacker',
    stars: 4,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDO-1O19zR--WVTcysSNrFh-y7R6T-dr6a7AJTbEsBOJr1nxqzA5e3egr_o4Shiw37XMm6ETKDqiTBVh_85JYLK5tq8nKZPk1ZmUNbrAUdD4n8BUykNL2dORf_c7F0F8H9gZTLXzsbtBVE0VdUqPAhZd7oWe8WXt6YtdSTWXuoz0O0mVv4A51QIUiefPDZtVUeV9zj5-z3rgyAeH_EZ4CUl6aZgIGwOabUL19Zn6AityPsPxUnH3y6UPBYsRKQgxp5EpNDYWLFNJOM',
    visitType: 'official',
    status: 'confirmed',
    date: 'Oct 11',
    time: '11:00 AM',
    details: '',
  },
];

const calendarEvents: CalendarEvent[] = [
  { day: 3, events: [{ title: '10a T. Davis', type: 'unofficial', time: '10:00 AM' }] },
  { day: 5, events: [{ title: '2p M. Johnson', type: 'official' }, { title: '5p Staff Mtg', type: 'event' }] },
  { day: 7, events: [{ title: '9a K. Williams', type: 'unofficial' }] },
  { day: 11, events: [{ title: '11a J. Smith', type: 'official' }] },
  { day: 14, events: [{ title: 'All Day Junior Day', type: 'event' }] },
  { day: 21, events: [{ title: 'Official Visit', type: 'official' }] },
  { day: 31, events: [{ title: 'Halloween Event', type: 'unofficial' }] },
];

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', active: false },
  { icon: 'group', label: 'Prospects', active: false },
  { icon: 'calendar_month', label: 'Visits', active: true },
  { icon: 'trophy', label: 'Offers', active: false },
  { icon: 'settings', label: 'Settings', active: false },
];

export default function CampusVisitsPage() {
  // Generate calendar days
  const prevMonthDays = [29, 30];
  const currentMonthDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const nextMonthDays = [1, 2, 3, 4];
  const todayDay = 5;

  const getEventsForDay = (day: number) => {
    return calendarEvents.find((e) => e.day === day)?.events || [];
  };

  return (
    <div className="bg-slate-100 dark:bg-[#121214] font-sans text-white overflow-hidden flex h-screen w-full antialiased selection:bg-primary selection:text-[#121214]">
      {/* Sidebar */}
      <aside className="flex h-full w-[260px] flex-col border-r border-[#2d2d30] bg-[#18181b] hidden lg:flex flex-shrink-0">
        <div className="flex flex-col h-full p-4">
          {/* Brand */}
          <div className="flex gap-3 items-center mb-8 px-2">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-primary/20"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBhAWPOh6jtG1LCK_2SEMOx2WsVHjD8ddJFxFHtVXMlRMO4HBfRSc-G1xrhJLxjiHz2XHOzA3xpoMunEYFTUoOHruYfr_us2Y7R2ml4H7BhuhgvzzQv58vBhJheC9AzD7YG9kJQY8PSkutks3HZOui1rXEV-Cb6j2lBtBYSN4-fXJn7TbcE5emQs51mRtYEV42XCimvqIWy3wJ6hmx9c9fdPbOCQgTCQ1K_Fc7TsePtvrGxFuf28lhSJVP96aWH3IwoKXrpW3csIaQ")',
              }}
            />
            <div className="flex flex-col">
              <h1 className="text-white text-base font-bold leading-none tracking-tight">RepMax CRM</h1>
              <p className="text-primary text-xs font-medium mt-1">Recruiter Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 flex-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href="#"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  item.active
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-[#A1A1AA] hover:text-white hover:bg-white/5 group'
                }`}
              >
                <span
                  className={`material-symbols-outlined ${item.active ? '' : 'text-[#A1A1AA] group-hover:text-white'}`}
                  style={item.active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span className={`text-sm ${item.active ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
              </a>
            ))}
          </nav>

          {/* User Profile / Logout */}
          <div className="mt-auto pt-4 border-t border-[#2d2d30]">
            <div className="flex items-center gap-3 px-2 mb-4">
              <div className="size-9 rounded-full bg-gray-700 overflow-hidden">
                <img
                  alt="User Profile"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOH4wDDTXq1Z4_eF6kbNwLiIfbWUXA-gXvDO1yaInPJkghqsZNQKlt14hqb9WZAZwrnN2WTuX-lbg40Z_D4f1zMOZTz4JKYfAfq6puqJbwKuCnAw6eRkvBOkUtIbL5PB9PND3TqowfTiT1fDd20bktqLVdca2DHEykU_QbYQA17HgO3L6IP56NDwKtUzbL7fS0eB066F181_8_xcYCG_inBFGxVBtM5umKp2NFLIVM0vXdP3nERnOUOmM40ixStxSBq6aWBcZaeDw"
                />
              </div>
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-medium text-white truncate">Coach Carter</p>
                <p className="text-xs text-[#A1A1AA] truncate">Head Recruiter</p>
              </div>
            </div>
            <button className="flex w-full cursor-pointer items-center justify-center rounded-lg h-9 px-4 bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white text-sm font-medium transition-colors border border-white/5">
              <span className="material-symbols-outlined text-[18px] mr-2">logout</span>
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#121214] relative">
        {/* Top Bar */}
        <header className="h-16 border-b border-[#2d2d30] flex items-center justify-between px-6 bg-[#121214]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-[#A1A1AA] hover:text-white">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-white leading-tight">Campus Visits</h2>
              <p className="text-xs text-[#A1A1AA] hidden sm:block">
                Manage your recruiting calendar and upcoming prospect visits.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center bg-[#1F1F22] rounded-lg px-3 py-1.5 border border-white/5">
              <span className="material-symbols-outlined text-[#A1A1AA] text-[20px] mr-2">search</span>
              <input
                className="bg-transparent border-none text-sm text-white focus:ring-0 placeholder-[#A1A1AA] w-48"
                placeholder="Search visits..."
                type="text"
              />
            </div>
            <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary hover:bg-[#bfa030] text-[#121214] text-sm font-bold transition-colors shadow-[0_0_15px_rgba(212,175,53,0.3)]">
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span className="hidden sm:inline">Schedule Visit</span>
            </button>
          </div>
        </header>

        {/* Scrollable Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[#1F1F22] rounded-xl p-5 border border-white/5 hover:border-primary/30 transition-colors group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[#A1A1AA] text-sm font-medium">{stat.label}</p>
                    <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-lg text-[20px]">
                      {stat.icon}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                    <span
                      className={`text-xs font-medium flex items-center ${stat.isUp ? 'text-green-500' : 'text-red-500'}`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {stat.isUp ? 'trending_up' : 'trending_down'}
                      </span>
                      {stat.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Dashboard Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-auto">
              {/* Calendar Section */}
              <div className="xl:col-span-8 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">October 2023</h3>
                  <div className="flex gap-2">
                    <div className="flex items-center bg-[#1F1F22] rounded-lg p-1 border border-white/5">
                      <button className="p-1 hover:text-white text-[#A1A1AA] rounded-md hover:bg-white/5">
                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                      </button>
                      <button className="p-1 hover:text-white text-[#A1A1AA] rounded-md hover:bg-white/5">
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                      </button>
                    </div>
                    <div className="flex bg-[#1F1F22] rounded-lg p-1 border border-white/5 text-xs font-medium">
                      <button className="px-3 py-1 rounded-md bg-white/10 text-white">Month</button>
                      <button className="px-3 py-1 rounded-md text-[#A1A1AA] hover:text-white hover:bg-white/5">
                        Week
                      </button>
                      <button className="px-3 py-1 rounded-md text-[#A1A1AA] hover:text-white hover:bg-white/5">
                        Day
                      </button>
                    </div>
                  </div>
                </div>

                {/* Calendar Card */}
                <div className="bg-[#1F1F22] rounded-xl border border-white/5 overflow-hidden shadow-sm">
                  {/* Days Header */}
                  <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.02]">
                    {daysOfWeek.map((day) => (
                      <div
                        key={day}
                        className="py-3 text-center text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 auto-rows-[minmax(100px,auto)] bg-[#1F1F22]">
                    {/* Previous Month Days */}
                    {prevMonthDays.map((day) => (
                      <div
                        key={`prev-${day}`}
                        className="border-b border-r border-white/5 p-2 text-[#A1A1AA]/30 bg-white/[0.01]"
                      >
                        {day}
                      </div>
                    ))}

                    {/* Current Month Days */}
                    {currentMonthDays.map((day) => {
                      const events = getEventsForDay(day);
                      const isToday = day === todayDay;

                      return (
                        <div
                          key={day}
                          className="border-b border-r border-white/5 p-2 relative group hover:bg-white/[0.02] transition-colors"
                        >
                          {isToday ? (
                            <div className="size-7 flex items-center justify-center rounded-full bg-primary text-[#121214] font-bold text-sm mb-1 shadow-lg shadow-primary/20">
                              {day}
                            </div>
                          ) : (
                            <span className="text-sm text-[#A1A1AA] font-medium block mb-1">{day}</span>
                          )}

                          {events.map((event, idx) => {
                            const bgColor =
                              event.type === 'official'
                                ? 'bg-primary/20 border-primary text-primary'
                                : event.type === 'unofficial'
                                  ? 'bg-blue-500/20 border-blue-500 text-blue-200'
                                  : 'bg-purple-500/20 border-purple-500 text-purple-200';

                            return (
                              <div
                                key={idx}
                                className={`${bgColor} border-l-2 rounded-r px-2 py-1 text-xs mb-1 cursor-pointer hover:brightness-110`}
                              >
                                <p className="font-semibold truncate">{event.title}</p>
                                {event.type !== 'event' && (
                                  <p className="text-[10px] truncate opacity-70">
                                    {event.type === 'official' ? 'Official Visit' : 'Unofficial'}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}

                    {/* Next Month Days */}
                    {nextMonthDays.map((day) => (
                      <div
                        key={`next-${day}`}
                        className="border-b border-r border-white/5 p-2 text-[#A1A1AA]/30 bg-white/[0.01]"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Color Key Legend */}
                <div className="flex gap-4 px-2">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-primary"></div>
                    <span className="text-xs text-[#A1A1AA]">Official Visit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-[#A1A1AA]">Unofficial Visit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-purple-500"></div>
                    <span className="text-xs text-[#A1A1AA]">Junior Day</span>
                  </div>
                </div>
              </div>

              {/* Upcoming Visits Section */}
              <div className="xl:col-span-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Upcoming Visits</h3>
                  <button className="text-xs text-primary font-medium hover:underline">View All</button>
                </div>
                <div className="flex flex-col gap-3">
                  {upcomingVisits.map((visit) => (
                    <div
                      key={visit.id}
                      className={`flex flex-col p-4 rounded-xl bg-[#1F1F22] border-l-4 ${
                        visit.visitType === 'official' ? 'border-primary' : 'border-blue-500'
                      } shadow-sm hover:shadow-md transition-all group`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="size-10 rounded-full bg-gray-600 bg-cover bg-center"
                            style={{ backgroundImage: `url('${visit.avatar}')` }}
                          />
                          <div>
                            <h4 className="text-sm font-bold text-white">{visit.athleteName}</h4>
                            <p className="text-xs text-[#A1A1AA]">
                              {visit.position} • {visit.stars}★
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            visit.status === 'confirmed'
                              ? 'bg-green-400/10 text-green-400 ring-green-400/20'
                              : 'bg-yellow-400/10 text-yellow-500 ring-yellow-400/20'
                          }`}
                        >
                          {visit.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-[#A1A1AA] gap-2">
                          <span
                            className={`material-symbols-outlined text-[16px] ${
                              visit.visitType === 'official' ? 'text-primary' : 'text-blue-500'
                            }`}
                          >
                            {visit.visitType === 'official' ? 'verified' : 'directions_walk'}
                          </span>
                          <span className="text-white">
                            {visit.visitType === 'official' ? 'Official Visit' : 'Unofficial Visit'}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-[#A1A1AA] gap-2">
                          <span className="material-symbols-outlined text-[16px]">schedule</span>
                          <span>
                            {visit.date} • {visit.time}
                          </span>
                        </div>
                        {visit.details && (
                          <div className="flex items-center text-xs text-[#A1A1AA] gap-2">
                            <span className="material-symbols-outlined text-[16px]">
                              {visit.visitType === 'official' ? 'flight' : 'location_on'}
                            </span>
                            <span>{visit.details}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                        {visit.status === 'pending' ? (
                          <>
                            <button className="flex-1 rounded bg-primary/10 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition">
                              Confirm Visit
                            </button>
                            <button className="rounded bg-white/5 px-3 py-1.5 text-[#A1A1AA] hover:text-white hover:bg-white/10 transition">
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="flex-1 rounded bg-white/5 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition">
                              View Profile
                            </button>
                            <button className="rounded bg-white/5 px-3 py-1.5 text-[#A1A1AA] hover:text-white hover:bg-white/10 transition">
                              <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #1f1f22;
        }
        ::-webkit-scrollbar-thumb {
          background: #433d28;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #d4af35;
        }
      `}</style>
    </div>
  );
}
