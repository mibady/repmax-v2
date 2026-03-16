'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { VideoPlayerModal } from '@/components/ui/video-player-modal';
import { AddHighlightModal } from '@/components/ui/add-highlight-modal';

interface FilmHighlight {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  view_count: number;
  created_at: string;
  athlete_id: string;
  athleteName: string;
  athletePosition: string;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatViews(views: number): string {
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return views.toString();
}

export default function FilmRoomPage() {
  const [highlights, setHighlights] = useState<FilmHighlight[]>([]);
  const [teamName, setTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterAthlete, setFilterAthlete] = useState<string>('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchFilm = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/coach/film');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to load film');
      }
      const data = await res.json();
      setHighlights(data.highlights || []);
      setTeamName(data.teamName || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load film');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchFilm(); }, [fetchFilm]);

  const athletes = useMemo(() => {
    const map = new Map<string, string>();
    highlights.forEach(h => map.set(h.athlete_id, h.athleteName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [highlights]);

  const filtered = useMemo(
    () => filterAthlete === 'all' ? highlights : highlights.filter(h => h.athlete_id === filterAthlete),
    [highlights, filterAthlete]
  );

  const totalViews = highlights.reduce((sum, h) => sum + h.view_count, 0);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAdd = async (data: { title: string; description?: string; video_url: string }) => {
    showFeedback('success', 'Highlight added — refresh to see it');
    setShowAddModal(false);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="mb-8">
            <div className="h-8 bg-[#1F1F22] rounded w-48 animate-pulse mb-2" />
            <div className="h-4 bg-[#1F1F22] rounded w-72 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#1F1F22] rounded-xl overflow-hidden animate-pulse">
                <div className="w-full aspect-video bg-gray-700" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-700 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load Film Room</h3>
          <p className="text-slate-400 text-sm">{error}</p>
          <button onClick={fetchFilm} className="mt-4 text-primary hover:underline text-sm">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-[1280px] w-full mx-auto flex flex-col gap-8">
        {/* Feedback Toast */}
        {feedback && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium ${
            feedback.type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
          }`}>
            <span className="material-symbols-outlined text-[18px]">
              {feedback.type === 'success' ? 'check_circle' : 'error'}
            </span>
            {feedback.message}
          </div>
        )}

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Film Room</h1>
            <p className="text-gray-400 text-base">
              {highlights.length > 0
                ? `${highlights.length} highlight${highlights.length === 1 ? '' : 's'} across ${athletes.length} athlete${athletes.length === 1 ? '' : 's'} · ${totalViews.toLocaleString()} total views`
                : `Review and manage highlight reels for ${teamName || 'your team'}`}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-primary text-black font-bold text-sm px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">upload_file</span>
            Upload Film
          </button>
        </header>

        {/* Athlete Filter */}
        {athletes.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterAthlete('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterAthlete === 'all'
                  ? 'bg-primary text-black'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
              }`}
            >
              All Athletes
              <span className={`ml-1.5 ${filterAthlete === 'all' ? 'text-black/60' : 'text-white/30'}`}>
                {highlights.length}
              </span>
            </button>
            {athletes.map(a => (
              <button
                key={a.id}
                onClick={() => setFilterAthlete(a.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterAthlete === a.id
                    ? 'bg-primary text-black'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
                }`}
              >
                {a.name}
                <span className={`ml-1.5 ${filterAthlete === a.id ? 'text-black/60' : 'text-white/30'}`}>
                  {highlights.filter(h => h.athlete_id === a.id).length}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Film Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-white/10 text-6xl mb-4">videocam</span>
            <h3 className="text-white text-xl font-bold mb-2">No highlights yet</h3>
            <p className="text-gray-400 mb-6 max-w-md">
              {highlights.length === 0
                ? 'Your athletes haven\'t uploaded any highlight reels yet.'
                : 'No highlights match the current filter.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((highlight) => {
              const thumbnailUrl = highlight.thumbnail_url ||
                'https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=600&h=340&fit=crop';
              return (
                <article
                  key={highlight.id}
                  className="flex flex-col bg-[#1F1F22] rounded-xl overflow-hidden border border-transparent hover:border-[#333] transition-all group"
                >
                  {/* Thumbnail */}
                  <div className="relative w-full aspect-video bg-gray-900 cursor-pointer overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url('${thumbnailUrl}')` }}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

                    {/* Play Button */}
                    <button
                      onClick={() => setActiveVideo({ url: highlight.video_url, title: highlight.title })}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="size-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-white text-3xl">play_arrow</span>
                      </div>
                    </button>

                    {/* Duration */}
                    <div className="absolute bottom-3 right-3">
                      <span className="px-1.5 py-0.5 bg-black/80 text-white text-xs font-mono rounded font-medium">
                        {formatDuration(highlight.duration_seconds)}
                      </span>
                    </div>

                    {/* Athlete Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded-md flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-[14px]">person</span>
                        {highlight.athleteName}
                        <span className="text-white/40">·</span>
                        <span className="text-primary">{highlight.athletePosition}</span>
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col gap-3">
                    <h3 className="text-white text-lg font-bold leading-tight group-hover:text-primary transition-colors cursor-pointer">
                      {highlight.title}
                    </h3>
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
                      <button
                        onClick={() => setActiveVideo({ url: highlight.video_url, title: highlight.title })}
                        className="text-primary text-xs font-bold uppercase tracking-wider hover:text-primary/80 transition-colors"
                      >
                        Watch
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {activeVideo && (
        <VideoPlayerModal
          videoUrl={activeVideo.url}
          title={activeVideo.title}
          isOpen={!!activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}

      <AddHighlightModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
        isSubmitting={false}
      />
    </div>
  );
}
