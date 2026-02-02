import Link from 'next/link';

interface FeaturedAthlete {
  id: string;
  name: string;
  position: string;
  school: string;
  classYear: string;
  height: string;
  weight: string;
  stat1: { label: string; value: string };
  stat2: { label: string; value: string };
  rating: string;
  imageUrl: string;
}

interface Program {
  id: string;
  rank: number;
  name: string;
  location: string;
  score: string;
}

interface Event {
  id: string;
  date: string;
  title: string;
  location: string;
  isUpcoming?: boolean;
}

const mockAthletes: FeaturedAthlete[] = [
  {
    id: '1',
    name: 'Jalen Green',
    position: 'QB',
    school: 'Desert Ridge',
    classYear: "'25",
    height: '6\'2"',
    weight: '205lbs',
    stat1: { label: '40yd', value: '4.5s' },
    stat2: { label: 'Rating', value: '92.4' },
    rating: '92.4',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIvqgVkdUU4nQI1Qb-uq22o8rpq0nja3rrXOEXhqWhDSzt79nHDeUYS9ZXa0pYZ42ziPSUK3QGiG1TKizAN-UrvCFjELE-gcwl6Bg3v4Ux0KKhrMW3vicpsXzlkraEELYMyMujuO5Cq8Rd7oHRyihzujqGxHWpYjef9JF3_4_W-NJc2dCizHge-DNh3b8AnLhHQ6gq8bovzzYcRUPGDu9wjGm_Mub0O5GI9bkok1WIyL7IOsjRYWTR7AQ67_3ZBuKpPQMyFGi9w8g',
  },
  {
    id: '2',
    name: 'Marcus Thorton',
    position: 'WR',
    school: 'Valley Christian',
    classYear: "'25",
    height: '5\'11"',
    weight: '185lbs',
    stat1: { label: '40yd', value: '4.38s' },
    stat2: { label: 'Rating', value: '94.1' },
    rating: '94.1',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZhzxfehyO0HU279tCSY7TrdLlw3hl2qlzk0abEQ9HQmA2N-8iUzAgwCnkEPgpf0KnaONvwXucwmBlqB4BpWR_VlwBOXncHIA6d4dLwE3pl0J7uRuvbGh2ZpPOs8jZZ8h_hJakwoW-HfqPY8_ousG2OPwnXK2nRzDzpFWBnvPgFHXeIkRwdZW--CRDfH6uvbLpJ_eu5AsoWVs3TQCO9zbqLQAKGANpT3nZyR1ttUvOEkvhJxMwu4n2asNlrvO8XjELtTWLjrkxoo0',
  },
  {
    id: '3',
    name: 'David Chen',
    position: 'LB',
    school: 'Chandler High',
    classYear: "'26",
    height: '6\'1"',
    weight: '220lbs',
    stat1: { label: 'Bench', value: '315lbs' },
    stat2: { label: 'Rating', value: '89.8' },
    rating: '89.8',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyow-8JJY03JjK1QFWh_ZdoHduFLoQ1zBgNvATDDREDuAnOyHvtej1XuK6t_lp1tjEDkvQnrcTVXOz_76NoSRNodTLRdpWJa2t61hJqF9pJ8d8-zpFOdezTnVXad7bj5hQpa5jdAl_FgPg8Rksg_x-8fDsX5uxDPiooojthcYgokhjtXdDIA-fepD7p8QUyMneAx4qcFNcuPT-Ur9w_Z8g0hIK0t7qhUzorcZhGwe8nu5AB_jgKCzFmaeunWFuiNP_LMrjM0m8Omc',
  },
  {
    id: '4',
    name: 'Trey Williams',
    position: 'RB',
    school: 'Saguaro',
    classYear: "'24",
    height: '5\'10"',
    weight: '195lbs',
    stat1: { label: '40yd', value: '4.42s' },
    stat2: { label: 'Rating', value: '91.2' },
    rating: '91.2',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDY4HCaoMWyhCggQEg7sSJt4vPQdQPnt_q7IrP4Yfjsfk2So51TmNV0nnBEs4lqppIk9PzyLrfTnlMEy1ZNvov6B4YqAbpE3DzZMeSAmnormJq5be2EGo1ZvkOq1_Y3MXhLfqt0Lzb7xEHBPPPY9t8uXKztV_f1A4xHgJKcWTdbpirFZDtjP2bYcxu1GaWGcU189kp750OrjNx5xIVayjWPNwPK_k97LK60A14IexzH5pqqVkeyrSuH6sdMZ8q8iYWChxl4MSIvNC0',
  },
];

