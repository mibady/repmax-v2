import Link from 'next/link';

interface CompareAthlete {
  id: string;
  name: string;
  position: string;
  classYear: string;
  rating: number;
  imageUrl: string;
  isOnline?: boolean;
  stats: {
    height: string;
    weight: string;
    wingspan: string;
    fortyYard: string;
    benchPress: string;
    verticalJump: string;
    shuttleRun: string;
    gpa: string;
    eligibility: 'Eligible' | 'Pending' | 'Ineligible';
    stateRank: string;
  };
  highlights?: {
    height?: boolean;
    weight?: boolean;
    wingspan?: boolean;
    fortyYard?: boolean;
    benchPress?: boolean;
    verticalJump?: boolean;
    shuttleRun?: boolean;
    gpa?: boolean;
    stateRank?: boolean;
  };
}

const mockAthletes: CompareAthlete[] = [
  {
    id: '1',
    name: 'Marcus Johnson',
    position: 'QB',
    classYear: 'Senior',
    rating: 4.5,
    isOnline: true,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAY9fqJm3nb4W-4p1ait_6OM16HxuaJvbGcAlWLk0p3XMhVJcExNb66113rvAq3fvMM8wRi7o3We1d2Syj0rdq3BDywz1avj1PED-42hykb1a6pZY9xKrSDAiNTwoR6WfNd4-TOpWr8qT_VRv2Xb5P-jAKa_bHtRzGbxuLtoz2Z_LrsaQd6qqN1IR3os8-TeKyegIka2DrDJfM3jRHChkBjt_oIrUgPp4-on-Sb0Ih4QZYeRi3tkxLqVVQ6i08s2pbUdKLzZYKZ9QY',
    stats: {
      height: '6\'3"',
      weight: '220 lbs',
      wingspan: '78"',
      fortyYard: '4.65s',
      benchPress: '18 reps',
      verticalJump: '34.5"',
      shuttleRun: '4.18s',
      gpa: '3.8',
      eligibility: 'Eligible',
      stateRank: '#4',
    },
    highlights: {
      height: true,
      wingspan: true,
      benchPress: true,
      shuttleRun: true,
      stateRank: true,
    },
  },
  {
    id: '2',
    name: 'Trey Smith',
    position: 'WR',
    classYear: 'Junior',
    rating: 4.0,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxUoUBKmswXmtNXMVnx0lrwytdSpgwDNaFWmYmAgy3bLoxQhcBefV5rw_pZDsUsMYavzpsrekJapxA4lLlCBzbSkGd9XRNH52BjFHbTCt5318RyUPfvbhf0UPjgxg4UqNxVqGevcw4ZTCQQ8mkk_i6CdPNcDgZ2w40vAs6mqZlnJX6rcY-i9cvnF17BPxI3gjZgr1SXhyOV4GhjhNaDQ2vnPSlaurFYRILsctJnAJozr8wwDChj7uJ1Q85vsk3pkfTxPhc8qe7GKQ',
    stats: {
      height: '6\'1"',
      weight: '195 lbs',
      wingspan: '74"',
      fortyYard: '4.42s',
      benchPress: '12 reps',
      verticalJump: '38.0"',
      shuttleRun: '4.25s',
      gpa: '3.2',
      eligibility: 'Eligible',
      stateRank: '#12',
    },
    highlights: {
      fortyYard: true,
      verticalJump: true,
    },
  },
  {
    id: '3',
    name: "David O'Connor",
    position: 'QB',
    classYear: 'Senior',
    rating: 3.5,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnYDTRv8_MH7eUN0gKj9YeCjb-sRDmQUchHdKr3Ktsir4AmuSeFUkrVjRFftCIOvItGYoDNmJ2dZb5dFr1d_X8HWk9B4jFSvdc8WNE9oI3j1WVg5Y0s7I2JBnBdIfICOmwis3HkqxCRgbQjdUpES48FQ9qJgHJAzSTawig3AUMSTgE8a5Ta35h08-CTk0_TSAVPUW9-6i4ndpmmCq6nwUIXArMY9FQmacj5-OXZpJp2344AdfKWZ63TWgc49pKtOu2DSkvxJGnf68',
    stats: {
      height: '6\'2"',
      weight: '225 lbs',
      wingspan: '76"',
      fortyYard: '4.80s',
      benchPress: '16 reps',
      verticalJump: '32.0"',
      shuttleRun: '4.30s',
      gpa: '3.9',
      eligibility: 'Pending',
      stateRank: '#28',
    },
    highlights: {
      weight: true,
      gpa: true,
    },
  },
];

