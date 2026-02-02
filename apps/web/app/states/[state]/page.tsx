import Link from 'next/link';
import Image from 'next/image';

interface Program {
  id: string;
  name: string;
  location: string;
  logoUrl: string;
  commitments: number;
  rank?: string;
  badge?: string;
}

interface Athlete {
  id: string;
  name: string;
  position: string;
  classYear: string;
  height: string;
  weight: string;
  rating: number;
  stat1: { label: string; value: string };
  stat2: { label: string; value: string };
  imageUrl: string;
  isVerified?: boolean;
}

interface EventItem {
  id: string;
  month: string;
  day: string;
  title: string;
  location: string;
}

const mockPrograms: Program[] = [
  {
    id: '1',
    name: 'Longhorn State Univ.',
    location: 'Austin, TX',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlvam8HM6bv4z_j82g_Idhu8A7iKSdtCMt8CpWIfwC59cMkGPrMzFcFIxOH-O02encZ5rGbq4xh0tXIjV2hr3q7ggFfN1HNlb11lqpLZWYkTvUi8hzmxnNXSb8P3nxiOjdMobZxc6DOUeA7SGoL3plS0UTqTuEZgBnQJs_RYxTxRiAF_ZQKKrL_V-fbcMO77ZHdk7h8omrWCoU6j0oqcF0pYbyCZIagex2szGqy0RApazG4fYS968PV-Dl19h4xWZYx59LlZjWWhI',
    commitments: 24,
    rank: '#1 Ranked',
  },
  {
    id: '2',
    name: 'Aggieland Tech',
    location: 'College Station, TX',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBI3tIRqX_GtUSgzqUa5GXL3v-b1AQf21JG7DJTjqJZU-RsWstubdEE8DRW2_Q4lQbGQyVKOl-OhZTUFPfickEfxXojjWkirsxKSZZgFrhd0-QeY-VNvXL-riiiZUzt4VgLBOsJpYe4iCJo1lZZyMVVly7xmeXvzZ1k_hprwq8e_rdMYiQVsYGrmjbgQLG19IbSyllyYo_CDhyb-_dF2hrHHUAinr0LuINTdZz82dO11OwSWsAep-_0AW0JRto_s1ZnJBPwG37FviI',
    commitments: 18,
    badge: 'Top 5',
  },
  {
    id: '3',
    name: 'Fort Worth Christian',
    location: 'Fort Worth, TX',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDr9YB9nRMPnj4KnzKX-lAxT7T_9c_77n5x1uEtl_5x95nEmpKVMeZEV3DdqanUCSB_GfxJwfqzXL2-2KLpYywIJqU9JTU5eULqOXGizCK0GlDSxcTcOd1UgZl81FCjAeqGRmOH9pQlxX9wWWMq3wpzM547TlAFnc-EtwLLUEN7JviIhH0Q7E_CBsPfVFSB3_skf5gH1YskujeXN8tNe9IBMmvbfh_fEmQPxRVtztwDS06zACdGcTp4FUPssFTkEze-34Y7zcjbrQc',
    commitments: 12,
    badge: 'Elite',
  },
  {
    id: '4',
    name: 'Waco Varsity',
    location: 'Waco, TX',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZeSX6mdhofx54R0LYPojUwFUxsTfgQSgpSomS-Hbtg493m-vFwZk2RLqaNUjuvHn3IPHlLzS4VCERL1_D9RLATo3xw_XQ6LPQc8l8frHWxHWf904WUXn0w5p2Cfz-fspP1z8RBJfXq1Cke67MqtHsbHY9YnL0UmaMx05y7JdPQfnsQlqw_wRUwUkF35IoxxKqVHQ9j78Tc9Kk8eOXDYMaCQK3nUoT8UpGK6cBHZqCukcK6Syy_kASSGKCacqwjPp_RUOCeo8TQEA',
    commitments: 9,
    badge: 'Rising',
  },
];