const mockPrograms: Program[] = [
  { id: '1', rank: 1, name: 'Saguaro High School', location: 'Scottsdale, AZ', score: '98.5' },
  { id: '2', rank: 2, name: 'Chandler High', location: 'Chandler, AZ', score: '96.2' },
  { id: '3', rank: 3, name: 'Bishop Gorman', location: 'Las Vegas, NV', score: '95.9' },
];

const mockEvents: Event[] = [
  { id: '1', date: 'OCT 14, 2023', title: 'Phoenix Regional Combine', location: 'Phoenix, AZ', isUpcoming: true },
  { id: '2', date: 'NOV 02, 2023', title: 'Vegas Speed Showcase', location: 'Las Vegas, NV' },
  { id: '3', date: 'DEC 10, 2023', title: 'Winter All-Stars Camp', location: 'Tempe, AZ' },
];

export default function ZoneLandingPage() {
  return (
    <div className="bg-[#050505] text-white overflow-x-hidden min-h-screen">
      <div className="relative flex flex-col w-full">
        {/* Navigation */}
        <header className="sticky top-0 z-50 w-full border-b border-[#2a2a2a] bg-[#050505]/90 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-2 text-white">
                <div className="size-6 text-orange-500">
                  <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                    <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-bold tracking-tight">RepMax</h2>
              </div>
              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-8">
                <Link href="#" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">For Athletes</Link>
                <Link href="#" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">For Coaches</Link>
                <Link href="#" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Login</Link>
                <div className="h-8 w-px bg-[#2a2a2a]"></div>
                <div className="flex items-center gap-4">
                  {/* Search */}
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-[20px]">search</span>
                    <input
                      className="h-9 w-40 rounded-lg bg-[#1a1a1a] border-none py-1 pl-9 pr-2 text-sm text-white placeholder-gray-500 focus:ring-1 focus:ring-orange-500 transition-all"
                      placeholder="Search"
                      type="text"
                    />
                  </div>
                  <button className="h-9 rounded-lg bg-orange-500 px-5 text-sm font-bold text-white transition hover:bg-orange-600">
                    Join
                  </button>
                </div>
              </div>
              {/* Mobile Menu Button */}
              <button className="md:hidden text-white">
                <span className="material-symbols-outlined">menu</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-grow">
          {/* Hero Section */}
          <section className="relative pt-20 pb-12 overflow-hidden">
            {/* Abstract Background with gradient */}
            <div className="absolute inset-0 z-0 opacity-40">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/20 via-[#050505]/50 to-[#050505]"></div>
            </div>
            <div className="layout-container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
              <span className="mb-4 inline-flex items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
                <span className="material-symbols-outlined text-[14px]">public</span> Public Zone
              </span>
              <h1 className="font-display text-5xl font-black uppercase tracking-tight text-white sm:text-7xl md:text-8xl lg:text-[7rem] leading-[0.9]">
                Southwest <br className="hidden sm:block" /> <span className="text-orange-500">Zone</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-gray-400 font-light">
                The proving ground for the nation&apos;s top talent. Track performance, analyze regional rankings, and get discovered by top collegiate programs.
              </p>
              {/* Stats Row */}
              <div className="mt-12 w-full max-w-4xl">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="flex flex-col items-center justify-center rounded-xl bg-[#121212] border border-[#2a2a2a] p-6 hover:border-orange-500/50 transition-colors">
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Athletes</p>
                    <p className="font-mono text-4xl font-bold text-white mt-2">141</p>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-xl bg-[#121212] border border-[#2a2a2a] p-6 hover:border-orange-500/50 transition-colors">
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">College Commits</p>
                    <p className="font-mono text-4xl font-bold text-orange-500 mt-2">12</p>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-xl bg-[#121212] border border-[#2a2a2a] p-6 hover:border-orange-500/50 transition-colors">
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Upcoming Combines</p>
                    <p className="font-mono text-4xl font-bold text-white mt-2">05</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Athletes */}
          <section className="py-12 bg-[#050505]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white">Featured Athletes</h2>
                  <p className="text-sm text-gray-400 mt-1">Top performers trending this week</p>
                </div>
                <Link href="#" className="hidden sm:flex items-center gap-1 text-sm font-bold text-orange-500 hover:text-orange-400">
                  View All Rankings <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {mockAthletes.map((athlete) => (
                  <div
                    key={athlete.id}
                    className="group relative flex flex-col overflow-hidden rounded-xl bg-[#121212] border border-[#2a2a2a] transition-all hover:-translate-y-1 hover:border-orange-500/50"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden bg-gray-800 relative">
                      <div className="absolute top-2 right-2 z-10 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs font-mono text-white border border-white/10">CLASS {athlete.classYear}</div>
                      <div
                        className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url('${athlete.imageUrl}')` }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent opacity-80"></div>
                    </div>
                    <div className="relative -mt-12 p-4 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-white">{athlete.name}</h3>
                      <p className="text-sm text-orange-500 font-bold mb-3">{athlete.position} • {athlete.school}</p>
                      <div className="mt-auto grid grid-cols-2 gap-2 border-t border-[#333] pt-3">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Height</p>
                          <p className="font-mono text-sm text-gray-300">{athlete.height}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Weight</p>
                          <p className="font-mono text-sm text-gray-300">{athlete.weight}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">{athlete.stat1.label}</p>
                          <p className="font-mono text-sm text-gray-300">{athlete.stat1.value}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">{athlete.stat2.label}</p>
                          <p className="font-mono text-sm text-orange-500">{athlete.stat2.value}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex sm:hidden justify-center">
                <button className="w-full rounded-lg border border-[#333] bg-[#1a1a1a] px-4 py-3 text-sm font-bold text-white">
                  View All Athletes
                </button>
              </div>
            </div>
          </section>

          {/* Two Column Section: Top Programs & Events */}
          <section className="py-12 bg-[#050505]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                {/* Top Programs */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Top Programs</h2>
                    <span className="text-xs font-mono text-orange-500 bg-orange-500/10 px-2 py-1 rounded">BY REPMAX SCORE</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {mockPrograms.map((program) => (
                      <div key={program.id} className="flex items-center gap-4 rounded-lg bg-[#121212] p-4 border border-[#2a2a2a]">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#2a2a2a] text-lg font-bold text-white">{program.rank}</div>
                        <div className="flex-grow">
                          <h3 className="text-base font-bold text-white">{program.name}</h3>
                          <p className="text-sm text-gray-400">{program.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-xl font-bold text-orange-500">{program.score}</p>
                          <p className="text-[10px] text-gray-500 uppercase">Score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Events */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Upcoming Events</h2>
                    <Link href="#" className="text-xs font-bold text-orange-500 hover:text-orange-400">View Calendar</Link>
                  </div>
                  <div className="relative border-l border-[#2a2a2a] pl-6 space-y-8 ml-3">
                    {mockEvents.map((event) => (
                      <div key={event.id} className="relative">
                        <span className={`absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full ${event.isUpcoming ? 'bg-orange-500' : 'bg-[#333]'} ring-4 ring-[#050505]`}></span>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <span className={`text-xs font-mono ${event.isUpcoming ? 'text-orange-500' : 'text-gray-500'}`}>{event.date}</span>
                            <h3 className="text-lg font-bold text-white mt-1">{event.title}</h3>
                            <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
                              <span className="material-symbols-outlined text-[16px]">location_on</span>
                              {event.location}
                            </div>
                          </div>
                          <button className={`shrink-0 rounded px-4 py-2 text-xs font-bold ${event.isUpcoming ? 'bg-[#2a2a2a] text-white hover:bg-[#333]' : 'border border-[#333] text-gray-400 hover:text-white hover:border-white'}`}>
                            {event.isUpcoming ? 'Register Now' : 'Details'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Banner */}
          <section className="py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-2xl bg-[#121212] px-6 py-12 sm:px-12 lg:px-16 border border-[#2a2a2a] flex flex-col items-center text-center">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(249,116,21,0.05)_50%,transparent_75%,transparent_100%)]"></div>
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-orange-500/20 blur-[100px]"></div>
                <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-orange-500/10 blur-[100px]"></div>
                <div className="relative z-10 max-w-2xl">
                  <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to get noticed?</h2>
                  <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
                    Join <span className="text-orange-500 font-bold">141</span> athletes in the Southwest Zone already building their recruitment profile on RepMax.
                  </p>
                  <div className="mt-8 flex justify-center gap-4">
                    <button className="rounded-lg bg-orange-500 px-8 py-4 text-base font-bold text-white shadow-[0_0_20px_rgba(249,116,21,0.3)] transition hover:bg-orange-600 hover:shadow-[0_0_30px_rgba(249,116,21,0.5)]">
                      Create Free RepMax ID
                    </button>
                  </div>
                  <p className="mt-4 text-xs text-gray-500">No credit card required. Free for athletes.</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Simple Footer */}
        <footer className="border-t border-[#2a2a2a] bg-[#050505] py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2 text-white">
                <div className="size-5 text-gray-500">
                  <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                    <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-400">RepMax Inc. © 2023</span>
              </div>
              <div className="flex gap-6">
                <Link href="#" className="text-sm text-gray-500 hover:text-white">Privacy</Link>
                <Link href="#" className="text-sm text-gray-500 hover:text-white">Terms</Link>
                <Link href="#" className="text-sm text-gray-500 hover:text-white">Support</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
