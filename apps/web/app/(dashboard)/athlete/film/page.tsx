'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useHighlights, type Highlight, useSubscription } from '@/lib/hooks';
import { getAthleteTier } from '@/lib/utils/subscription-tier';
import { UpgradeCTA } from '@/components/upgrade-cta';
import { VideoPlayerModal } from '@/components/ui/video-player-modal';
import { AddHighlightModal } from '@/components/ui/add-highlight-modal';

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
  onPlay,
  onEdit,
  onDelete,
}: {
  highlight: Highlight;
  formatDuration: (seconds: number | null) => string;
  formatViews: (views: number) => string;
  isFeatured: boolean;
  onPlay: (highlight: Highlight) => void;
  onEdit: (highlight: Highlight) => void;
  onDelete: (highlightId: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
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
        <button
          onClick={() => onPlay(highlight)}
          className={`absolute inset-0 flex items-center justify-center transition-opacity ${
            isFeatured ? 'opacity-90 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
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
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-white text-lg font-bold leading-tight group-hover:text-primary transition-colors cursor-pointer">
            {highlight.title}
          </h3>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">more_vert</span>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 z-20 bg-[#2A2A2E] border border-white/10 rounded-lg shadow-xl py-1 min-w-[140px]">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(highlight);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(highlight.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  Delete
                </button>
              </div>
            )}
          </div>
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
          <button
            onClick={() => onEdit(highlight)}
            className="text-primary text-xs font-bold uppercase tracking-wider hover:text-primary/80 transition-colors"
          >
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

export default function FilmManagementPage() {
  const { highlights, isLoading, error, add, update, remove, isPending, formatDuration, formatViews, refetch } = useHighlights();
  const { subscription, isLoading: subLoading } = useSubscription();
  const tier = getAthleteTier(subscription?.plan?.slug);
  const maxHighlights = tier === 'basic' ? 3 : tier === 'premium' ? 5 : Infinity;
  const atLimit = highlights.length >= maxHighlights;
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editHighlight, setEditHighlight] = useState<Highlight | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAdd = async (data: { title: string; description?: string; video_url: string }) => {
    const result = await add(data);
    if (result.error) {
      showFeedback('error', result.error);
      throw new Error(result.error);
    }
    showFeedback('success', 'Highlight added successfully');
    setShowAddModal(false);
  };

  const handleEdit = async (data: { title: string; description?: string; video_url: string }) => {
    if (!editHighlight) return;
    const result = await update(editHighlight.id, {
      title: data.title,
      description: data.description,
    });
    if ('error' in result && result.error) {
      showFeedback('error', result.error as string);
      throw new Error(result.error as string);
    }
    showFeedback('success', 'Highlight updated');
    setEditHighlight(null);
  };

  const handleDelete = async (highlightId: string) => {
    if (!confirm('Delete this highlight? This cannot be undone.')) return;
    const result = await remove(highlightId);
    if ('error' in result && result.error) {
      showFeedback('error', result.error as string);
    } else {
      showFeedback('success', 'Highlight deleted');
    }
  };

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
          {subLoading ? (
            <div className="h-12 w-40 bg-[#1F1F22] rounded-lg animate-pulse" />
          ) : atLimit ? (
            <Link
              href="/pricing"
              className="flex items-center justify-center gap-2 bg-white/10 text-white font-bold text-sm px-6 py-3 rounded-lg hover:bg-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">lock</span>
              <span>Upgrade to Upload More</span>
            </Link>
          ) : (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 bg-primary text-black font-bold text-sm px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">upload_file</span>
              <span>Upload Film</span>
            </button>
          )}
        </header>

        {/* Upload Zone */}
        {subLoading ? (
          <div className="w-full h-48 bg-[#1F1F22] rounded-xl animate-pulse" />
        ) : atLimit ? (
          <UpgradeCTA
            inline
            icon="movie"
            title={`You\u2019ve reached your ${maxHighlights}-highlight limit`}
            description={tier === 'basic'
              ? 'Upgrade to Premium for up to 5 highlights, or Pro for unlimited uploads.'
              : 'Upgrade to Pro for unlimited highlight uploads.'}
            ctaText={tier === 'basic' ? 'Upgrade to Premium' : 'Upgrade to Pro'}
          />
        ) : (
          <section className="w-full">
            <div
              onClick={() => setShowAddModal(true)}
              className="group relative flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed border-[#333] bg-[#1F1F22]/50 hover:border-primary/50 hover:bg-[#1F1F22]/80 transition-all cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                <div className="bg-[#2A2A2E] p-3 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                </div>
                <p className="mb-1 text-lg font-bold text-white">Upload New Footage</p>
                <p className="mb-2 text-sm text-gray-400">Click to add a new highlight reel</p>
                <p className="text-xs font-mono text-primary/80 uppercase tracking-wider bg-primary/10 px-2 py-1 rounded">
                  MP4, MOV up to 2GB
                </p>
              </div>
            </div>
          </section>
        )}

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
        {(isLoading || subLoading) ? (
          <LoadingSkeleton />
        ) : highlights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="size-48 rounded-2xl bg-[#1F1F22] border border-white/5 shadow-2xl overflow-hidden mb-6 group hover:border-primary/20 transition-all">
              <Image src="/images/marketing/film-room-empty.png" alt="Film Room Illustration" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" fill sizes="192px" />
            </div>
            <h3 className="text-white text-xl font-bold mb-2">No highlights yet</h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Upload your first highlight reel to start showcasing your skills to college recruiters.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 bg-primary text-black font-bold text-sm px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">upload_file</span>
              <span>Upload Your First Highlight</span>
            </button>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {highlights.map((highlight, index) => (
              <HighlightCard
                key={highlight.id}
                highlight={highlight}
                formatDuration={formatDuration}
                formatViews={formatViews}
                isFeatured={index === 0}
                onPlay={(h) => setActiveVideo({ url: h.video_url, title: h.title })}
                onEdit={(h) => setEditHighlight(h)}
                onDelete={handleDelete}
              />
            ))}
          </section>
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

      {/* Add Highlight Modal */}
      <AddHighlightModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
        isSubmitting={isPending}
      />

      {/* Edit Highlight Modal */}
      <AddHighlightModal
        isOpen={!!editHighlight}
        onClose={() => setEditHighlight(null)}
        onSubmit={handleEdit}
        editData={editHighlight ? {
          id: editHighlight.id,
          title: editHighlight.title,
          description: editHighlight.description || undefined,
          video_url: editHighlight.video_url,
        } : null}
        isSubmitting={isPending}
      />
    </div>
  );
}