const mockAthletes: Athlete[] = [
  {
    id: '1',
    name: 'Marcus Johnson',
    position: 'QB',
    classYear: "'25",
    height: '6\'2"',
    weight: '210 lbs',
    rating: 5.0,
    stat1: { label: '40 Yard', value: '4.52s' },
    stat2: { label: 'GPA', value: '3.8' },
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqzzQKoKf4SchUEIuptr6lmg1W3EHcTX4R8pK9WKVTfza_pTpbiUe6Rf1y7KQpSwPZXIjlXjivIQtPIQBftN-IH4xKNqqHxK9_sCzp9yRMGIat9ynrLitULxaXCBF2Mf_jAMPS-L66CVU5bzWPjwKHG9bik_vIuuzqfK_JHhjBUyZVjUHAg_JxbXFkb8HI7MzjgUL8z2W2F3hbnw9nTsFpeLkvchEeDJ8EvTzWB5EzNn20TLiM5OFQKyoGeOuCMJGJcUEJst-IBGs',
    isVerified: true,
  },
  {
    id: '2',
    name: 'David Miller',
    position: 'WR',
    classYear: "'24",
    height: '5\'11"',
    weight: '185 lbs',
    rating: 4.8,
    stat1: { label: '40 Yard', value: '4.38s' },
    stat2: { label: 'Vertical', value: '36"' },
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRXBAkWgNf9N1jKdjFY9vh0yN7PDYnUvGKm_4ZTLq6n1F3FcmGoB9puFSypaTK3j62VYnK0uPdOuPGKYqEj1nA0i-6_vHkNCe_ddFEzpRRBpMp8bVhzOG1B880hntPL71QEYZk1St58cosYC52FBL3NXVwnDYLaGFXCOvgm0DeXnxnMyuVyUMUxkpSh45UQ2boNbvQm07y-8-bF6LOjQfwQzneUk9TaiDsGr3hI-w7uyATAb9jcrC3Qe3g5aconunbkR9cfXw36r4',
    isVerified: true,
  },
  {
    id: '3',
    name: 'Tyrell Banks',
    position: 'LB',
    classYear: "'25",
    height: '6\'1"',
    weight: '225 lbs',
    rating: 4.5,
    stat1: { label: 'Tackles', value: '85' },
    stat2: { label: 'Sacks', value: '12' },
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB99LsKVupwEqcDHKMXkCT3dcAm7yTNrComrnz_q2NN4aTQbGgX1o1x8QjhwQ1R8zNgW1dHKGu8XU1PlN4EEGgwfi0s_3ao3YQmL7jaU8eN9KPVoYrNB4V7rd-pb1nUXQQ9DfUnRzVXM54NkZi0KjpI6XOeAMSu19e2Mpx3BK4f8pvA39cHIb4Reqx2Mh2PxZdLS-GGRxbdyg6vRWVswa-JUGrlv-3RxijUUZM8K8lj0wlaM9VBAVfqW9PN344vHJIVqCQhmRtbtpk',
    isVerified: false,
  },
  {
    id: '4',
    name: 'Chris Owens',
    position: 'RB',
    classYear: "'24",
    height: '5\'10"',
    weight: '200 lbs',
    rating: 4.9,
    stat1: { label: 'Yards', value: '1,250' },
    stat2: { label: 'TDs', value: '18' },
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHzI9Wpe1QiOOpEVKz-ygXeQcnNOaE-Mijbt1KFeqJAbVJjAfcTYPMaji86w8D8jryv3E4r0rSp6ZG_kenXSVlhQh_nMy6pq0J66vhud7LGwRuhkmtUqBra9NiAVrcrSg08xgGG7XSpHfEkUxunDnumnh3_jjV7Ca35F6QqWrk592Gr-aNmfy0m7g34VhgTGbtA11k38maG8RTlOiZsqDdkPgLy127UaG1KcC3CVSPVKoqudhFiFGUr1nvloB814wcKefKOPneMpQ',
    isVerified: true,
  },
];

