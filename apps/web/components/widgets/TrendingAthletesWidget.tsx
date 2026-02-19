import Link from 'next/link';

interface TrendingAthlete {
  id: string;
  name: string;
  position: string;
  stars: number;
  rank?: number;
  viewChange?: string;
  isTrending?: boolean;
  views: number;
  shortlists: number;
  imageUrl: string;
}

function getPlaceholderGradient(id: string): string {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ];
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
  return gradients[index];
}

function renderStars(count: number) {
  return (
    <div className="flex items-center text-[#D4AF37]">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className="material-symbols-outlined text-[16px]"
          style={{ fontVariationSettings: i < count ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
    </div>
  );
}

interface TrendingAthletesWidgetProps {
  athletes?: TrendingAthlete[];
}

export default function TrendingAthletesWidget({ athletes = [] }: TrendingAthletesWidgetProps) {
  return (
    <div className="w-full max-w-4xl flex flex-col gap-0 bg-[#1F1F22] rounded-2xl shadow-2xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="flex flex-row items-center justify-between p-6 border-b border-white/5 bg-[#1F1F22]">
        <div className="flex items-center gap-2">
          <h2 className="text-white tracking-tight text-xl md:text-2xl font-bold leading-tight">🔥 Trending Athletes</h2>
        </div>
        {/* Filter Chip */}
        <button className="flex h-9 items-center justify-center gap-x-2 rounded-lg bg-[#2A2A2E] hover:bg-[#333336] transition-colors border border-white/5 pl-4 pr-3 cursor-pointer group">
          <p className="text-zinc-400 group-hover:text-white text-sm font-medium leading-normal transition-colors">This Week</p>
          <span className="material-symbols-outlined text-zinc-500 group-hover:text-white text-xl transition-colors">expand_more</span>
        </button>
      </div>

      {/* List Container */}
      <div className="flex flex-col gap-3 p-6 bg-[#1F1F22]">
        {athletes.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-sm">No trending athletes</p>
          </div>
        )}
        {athletes.map((athlete) => (
          <div
            key={athlete.id}
            className="group relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-xl bg-[#1A1A1A] hover:bg-[#222222] p-4 transition-all duration-300 border border-transparent hover:border-[#D4AF37]/20 shadow-sm"
          >
            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  className="size-16 rounded-xl bg-cover bg-center shadow-inner"
                  style={{ backgroundImage: athlete.imageUrl && !athlete.imageUrl.includes('googleusercontent.com') ? `url('${athlete.imageUrl}')` : getPlaceholderGradient(athlete.id) }}
                ></div>
                {athlete.rank && (
                  <div className="absolute -bottom-2 -right-2 bg-[#1A1A1A] rounded-full p-1">
                    <span className="flex items-center justify-center bg-[#D4AF37] text-[#1F1F22] text-[10px] font-bold size-5 rounded-full">{athlete.rank}</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {athlete.viewChange && (
                    <span className="inline-flex items-center gap-1 rounded bg-[#D4AF37]/10 px-2 py-0.5 text-xs font-bold text-[#D4AF37] border border-[#D4AF37]/20">
                      <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                      {athlete.viewChange} views
                    </span>
                  )}
                  {athlete.isTrending && (
                    <span className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300 border border-zinc-700">
                      <span className="material-symbols-outlined text-[14px] text-green-400">trending_up</span>
                      Trending
                    </span>
                  )}
                </div>
                <h3 className="text-white text-lg font-bold leading-tight group-hover:text-[#D4AF37] transition-colors">{athlete.name}</h3>
                <div className="flex items-center gap-2 text-sm text-[#888888]">
                  <span className="font-medium text-zinc-300">{athlete.position}</span>
                  <span className="text-zinc-600">•</span>
                  {renderStars(athlete.stars)}
                </div>
              </div>
            </div>

            {/* Stats & Action */}
            <div className="flex flex-row md:flex-col lg:flex-row items-center justify-between w-full md:w-auto gap-4 md:gap-8 border-t md:border-t-0 border-white/5 pt-4 md:pt-0 mt-2 md:mt-0">
              <div className="flex flex-col items-start md:items-end gap-0.5">
                <p className="text-zinc-400 text-sm font-medium">Engagement</p>
                <p className="text-white text-sm">
                  <span className="font-bold">{athlete.views}</span> views{' '}
                  <span className="text-zinc-600">·</span>{' '}
                  <span className="font-bold">{athlete.shortlists}</span> shortlist{athlete.shortlists !== 1 ? 's' : ''}
                </p>
              </div>
              <Link
                href={`/card/${athlete.id}`}
                className="flex items-center gap-1 text-[#D4AF37] text-sm font-semibold hover:text-white transition-colors group/btn"
              >
                View Card
                <span className="material-symbols-outlined text-lg group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Link */}
      <div className="bg-[#1A1A1A] p-4 text-center border-t border-white/5">
        <Link href="/recruiter/prospects" className="text-xs text-zinc-500 hover:text-[#D4AF37] transition-colors font-medium uppercase tracking-widest">
          View All Trends
        </Link>
      </div>
    </div>
  );
}
