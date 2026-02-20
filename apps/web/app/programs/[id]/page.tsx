import Link from 'next/link';
import SearchInput from './SearchInput';
import { notFound } from 'next/navigation';

// Placeholder gradient generator for avatar images
function getPlaceholderGradient(seed: string): string {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ];
  const index = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
  return gradients[index];
}

// Static programs data for public pages
const PROGRAMS: Record<string, { name: string; city: string; state: string; zone: string; record: string; d1Prospects: number; athletes: number; about: string }> = {
  'north-shore': {
    name: 'North Shore High School',
    city: 'Houston',
    state: 'TX',
    zone: 'Southwest',
    record: '14-2',
    d1Prospects: 159,
    athletes: 12,
    about: 'North Shore High School is a premier athletic institution dedicated to developing top-tier talent in the Greater Houston area. With a history of excellence and a steadfast commitment to player development, we strive to dominate the competition both on and off the field. Our program emphasizes discipline, teamwork, and academic achievement, ensuring our athletes are prepared for the collegiate level.',
  },
};

export default async function ProgramSpotlightPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const program = PROGRAMS[id];

  if (!program) {
    notFound();
  }
  return (
    <div className="bg-[#050505] text-white min-h-screen flex flex-col antialiased selection:bg-[#D4AF37] selection:text-black">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-[#1F1F22] bg-[#050505]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 text-white transition-opacity hover:opacity-80">
              <div className="flex items-center justify-center size-8 rounded-lg bg-[#D4AF37] text-black">
                <span className="material-symbols-outlined text-[20px]">fitness_center</span>
              </div>
              <span className="text-xl font-bold tracking-tight">RepMax</span>
            </Link>
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/programs" className="text-sm font-medium text-gray-300 hover:text-[#D4AF37] transition-colors">Schools</Link>
              <Link href="/recruiter/prospects" className="text-sm font-medium text-gray-300 hover:text-[#D4AF37] transition-colors">Athletes</Link>
              <Link href="/pricing" className="text-sm font-medium text-gray-300 hover:text-[#D4AF37] transition-colors">Pricing</Link>
              <Link href="/rankings" className="text-sm font-medium text-gray-300 hover:text-[#D4AF37] transition-colors">Rankings</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {/* Search */}
            <SearchInput />
            {/* User Avatar */}
            <div className="relative size-9 rounded-full bg-[#1F1F22] overflow-hidden ring-1 ring-white/10">
              <div
                className="w-full h-full"
                style={{ background: getPlaceholderGradient('user') }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-[1000px] px-4 py-8 md:px-6 md:py-12">
          {/* Hero Section */}
          <section className="flex flex-col md:flex-row gap-6 md:gap-8 mb-10">
            {/* School Logo */}
            <div className="shrink-0">
              <div className="size-32 md:size-40 rounded-xl bg-[#1F1F22] border border-white/5 p-1 shadow-2xl">
                <div
                  className="w-full h-full rounded-lg"
                  style={{ background: getPlaceholderGradient(id) }}
                ></div>
              </div>
            </div>
            {/* School Info */}
            <div className="flex flex-col justify-end flex-1 gap-3">
              <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{program.name}</h1>
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  <span className="text-sm md:text-base font-medium">{program.city}, {program.state}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                {/* Zone Badge */}
                <span className="inline-flex items-center gap-1.5 rounded bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-500 ring-1 ring-inset ring-orange-500/20">
                  <span className="size-1.5 rounded-full bg-orange-500"></span>
                  {program.zone} Zone
                </span>
                {/* Record Badge */}
                <span className="inline-flex items-center gap-1.5 rounded bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-500 ring-1 ring-inset ring-green-500/20 font-mono tracking-wide">
                  {program.record} RECORD
                </span>
              </div>
            </div>
          </section>

          {/* Stats Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <div className="bg-[#1F1F22] border border-white/5 rounded-xl p-5 flex flex-col gap-1 transition-transform hover:scale-[1.01]">
              <p className="text-gray-400 text-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[#D4AF37] text-[18px]">school</span>
                D1 Prospects
              </p>
              <p className="text-3xl font-bold font-mono text-white">{program.d1Prospects}</p>
            </div>
            <div className="bg-[#1F1F22] border border-white/5 rounded-xl p-5 flex flex-col gap-1 transition-transform hover:scale-[1.01]">
              <p className="text-gray-400 text-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[#D4AF37] text-[18px]">group</span>
                Athletes on RepMax
              </p>
              <p className="text-3xl font-bold font-mono text-white">{program.athletes}</p>
            </div>
          </section>

          {/* About Section */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold text-white">About the Program</h2>
              <div className="h-px flex-1 bg-[#1F1F22]"></div>
            </div>
            <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed">
              <p>{program.about}</p>
            </div>
          </section>

          {/* Athlete Roster */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white">Featured Athletes</h2>
            </div>
            <div className="bg-[#1F1F22] border border-white/5 rounded-xl p-8 text-center">
              <p className="text-gray-500 text-sm">No athlete profiles available yet for this program.</p>
            </div>
          </section>

          {/* Coaching Staff */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-white mb-4">Coaching Staff</h2>
            <div className="bg-[#1F1F22] border border-white/5 rounded-xl p-8 text-center">
              <p className="text-gray-500 text-sm">Coaching staff information not yet available.</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer Actions Sticky */}
      <div className="sticky bottom-0 z-40 w-full bg-[#050505]/95 backdrop-blur border-t border-[#1F1F22] p-4">
        <div className="mx-auto max-w-[1000px] flex flex-col sm:flex-row gap-4">
          <button disabled title="Sign up to follow programs" className="flex-1 rounded-lg bg-[#D4AF37] py-3 px-6 text-sm font-bold text-black shadow-lg shadow-[#D4AF37]/20 hover:bg-[#D4AF37]/90 hover:shadow-[#D4AF37]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <span className="material-symbols-outlined">add_circle</span>
            Follow This Program
          </button>
          <Link href="/signup" className="flex-1 rounded-lg border border-[#333] bg-[#1F1F22] py-3 px-6 text-sm font-bold text-white hover:bg-[#2A2A2E] hover:border-gray-600 transition-all text-center">
            Create RepMax Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
