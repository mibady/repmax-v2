'use client';

import Link from 'next/link';

interface FilmHighlight {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration: string;
  views: number;
  date: string;
  isFeatured?: boolean;
}

const sampleHighlights: FilmHighlight[] = [
  {
    id: '1',
    title: 'Junior Season Highlights',
    thumbnailUrl: 'https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=600&h=340&fit=crop',
    duration: '04:32',
    views: 1200,
    date: 'Oct 12, 2023',
    isFeatured: true,
  },
  {
    id: '2',
    title: 'vs. State Championship',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&h=340&fit=crop',
    duration: '02:15',
    views: 450,
    date: 'Sep 28, 2023',
  },
  {
    id: '3',
    title: 'Training Camp Cuts',
    thumbnailUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&h=340&fit=crop',
    duration: '01:45',
    views: 320,
    date: 'Aug 15, 2023',
  },
];

export default function FilmManagementPage() {
  return (
    <div className="flex h-screen w-full bg-background-dark">
      {/* Side Navigation */}
      <aside className="w-72 hidden md:flex flex-col border-r border-[#1F1F22] bg-[#050505] p-4 z-20">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 py-4 mb-6">
          <div className="bg-primary/20 p-2 rounded-lg">
            <span className="material-symbols-outlined text-primary text-3xl">sports_football</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">RepMax</h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2 flex-1">
          <Link
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-[#1F1F22] transition-colors group"
            href="/dashboard/athlete"
          >
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">dashboard</span>
            <span className="font-medium text-sm">Dashboard</span>
          </Link>
          <Link
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#1F1F22] border-l-4 border-primary text-white transition-colors"
            href="/dashboard/athlete/film"
          >
            <span className="material-symbols-outlined text-primary">movie</span>
            <span className="font-medium text-sm">Your Highlights</span>
          </Link>
          <Link
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-[#1F1F22] transition-colors group"
            href="/dashboard/athlete/recruiting"
          >
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">group</span>
            <span className="font-medium text-sm">Recruiting</span>
          </Link>
          <Link
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-[#1F1F22] transition-colors group"
            href="/dashboard/athlete/stats"
          >
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">bar_chart</span>
            <span className="font-medium text-sm">Stats</span>
          </Link>
          <Link
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-[#1F1F22] transition-colors group"
            href="/settings"
          >
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">settings</span>
            <span className="font-medium text-sm">Settings</span>
          </Link>
        </nav>

        {/* User Profile */}
        <div className="mt-auto border-t border-[#1F1F22] pt-4">
          <div className="flex items-center gap-3 px-2">
            <div className="size-10 rounded-full bg-gray-700 border border-[#333]"></div>
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-white">Marcus Johnson</p>
              <p className="text-xs text-gray-400">Class of '25</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-background-dark relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-[#1F1F22] bg-[#050505]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">sports_football</span>
            <span className="font-bold text-white">RepMax</span>
          </div>
          <button className="text-white">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>

        <div className="max-w-[1280px] w-full mx-auto p-6 md:p-10 flex flex-col gap-8">
          {/* Page Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Your Highlights</h1>
              <p className="text-gray-400 text-base">Manage and organize your game film for recruiters</p>
            </div>
            <button className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-black font-bold text-sm px-6 py-3 rounded-lg transition-all shadow-[0_0_15px_rgba(212,175,53,0.2)]">
              <span className="material-symbols-outlined text-xl">upload_file</span>
              <span>Upload Film</span>
            </button>
          </header>

          {/* Upload Zone */}
          <section className="w-full">
            <div className="group relative flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed border-[#333] hover:border-primary/50 bg-[#1F1F22]/50 hover:bg-[#1F1F22] transition-all cursor-pointer">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                <div className="bg-[#2A2A2E] p-3 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                </div>
                <p className="mb-1 text-lg font-bold text-white">Upload New Footage</p>
                <p className="mb-2 text-sm text-gray-400">Drag and drop your highlight reels here</p>
                <p className="text-xs font-mono text-primary/80 uppercase tracking-wider bg-primary/10 px-2 py-1 rounded">
                  MP4, MOV up to 2GB
                </p>
              </div>
            </div>
          </section>

          {/* Film Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sampleHighlights.map((highlight) => (
              <article
                key={highlight.id}
                className={`flex flex-col bg-[#1F1F22] rounded-xl overflow-hidden border transition-all group ${
                  highlight.isFeatured
                    ? 'border-primary shadow-[0_0_20px_rgba(212,175,53,0.05)]'
                    : 'border-transparent hover:border-[#333]'
                } relative`}
              >
                {/* Featured Badge */}
                {highlight.isFeatured && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2 py-1 bg-primary text-black text-xs font-bold rounded-md shadow-sm uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">star</span>
                      Featured
                    </span>
                  </div>
                )}

                {/* Thumbnail */}
                <div className="relative w-full aspect-video bg-gray-900 group/image cursor-pointer overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${highlight.thumbnailUrl}')` }}
                  ></div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>

                  {/* Play Button */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                      highlight.isFeatured ? 'opacity-90 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <div className="size-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-white text-3xl">play_arrow</span>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-3 right-3">
                    <span className="px-1.5 py-0.5 bg-black/80 text-white text-xs font-mono rounded font-medium">
                      {highlight.duration}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-white text-lg font-bold leading-tight group-hover:text-primary transition-colors cursor-pointer">
                      {highlight.title}
                    </h3>
                    <button className="text-gray-500 hover:text-white transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-4 text-xs text-gray-400 font-mono">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        {highlight.views >= 1000
                          ? `${(highlight.views / 1000).toFixed(1)}k`
                          : highlight.views}
                      </span>
                      <span>{highlight.date}</span>
                    </div>
                    <button className="text-primary hover:text-white text-xs font-bold uppercase tracking-wider">
                      Edit
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
