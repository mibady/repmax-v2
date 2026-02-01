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

const mockAthletes: TrendingAthlete[] = [
  {
    id: '1',
    name: 'Marcus Johnson',
    position: 'QB',
    stars: 5,
    rank: 1,
    viewChange: '+250%',
    views: 47,
    shortlists: 5,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2bMS4mWNS5cGJ_aoxaliwiGtBzuEZDtYufl-RgcuFRtCmpYhQpV8msvKATx5AJ_hgK5y0TNIaaTzkBKvGWUq4IGCJmsPNOrNIBGfacC8aJDX2GlD-UETe-IUIZvtloY5f43dbeLt7krQymjLxiJUHN5SROjJru_5ZDPdGEEpftfQYP6UgTFmc_ozUjlKupZun7yjEHDOpAhn13yLgpAgHtWTWKZUXsrW-RD4AM448NHqWbRPdaufROcypgZhgZ_3Y1kE6MFMA4ZA',
  },
  {
    id: '2',
    name: 'David Chen',
    position: 'WR',
    stars: 4,
    isTrending: true,
    views: 32,
    shortlists: 2,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtbJ5Jv6Y2m0Jl4OwIaejAg8MNBbnpbE1A1Ry8IZ7dpOUrHJyneABuLMIUUpu14kQKrmgrva30ZjBF8E02sgl5nKaqMEHlYXXqN1_gXnBRlDkjBzGR_XAUOjG8FRy4sQv737Fbs5BnoEqHYmjgy05Ld9eIKGOJMyBTEkFSS8lXQr14k3b-k6FwraxUZoYGh5nbKuepf4LP1lMlC59D59LEZx8EcQm9piSkeVurZQMB2DNu1q_tJtsyL86_I5gV1URyve03y9eDMLo',
  },
  {
    id: '3',
    name: 'Sarah Williams',
    position: 'PG',
    stars: 4,
    views: 28,
    shortlists: 1,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHws2fHCbX7hXvivpDIeZe3-cwOcdkvbZNVKo-9TLp-e36Qx8q6gJlcFQxf3FgL_SHzp0JtHhbIq-DOu2impXiJDlrtUOplBLHH1L1Nwid-VTvuAfc6Wm1slXq8A4_5W_hQnOZtEEfFo_5Kai8ab5d-jQi5A8AhnxRah9AB_WVjajr1q-9nwWeWnPdVsNBQ3OiPnbCegCpOjGH5O7cXXQ5xR_FbJy-1p3Fn_mx8RCkhHIkVhIp2eeCloONjoAX-zUVRqHWEtWyOCE',
  },
];

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

export default function TrendingAthletesWidget() {
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
        {mockAthletes.map((athlete) => (
          <div
            key={athlete.id}
            className="group relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-xl bg-[#1A1A1A] hover:bg-[#222222] p-4 transition-all duration-300 border border-transparent hover:border-[#D4AF37]/20 shadow-sm"
          >
            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  className="size-16 rounded-xl bg-cover bg-center shadow-inner"
                  style={{ backgroundImage: `url('${athlete.imageUrl}')` }}
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
        <Link href="#" className="text-xs text-zinc-500 hover:text-[#D4AF37] transition-colors font-medium uppercase tracking-widest">
          View All Trends
        </Link>
      </div>
    </div>
  );
}
