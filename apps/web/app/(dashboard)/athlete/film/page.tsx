'use client';

import { useHighlights, type Highlight } from '@/lib/hooks';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function HighlightCard({
  highlight,
  formatDuration,
  formatViews,
  isFeatured,
}: {
  highlight: Highlight;
  formatDuration: (seconds: number | null) => string;
  formatViews: (views: number) => string;
  isFeatured: boolean;
}) {
  const thumbnailUrl =
    highlight.thumbnail_url ||
    'https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=600&h=340&fit=crop';

  return (
    <article
      className={`flex flex-col bg-[#1F1F22] rounded-xl overflow-hidden border transition-all group ${
        isFeatured
          ? 'border-primary shadow-[0_0_20px_rgba(212,175,53,0.05)]'
          : 'border-transparent hover:border-[#333]'
      } relative`}
    >
      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2 py-1 bg-primary text-black text-xs font-bold rounded-md shadow-sm uppercase tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">star</span>
            Featured
          </span>
        </div>
      )}

      {/* AI Analyzed Badge */}
      {highlight.ai_analyzed && (
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2 py-1 bg-purple-600/80 text-white text-xs font-bold rounded-md shadow-sm uppercase tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">smart_toy</span>
            AI
          </span>
        </div>
      )}

      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-gray-900 group/image cursor-pointer overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url('${thumbnailUrl}')` }}
        ></div>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>

        {/* Play Button */}
        <a
          href={highlight.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className={`absolute inset-0 flex items-center justify-center transition-opacity ${
            isFeatured ? 'opacity-90 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <div className="size-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-white text-3xl">play_arrow</span>
          </div>
        </a>

        {/* Duration */}
        <div className="absolute bottom-3 right-3">
          <span className="px-1.5 py-0.5 bg-black/80 text-white text-xs font-mono rounded font-medium">
            {formatDuration(highlight.duration_seconds)}
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
        {highlight.description && (
          <p className="text-gray-400 text-sm line-clamp-2">{highlight.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-4 text-xs text-gray-400 font-mono">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">visibility</span>
              {formatViews(highlight.view_count)}
            </span>
            <span>{formatDate(highlight.created_at)}</span>
          </div>
          <button className="text-primary hover:text-white text-xs font-bold uppercase tracking-wider">
            Edit
          </button>
        </div>
      </div>
    </article>
  );
}

function LoadingSkeleton() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col bg-[#1F1F22] rounded-xl overflow-hidden border border-transparent animate-pulse"
        >
          <div className="w-full aspect-video bg-gray-700"></div>
          <div className="p-4 flex flex-col gap-3">
            <div className="h-5 bg-gray-700 rounded w-3/4"></div>
            <div className="flex items-center justify-between">
              <div className="h-3 bg-gray-700 rounded w-24"></div>
              <div className="h-3 bg-gray-700 rounded w-12"></div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-[#2A2A2E] p-4 rounded-full mb-4">
        <span className="material-symbols-outlined text-primary text-4xl">movie</span>
      </div>
      <h3 className="text-white text-xl font-bold mb-2">No highlights yet</h3>
      <p className="text-gray-400 mb-6 max-w-md">
        Upload your first highlight reel to start showcasing your skills to college recruiters.
      </p>
      <button className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-black font-bold text-sm px-6 py-3 rounded-lg transition-all">
        <span className="material-symbols-outlined text-xl">upload_file</span>
        <span>Upload Your First Highlight</span>
      </button>
    </div>
  );
}

export default function FilmManagementPage() {
  const { highlights, isLoading, error, formatDuration, formatViews, refetch } = useHighlights();

  return (
    <div className="p-8">
      <div className="max-w-[1280px] w-full mx-auto flex flex-col gap-8">
        {/* Page Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Your Highlights</h1>
            <p className="text-gray-400 text-base">
              {highlights.length > 0
                ? `${highlights.length} highlight${highlights.length === 1 ? '' : 's'} - ${highlights.reduce((acc, h) => acc + h.view_count, 0).toLocaleString()} total views`
                : 'Manage and organize your game film for recruiters'}
            </p>
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

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
            <p className="text-red-400 mb-4">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="text-primary hover:underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Film Grid */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : highlights.length === 0 ? (
          <EmptyState />
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {highlights.map((highlight, index) => (
              <HighlightCard
                key={highlight.id}
                highlight={highlight}
                formatDuration={formatDuration}
                formatViews={formatViews}
                isFeatured={index === 0}
              />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