const mockEvents: EventItem[] = [
  {
    id: '1',
    month: 'OCT',
    day: '24',
    title: 'Dallas Regional Showcase',
    location: 'AT&T Stadium, Arlington, TX',
  },
  {
    id: '2',
    month: 'NOV',
    day: '02',
    title: 'Houston Speed Combine',
    location: 'Rice Stadium, Houston, TX',
  },
  {
    id: '3',
    month: 'NOV',
    day: '15',
    title: 'Austin Elite Quarterback Camp',
    location: 'Westlake HS, Austin, TX',
  },
];

export default function StateLandingPage({ params }: { params: { state: string } }) {
  const stateName = params.state === 'tx' || params.state === 'texas' ? 'Texas' : params.state.charAt(0).toUpperCase() + params.state.slice(1);

  return (
    <div className="bg-[#050505] text-white font-[family-name:var(--font-inter)] relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* Navigation */}
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-white/10 bg-[#050505]/90 backdrop-blur-md px-4 py-3 lg:px-10">
        <div className="flex items-center gap-4 lg:gap-8">
          <Link href="/" className="flex items-center gap-4 text-white">
            <div className="size-8 flex items-center justify-center text-[#d4af35]">
              <span className="material-symbols-outlined text-3xl">sports_football</span>
            </div>
            <h2 className="text-white text-xl font-black leading-tight tracking-tight uppercase">RepMax</h2>
          </Link>
          <div className="hidden lg:flex items-center gap-9">
            <Link href="#" className="text-gray-300 hover:text-[#d4af35] transition-colors text-sm font-medium leading-normal">Programs</Link>
            <Link href="#" className="text-gray-300 hover:text-[#d4af35] transition-colors text-sm font-medium leading-normal">Athletes</Link>
            <Link href="#" className="text-gray-300 hover:text-[#d4af35] transition-colors text-sm font-medium leading-normal">Events</Link>
            <Link href="#" className="text-gray-300 hover:text-[#d4af35] transition-colors text-sm font-medium leading-normal">Rankings</Link>
          </div>
        </div>
        <div className="flex flex-1 justify-end gap-4 lg:gap-8">
          <label className="hidden md:flex flex-col min-w-40 !h-10 max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-full h-full bg-[#121212] border border-white/10 focus-within:border-[#d4af35]/50 transition-colors">
              <div className="text-[#c3b998] flex border-none items-center justify-center pl-4 rounded-l-full">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-full text-white focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-[#666] px-4 pl-2 text-sm font-normal leading-normal" placeholder="Search athletes..." />
            </div>
          </label>
          <div className="flex gap-2">
            <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-[#d4af35] hover:bg-yellow-500 transition-colors text-[#201d13] text-sm font-bold leading-normal tracking-wide">
              <span className="truncate">Sign Up</span>
            </button>
            <button className="hidden sm:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-bold leading-normal tracking-wide">
              <span className="truncate">Log In</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative flex min-h-[600px] flex-col justify-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBp4CUP5oVBrWAyATHHavSjzBNnW_cgAn55ecPm1l2qeXlBuEjkN_viDP5Ud1TJR1Cp00dVc1FbqoMbmTxR5op5-3q8bbiX5bSRi284SoUncUW1G_riKvEcvhifA0LKB4TYidBPHi89EZe28tw3oFN6Q3PfkGsIHbmrkAP8geepf_otZ6rPI5dVBXKa2oVfxRsT3RCAvUy8lLP-lAyH-ZximKjc_DfwR4hbDlGs3vi_JvsEWnq2xjlS10iTcDBcAlRryw97c5Zlvj8"
              alt="Texas high school football stadium under night lights"
              fill
              className="object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-transparent to-transparent"></div>
          </div>
          <div className="relative z-10 flex flex-col justify-center px-4 py-20 lg:px-40">
            <div className="max-w-[800px] flex flex-col gap-6">
              {/* Badge */}
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-fit items-center justify-center gap-x-2 rounded-full bg-orange-600/90 backdrop-blur-sm pl-3 pr-4 shadow-lg shadow-orange-900/20 border border-orange-500/30">
                  <span className="material-symbols-outlined text-white text-[18px]">location_on</span>
                  <p className="text-white text-xs font-bold uppercase tracking-wider">Southwest Zone</p>
                </div>
              </div>
              {/* Main Heading */}
              <div className="flex flex-col gap-2">
                <h1 className="text-white text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter uppercase drop-shadow-2xl">
                  {stateName}<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Football</span><br />
                  Recruiting
                </h1>
                <p className="text-gray-300 text-lg md:text-xl font-light leading-relaxed max-w-2xl mt-4">
                  The premier hub for Southwest talent. Join the network powering the next generation of champions.
                </p>
              </div>
              {/* Stats Row */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex flex-col border-l-4 border-[#d4af35] pl-4">
                  <span className="text-3xl font-bold text-white tracking-tighter">12,405</span>
                  <span className="text-sm text-gray-400 uppercase tracking-wide font-medium">Active Athletes</span>
                </div>
                <div className="flex flex-col border-l-4 border-gray-700 pl-4">
                  <span className="text-3xl font-bold text-white tracking-tighter">350</span>
                  <span className="text-sm text-gray-400 uppercase tracking-wide font-medium">Programs</span>
                </div>
              </div>
              {/* CTA */}
              <div className="mt-6 flex flex-wrap gap-4">
                <button className="flex h-12 items-center justify-center rounded-full bg-[#d4af35] px-8 text-base font-bold text-[#201d13] shadow-lg shadow-yellow-500/20 hover:scale-105 transition-transform">
                  Get Scouted
                </button>
                <button className="flex h-12 items-center justify-center rounded-full bg-white/10 border border-white/10 px-8 text-base font-bold text-white hover:bg-white/20 transition-colors">
                  Browse Talent
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Programs Grid */}
        <section className="px-4 py-16 lg:px-40 bg-[#050505]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-white text-2xl md:text-3xl font-bold tracking-tight">Top Rated Programs in {stateName}</h2>
            <Link href="#" className="text-[#d4af35] text-sm font-medium hover:underline flex items-center gap-1">
              View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockPrograms.map((program) => (
              <Link
                key={program.id}
                href={`/programs/${program.id}`}
                className="group flex flex-col gap-4 rounded-2xl bg-[#121212] p-6 border border-white/5 hover:border-[#d4af35]/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="size-16 rounded-full bg-white p-1 overflow-hidden">
                    <Image
                      src={program.logoUrl}
                      alt={`${program.name} logo`}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover rounded-full"
                    />
                  </div>
                  {program.rank && (
                    <div className="bg-[#d4af35]/20 text-[#d4af35] text-xs font-bold px-3 py-1 rounded-full uppercase">{program.rank}</div>
                  )}
                  {program.badge && !program.rank && (
                    <div className="bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">{program.badge}</div>
                  )}
                </div>
                <div>
                  <h3 className="text-white text-lg font-bold leading-tight group-hover:text-[#d4af35] transition-colors">{program.name}</h3>
                  <p className="text-gray-500 text-sm">{program.location}</p>
                </div>
                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-sm">
                  <span className="text-gray-400">Commitments</span>
                  <span className="text-white font-bold">{program.commitments}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Athletes Showcase */}
        <section className="px-4 py-16 lg:px-40 bg-[#0a0a0a] border-y border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-white text-2xl md:text-3xl font-bold tracking-tight">Trending {stateName} Athletes</h2>
              <p className="text-gray-400 mt-1">Class of 2024 &amp; 2025 Top Performers</p>
            </div>
            <div className="flex gap-2">
              <button className="size-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="size-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          {/* Horizontal Scroll Container */}
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
            {mockAthletes.map((athlete) => (
              <div key={athlete.id} className="min-w-[280px] w-[280px] snap-center flex flex-col bg-[#121212] rounded-2xl overflow-hidden border border-white/5 group">
                <div className="relative h-64 bg-gray-800">
                  <Image
                    src={athlete.imageUrl}
                    alt={`${athlete.name} headshot`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md rounded-full px-2 py-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[#d4af35] text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-white text-xs font-bold">{athlete.rating.toFixed(1)}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#121212] to-transparent h-20"></div>
                </div>
                <div className="p-5 flex flex-col gap-3 relative -mt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-bold text-lg flex items-center gap-1">
                        {athlete.name}
                        {athlete.isVerified && (
                          <span className="material-symbols-outlined text-blue-400 text-[16px]" title="Verified">verified</span>
                        )}
                      </h3>
                      <p className="text-gray-400 text-sm">{athlete.position} • Class of {athlete.classYear}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs font-medium">
                    <span className="bg-white/5 text-gray-300 px-3 py-1 rounded-full">{athlete.height}</span>
                    <span className="bg-white/5 text-gray-300 px-3 py-1 rounded-full">{athlete.weight}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-[#050505] p-2 rounded-lg text-center border border-white/5">
                      <p className="text-gray-500 text-[10px] uppercase">{athlete.stat1.label}</p>
                      <p className="text-white font-bold">{athlete.stat1.value}</p>
                    </div>
                    <div className="bg-[#050505] p-2 rounded-lg text-center border border-white/5">
                      <p className="text-gray-500 text-[10px] uppercase">{athlete.stat2.label}</p>
                      <p className="text-white font-bold">{athlete.stat2.value}</p>
                    </div>
                  </div>
                  <Link href={`/card/${athlete.id}`} className="mt-2 w-full py-2 rounded-full bg-white text-black font-bold text-sm hover:bg-[#d4af35] transition-colors text-center">
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Events Module */}
        <section className="px-4 py-16 lg:px-40 bg-[#050505]">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Text Content */}
            <div className="md:w-1/3 flex flex-col gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4af35]/20 text-[#d4af35]">
                <span className="material-symbols-outlined">event</span>
              </div>
              <h2 className="text-white text-3xl font-bold tracking-tight">{stateName} Combines &amp; Camps</h2>
              <p className="text-gray-400">Register for upcoming events to get verified data, updated measurements, and exposure to top recruiters in the Southwest zone.</p>
              <button className="mt-2 w-fit px-6 py-3 rounded-full border border-white/20 text-white font-medium hover:bg-white/5 transition-colors">
                View Full Calendar
              </button>
            </div>
            {/* Events List */}
            <div className="md:w-2/3 flex flex-col">
              <div className="flex flex-col divide-y divide-white/10 border-t border-b border-white/10">
                {mockEvents.map((event) => (
                  <div key={event.id} className="group flex items-center justify-between py-6 hover:bg-white/5 px-4 transition-colors rounded-lg">
                    <div className="flex gap-4 items-center">
                      <div className="flex flex-col items-center justify-center bg-[#121212] border border-white/10 rounded-lg h-16 w-16 min-w-16">
                        <span className="text-xs text-[#d4af35] font-bold uppercase">{event.month}</span>
                        <span className="text-xl text-white font-bold">{event.day}</span>
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg">{event.title}</h4>
                        <p className="text-gray-500 text-sm flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          {event.location}
                        </p>
                      </div>
                    </div>
                    <button className="hidden sm:block px-5 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-[#d4af35] transition-colors">Register</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0a0a0a] border-t border-white/10">
        <div className="px-4 py-20 lg:px-40 flex flex-col items-center text-center gap-8">
          <h2 className="text-white text-4xl md:text-5xl font-black uppercase tracking-tight max-w-3xl">
            Don&apos;t get left on the sidelines.
          </h2>
          <p className="text-gray-400 text-lg max-w-xl">
            Join over 12,000 {stateName} athletes taking control of their recruiting journey on RepMax.
          </p>
          <button className="flex h-14 min-w-[200px] items-center justify-center rounded-full bg-[#d4af35] px-8 text-lg font-bold text-[#201d13] shadow-xl hover:scale-105 transition-transform">
            Join {stateName} Athletes on RepMax
          </button>
          <div className="mt-12 flex flex-col md:flex-row justify-between w-full pt-8 border-t border-white/5 text-gray-500 text-sm">
            <p>© 2024 RepMax. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-white transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