function renderStars(rating: number) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center justify-center gap-0.5 mt-2 text-[#D4AF37]">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className="material-symbols-outlined icon-filled text-[16px]">star</span>
      ))}
      {hasHalf && (
        <span className="material-symbols-outlined text-[16px]">star_half</span>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className="material-symbols-outlined text-[16px]">star_outline</span>
      ))}
      <span className="ml-1 text-xs text-white font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

function getEligibilityColor(eligibility: string) {
  switch (eligibility) {
    case 'Eligible':
      return 'text-green-400';
    case 'Pending':
      return 'text-yellow-500';
    case 'Ineligible':
      return 'text-red-400';
    default:
      return 'text-white';
  }
}

export default function ComparePage() {
  return (
    <div className="bg-[#050505] text-white font-[family-name:var(--font-inter)] overflow-hidden h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="flex-none flex items-center justify-between whitespace-nowrap border-b border-solid border-[#2A2A2E] bg-[#1F1F22] px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 text-white">
            <div className="size-8 flex items-center justify-center text-[#D4AF37]">
              <span className="material-symbols-outlined text-3xl">sports_football</span>
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-tight">RepMax Recruit</h2>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard/recruiter" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">Dashboard</Link>
            <Link href="/dashboard/recruiter/search" className="text-white text-sm font-medium transition-colors">Athletes</Link>
            <Link href="#" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">Teams</Link>
            <Link href="/dashboard/recruiter/board" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">Recruiting Board</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </span>
            <input
              className="block w-full rounded-full border-none bg-[#2A2A2E] py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] sm:w-64"
              placeholder="Search athletes..."
              type="text"
            />
          </div>
          <div
            className="h-8 w-8 rounded-full bg-cover bg-center border border-[#2A2A2E]"
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDX3pkXdxhFGmeEUMsgTz2EJo3TYjZqvT63a0-xOsihg-1ur6CEXJrd9UImvoD-3JwKKi4j1DIX_1eSyJDhta8U-E6VxGmb4W8n5zKzZsLH0UAqW2fm2-wJXb5np6TsmgAyNryVkvkEF81gJWYCLmtBZRt0UqalLn1C0q5FI7EmG3J-iuY-QLJzD4j78Oz58fv2EbCPGYnhnM9YTk3reJ9sF_tY9pwc143Nx8NekfMeGx64X--1P1tUmVKuR57kglzdRp6KpNEN0pg")' }}
          ></div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Page Header */}
        <div className="flex-none px-6 py-6 border-b border-[#2A2A2E] bg-[#050505]">
          <div className="max-w-[1400px] mx-auto w-full flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-black text-white tracking-tight">Compare Athletes</h1>
              <p className="text-gray-400 text-sm">Analyze stats side-by-side to find your next star recruit.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-lg border border-[#2A2A2E] bg-[#1F1F22] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2A2A2E] transition-colors">
                <span className="material-symbols-outlined text-[20px]">download</span>
                Export Data
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-bold text-[#050505] hover:bg-yellow-500 transition-colors shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                <span className="material-symbols-outlined text-[20px]">add</span>
                Add Athlete
              </button>
            </div>
          </div>
        </div>

        {/* Comparison Table Area */}
        <div className="flex-1 overflow-auto custom-scrollbar bg-[#050505] p-6">
          <div className="max-w-[1400px] mx-auto w-full">
            <div className="relative rounded-xl border border-[#2A2A2E] bg-[#1F1F22] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-[#151517]">
                      {/* Sticky Corner Header */}
                      <th className="sticky left-0 z-30 w-[240px] min-w-[240px] bg-[#151517] p-4 text-left border-b border-r border-[#2A2A2E] shadow-[4px_0_24px_rgba(0,0,0,0.4)]">
                        <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Metrics</div>
                      </th>
                      {/* Athlete Headers */}
                      {mockAthletes.map((athlete) => (
                        <th key={athlete.id} className="w-[280px] min-w-[280px] p-4 border-b border-r border-[#2A2A2E] align-top bg-[#1F1F22]">
                          <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                              <div
                                className="size-20 rounded-full bg-cover bg-center border-2 border-[#2A2A2E]"
                                style={{ backgroundImage: `url("${athlete.imageUrl}")` }}
                              ></div>
                              {athlete.isOnline && (
                                <div className="absolute -bottom-1 -right-1 bg-[#1F1F22] rounded-full p-1 border border-[#2A2A2E]">
                                  <div className="bg-green-500 size-3 rounded-full"></div>
                                </div>
                              )}
                            </div>
                            <div className="text-center">
                              <h3 className="text-lg font-bold text-white leading-tight">{athlete.name}</h3>
                              <div className="flex items-center justify-center gap-2 mt-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2A2A2E] text-gray-300 uppercase tracking-wide">{athlete.position}</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2A2A2E] text-gray-300 uppercase tracking-wide">{athlete.classYear}</span>
                              </div>
                              {renderStars(athlete.rating)}
                            </div>
                          </div>
                        </th>
                      ))}
                      {/* Add New Header */}
                      <th className="w-[240px] min-w-[240px] p-4 border-b border-[#2A2A2E] align-middle bg-[#151517]">
                        <div className="flex flex-col items-center justify-center h-full min-h-[140px] rounded-lg border-2 border-dashed border-[#2A2A2E] bg-transparent group hover:border-[#D4AF37]/50 hover:bg-[#1F1F22] transition-all cursor-pointer">
                          <div className="size-10 rounded-full bg-[#2A2A2E] flex items-center justify-center text-gray-400 group-hover:text-[#D4AF37] transition-colors mb-2">
                            <span className="material-symbols-outlined">add</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-400 group-hover:text-white transition-colors">Add Athlete</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2A2E] bg-[#1F1F22]">
                    {/* Section: Physical Attributes */}
                    <tr className="bg-[#252529]">
                      <td className="sticky left-0 z-10 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-[#252529] border-r border-[#2A2A2E] shadow-[4px_0_10px_rgba(0,0,0,0.2)]" colSpan={5}>
                        Physical Attributes
                      </td>
                    </tr>
                    <tr className="group hover:bg-[#252529] transition-colors">
                      <td className="sticky left-0 z-10 p-4 text-sm font-medium text-gray-300 border-r border-[#2A2A2E] bg-[#1F1F22] group-hover:bg-[#252529] shadow-[4px_0_24px_rgba(0,0,0,0.4)]">Height</td>
                      {mockAthletes.map((athlete) => (
                        <td key={athlete.id} className={`p-4 text-center font-mono text-sm border-r border-[#2A2A2E] ${athlete.highlights?.height ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold' : 'text-white'}`}>
                          {athlete.stats.height}
                        </td>
                      ))}
                      <td className="p-4 border-l border-dashed border-[#2A2A2E] bg-[#151517]"></td>
                    </tr>
                    <tr className="group hover:bg-[#252529] transition-colors">
                      <td className="sticky left-0 z-10 p-4 text-sm font-medium text-gray-300 border-r border-[#2A2A2E] bg-[#1F1F22] group-hover:bg-[#252529] shadow-[4px_0_24px_rgba(0,0,0,0.4)]">Weight</td>
                      {mockAthletes.map((athlete) => (
                        <td key={athlete.id} className={`p-4 text-center font-mono text-sm border-r border-[#2A2A2E] ${athlete.highlights?.weight ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold' : 'text-white'}`}>
                          {athlete.stats.weight}
                        </td>
                      ))}
                      <td className="p-4 border-l border-dashed border-[#2A2A2E] bg-[#151517]"></td>
                    </tr>
                    <tr className="group hover:bg-[#252529] transition-colors">
                      <td className="sticky left-0 z-10 p-4 text-sm font-medium text-gray-300 border-r border-[#2A2A2E] bg-[#1F1F22] group-hover:bg-[#252529] shadow-[4px_0_24px_rgba(0,0,0,0.4)]">Wingspan</td>
                      {mockAthletes.map((athlete) => (
                        <td key={athlete.id} className={`p-4 text-center font-mono text-sm border-r border-[#2A2A2E] ${athlete.highlights?.wingspan ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold' : 'text-white'}`}>
                          {athlete.stats.wingspan}
                        </td>
                      ))}
                      <td className="p-4 border-l border-dashed border-[#2A2A2E] bg-[#151517]"></td>
                    </tr>

                    {/* Section: Combine Stats */}
                    <tr className="bg-[#252529]">
                      <td className="sticky left-0 z-10 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-[#252529] border-r border-[#2A2A2E] shadow-[4px_0_10px_rgba(0,0,0,0.2)]" colSpan={5}>
                        Combine Performance
                      </td>
                    </tr>
                    <tr className="group hover:bg-[#252529] transition-colors">
                      <td className="sticky left-0 z-10 p-4 text-sm font-medium text-gray-300 border-r border-[#2A2A2E] bg-[#1F1F22] group-hover:bg-[#252529] shadow-[4px_0_24px_rgba(0,0,0,0.4)]">40-Yard Dash</td>
                      {mockAthletes.map((athlete) => (
                        <td key={athlete.id} className={`p-4 text-center font-mono text-sm border-r border-[#2A2A2E] ${athlete.highlights?.fortyYard ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold' : 'text-white'}`}>
                          {athlete.stats.fortyYard}
                        </td>
                      ))}
                      <td className="p-4 border-l border-dashed border-[#2A2A2E] bg-[#151517]"></td>
                    </tr>
                    <tr className="group hover:bg-[#252529] transition-colors">
                      <td className="sticky left-0 z-10 p-4 text-sm font-medium text-gray-300 border-r border-[#2A2A2E] bg-[#1F1F22] group-hover:bg-[#252529] shadow-[4px_0_24px_rgba(0,0,0,0.4)]">Bench Press (225)</td>
                      {mockAthletes.map((athlete) => (
                        <td key={athlete.id} className={`p-4 text-center font-mono text-sm border-r border-[#2A2A2E] ${athlete.highlights?.benchPress ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold' : 'text-white'}`}>
                          {athlete.stats.benchPress}
                        </td>
                      ))}
                      <td className="p-4 border-l border-dashed border-[#2A2A2E] bg-[#151517]"></td>
                    </tr>
                    <tr className="group hover:bg-[#252529] transition-colors">
                      <td className="sticky left-0 z-10 p-4 text-sm font-medium text-gray-300 border-r border-[#2A2A2E] bg-[#1F1F22] group-hover:bg-[#252529] shadow-[4px_0_24px_rgba(0,0,0,0.4)]">Vertical Jump</td>
                      {mockAthletes.map((athlete) => (
                        <td key={athlete.id} className={`p-4 text-center font-mono text-sm border-r border-[#2A2A2E] ${athlete.highlights?.verticalJump ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold' : 'text-white'}`}>
                          {athlete.stats.verticalJump}
                        </td>
                      ))}
                      <td className="p-4 border-l border-dashed border-[#2A2A2E] bg-[#151517]"></td>
                    </tr>
                    <tr className="group hover:bg-[#252529] transition-colors">
                      <td className="sticky left-0 z-10 p-4 text-sm font-medium text-gray-300 border-r border-[#2A2A2E] bg-[#1F1F22] group-hover:bg-[#252529] shadow-[4px_0_24px_rgba(0,0,0,0.4)]">Shuttle Run</td>
                      {mockAthletes.map((athlete) => (
                        <td key={athlete.id} className={`p-4 text-center font-mono text-sm border-r border-[#2A2A2E] ${athlete.highlights?.shuttleRun ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold' : 'text-white'}`}>
                          {athlete.stats.shuttleRun}
                        </td>
                      ))}
                      <td className="p-4 border-l border-dashed border-[#2A2A2E] bg-[#151517]"></td>
                    </tr>

                    {/* Section: Academics & Others */}
                    <tr className="bg-[#252529]">
                      <td className="sticky left-0 z-10 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-[#252529] border-r border-[#2A2A2E] shadow-[4px_0_10px_rgba(0,0,0,0.2)]" colSpan={5}>
                        Academics &amp; Status
                      </td>
                    </tr>
                    <tr className="group hover:bg-[#252529] transition-colors">
                      <td className="sticky left-0 z-10 p-4 text-sm font-medium text-gray-300 border-r border-[#2A2A2E] bg-[#1F1F22] group-hover:bg-[#252529] shadow-[4px_0_24px_rgba(0,0,0,0.4)]">GPA</td>
                      {mockAthletes.map((athlete) => (
                        <td key={athlete.id} className={`p-4 text-center font-mono text-sm border-r border-[#2A2A2E] ${athlete.highlights?.gpa ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold' : 'text-white'}`}>
                          {athlete.stats.gpa}
                        </td>
                      ))}
                      <td className="p-4 border-l border-dashed border-[#2A2A2E] bg-[#151517]"></td>
                    </tr>
                    <tr className="group hover:bg-[#252529] transition-colors">
                      <td className="sticky left-0 z-10 p-4 text-sm font-medium text-gray-300 border-r border-[#2A2A2E] bg-[#1F1F22] group-hover:bg-[#252529] shadow-[4px_0_24px_rgba(0,0,0,0.4)]">Eligibility</td>
                      {mockAthletes.map((athlete) => (
                        <td key={athlete.id} className={`p-4 text-center font-mono text-sm border-r border-[#2A2A2E] ${getEligibilityColor(athlete.stats.eligibility)}`}>
                          {athlete.stats.eligibility}
                        </td>
                      ))}
                      <td className="p-4 border-l border-dashed border-[#2A2A2E] bg-[#151517]"></td>
                    </tr>
                    <tr className="group hover:bg-[#252529] transition-colors">
                      <td className="sticky left-0 z-10 p-4 text-sm font-medium text-gray-300 border-r border-[#2A2A2E] bg-[#1F1F22] group-hover:bg-[#252529] shadow-[4px_0_24px_rgba(0,0,0,0.4)]">State Rank</td>
                      {mockAthletes.map((athlete) => (
                        <td key={athlete.id} className={`p-4 text-center font-mono text-sm border-r border-[#2A2A2E] ${athlete.highlights?.stateRank ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold' : 'text-white'}`}>
                          {athlete.stats.stateRank}
                        </td>
                      ))}
                      <td className="p-4 border-l border-dashed border-[#2A2A2E] bg-[#151517]"></td>
                    </tr>

                    {/* Empty spacer row for visual bottom padding */}
                    <tr className="h-20">
                      <td className="sticky left-0 z-10 bg-[#1F1F22] border-r border-[#2A2A2E] shadow-[4px_0_24px_rgba(0,0,0,0.4)]"></td>
                      <td className="border-r border-[#2A2A2E]"></td>
                      <td className="border-r border-[#2A2A2E]"></td>
                      <td className="border-r border-[#2A2A2E]"></td>
                      <td className="border-l border-dashed border-[#2A2A2E] bg-[#151517]"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <p className="text-xs text-gray-500">Last updated: Today at 2:30 PM • Data source: Verified Combine</p>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 12px;
          width: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1F1F22;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2A2A2E;
          border-radius: 6px;
          border: 3px solid #1F1F22;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #45454a;
        }
        .icon-filled {
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </div>
  );
}
