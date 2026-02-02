'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useHighlightDetail } from '@/lib/hooks';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { notes: string; label?: string }) => void;
  timestamp: string;
}

function AddBookmarkModal({ isOpen, onClose, onSubmit, timestamp }: AddBookmarkModalProps) {
  const [notes, setNotes] = useState('');
  const [label, setLabel] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ notes, label: label || undefined });
    setNotes('');
    setLabel('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] rounded-xl border border-[#333] w-full max-w-md p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-4">Add Bookmark at {timestamp}</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Label (optional)</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Great throw"
              className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#333] rounded-lg text-white placeholder:text-gray-500 focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your observations..."
              rows={3}
              className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#333] rounded-lg text-white placeholder:text-gray-500 focus:border-primary focus:outline-none resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-[#0f0f0f] font-medium rounded-lg hover:bg-[#dcae18] transition-colors"
            >
              Add Bookmark
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RecruiterFilmPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const highlightId = params.id as string;

  const { highlight, bookmarks, isLoading, error, formatTimestamp, formatHeight, createBookmark } =
    useHighlightDetail(highlightId);

  const [currentTime, _setCurrentTime] = useState(0); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [isCreatingBookmark, setIsCreatingBookmark] = useState(false);

  const handleAddBookmark = async (data: { notes: string; label?: string }) => {
    setIsCreatingBookmark(true);
    try {
      await createBookmark({
        timestamp_seconds: currentTime,
        notes: data.notes,
        label: data.label,
      });
    } catch (err) {
      console.error('Failed to create bookmark:', err);
    } finally {
      setIsCreatingBookmark(false);
    }
  };

  // Calculate timeline markers from bookmarks
  const timelineMarkers = bookmarks.map((b) => ({
    position: highlight?.duration_seconds
      ? (b.timestamp_seconds / highlight.duration_seconds) * 100
      : 0,
    title: b.notes || b.label || 'Bookmark',
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !highlight) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Highlight not found</h2>
          <p className="text-gray-500 mb-6">
            {error?.message || 'The highlight you are looking for could not be found.'}
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-[#0f0f0f] font-medium rounded-lg hover:bg-[#dcae18] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const athlete = highlight.athlete;
  const duration = highlight.duration_seconds || 0;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Main Layout */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[960px] mx-auto flex flex-col gap-6">
          {/* Video Player Component */}
          <div className="group/player relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            {/* Video/Thumbnail */}
            {highlight.thumbnail_url ? (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-90 transition-opacity duration-300"
                style={{ backgroundImage: `url('${highlight.thumbnail_url}')` }}
              ></div>
            ) : (
              <div className="absolute inset-0 bg-[#1a1a1a] flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-gray-600">movie</span>
              </div>
            )}
            {/* Video Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"></div>

            {/* Centered Play Button */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover/player:scale-105 transition-transform duration-300">
              <button className="pointer-events-auto flex items-center justify-center size-20 rounded-full bg-primary/90 hover:bg-primary text-[#0f0f0f] shadow-[0_0_30px_rgba(237,188,29,0.3)] transition-all backdrop-blur-sm">
                <span className="material-symbols-outlined text-[40px] ml-1">play_arrow</span>
              </button>
            </div>

            {/* Top Controls (Title Overlay) */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start opacity-0 group-hover/player:opacity-100 transition-opacity duration-300">
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg drop-shadow-md">{highlight.title}</span>
                <span className="text-white/70 text-sm font-mono drop-shadow-md">
                  {highlight.view_count} views
                </span>
              </div>
              <button className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>

            {/* Bottom Control Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#0f0f0f]/90 backdrop-blur-md px-6 py-4 translate-y-full group-hover/player:translate-y-0 transition-transform duration-300 ease-out">
              {/* Timeline Scrubber */}
              <div className="relative w-full h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer group/timeline">
                {/* Progress */}
                <div className="absolute top-0 left-0 h-full w-[25%] bg-primary rounded-full relative">
                  <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 size-3 bg-white rounded-full scale-0 group-hover/timeline:scale-100 transition-transform shadow-sm"></div>
                </div>
                {/* Bookmark Dots on Timeline */}
                {timelineMarkers.map((marker, idx) => (
                  <div
                    key={idx}
                    className="absolute top-1/2 -translate-y-1/2 size-2 bg-primary rounded-full hover:scale-150 transition-transform cursor-pointer ring-2 ring-black/50"
                    style={{ left: `${marker.position}%` }}
                    title={marker.title}
                  ></div>
                ))}
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <button className="hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[28px]">pause</span>
                  </button>
                  <button className="hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[24px]">replay_10</span>
                  </button>
                  <div className="flex items-center gap-2 group/volume">
                    <button className="hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[24px]">volume_up</span>
                    </button>
                  </div>
                  <span className="font-mono text-sm tracking-wide text-white/90">
                    <span className="text-primary font-medium">{formatTimestamp(currentTime)}</span>{' '}
                    <span className="text-white/40">/</span> {formatTimestamp(duration)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <button className="hover:text-primary transition-colors" title="Settings">
                    <span className="material-symbols-outlined text-[24px]">settings</span>
                  </button>
                  <button className="hover:text-primary transition-colors" title="Fullscreen">
                    <span className="material-symbols-outlined text-[24px]">fullscreen</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Video Info & Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#333]">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {highlight.title}
                {athlete?.position && ` - ${athlete.position}`}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-[#999] text-sm">
                {athlete && (
                  <>
                    <span className="text-primary font-medium">{athlete.name}</span>
                    <span>-</span>
                    <span>Class of {athlete.classYear}</span>
                    <span>-</span>
                    <span>{athlete.school}</span>
                    <span>-</span>
                    <span className="bg-[#333] text-xs px-1.5 py-0.5 rounded text-white/80">
                      {formatHeight(athlete.heightInches)}
                    </span>
                    {athlete.weightLbs && (
                      <span className="bg-[#333] text-xs px-1.5 py-0.5 rounded text-white/80">
                        {athlete.weightLbs} lbs
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            {/* Primary Action Buttons */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#333] hover:bg-[#444] text-white text-sm font-medium transition-colors border border-transparent hover:border-white/10">
                <span className="material-symbols-outlined text-[20px]">file_download</span>
                Download
              </button>
              {athlete && (
                <Link
                  href={`/dashboard/messages?compose=${athlete.id}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-[#dcae18] text-[#0f0f0f] text-sm font-bold transition-colors shadow-[0_0_15px_rgba(237,188,29,0.2)]"
                >
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                  Contact Athlete
                </Link>
              )}
            </div>
          </div>

          {/* Secondary Actions & Bookmarks Layout */}
          <div className="grid md:grid-cols-[200px_1fr] gap-8">
            {/* Quick Actions Toolbar (Left) */}
            <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible py-2 md:py-0">
              <button className="flex md:flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#1A1A1A] text-left md:text-center min-w-max transition-colors group">
                <div className="size-10 rounded-full bg-[#1A1A1A] group-hover:bg-[#333] flex items-center justify-center text-white transition-colors border border-[#333]">
                  <span className="material-symbols-outlined text-[20px]">share</span>
                </div>
                <div className="flex flex-col md:items-center">
                  <span className="text-sm font-medium text-white">Share</span>
                  <span className="text-xs text-gray-500">at {formatTimestamp(currentTime)}</span>
                </div>
              </button>
              <button className="flex md:flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#1A1A1A] text-left md:text-center min-w-max transition-colors group">
                <div className="size-10 rounded-full bg-[#1A1A1A] group-hover:bg-[#333] flex items-center justify-center text-white transition-colors border border-[#333]">
                  <span className="material-symbols-outlined text-[20px]">link</span>
                </div>
                <div className="flex flex-col md:items-center">
                  <span className="text-sm font-medium text-white">Copy Link</span>
                  <span className="text-xs text-gray-500">to clipboard</span>
                </div>
              </button>
              <button className="flex md:flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#1A1A1A] text-left md:text-center min-w-max transition-colors group">
                <div className="size-10 rounded-full bg-[#1A1A1A] group-hover:bg-[#333] flex items-center justify-center text-white transition-colors border border-[#333]">
                  <span className="material-symbols-outlined text-[20px]">flag</span>
                </div>
                <div className="flex flex-col md:items-center">
                  <span className="text-sm font-medium text-white">Report</span>
                  <span className="text-xs text-gray-500">Video issue</span>
                </div>
              </button>
            </div>

            {/* Bookmarks Column (Right) */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">bookmark</span>
                  Recruiter Bookmarks
                </h3>
                <button
                  onClick={() => setShowAddBookmark(true)}
                  disabled={isCreatingBookmark}
                  className="text-primary hover:text-[#ffe066] text-sm font-bold flex items-center gap-1 hover:underline underline-offset-4 decoration-primary/50 transition-all disabled:opacity-50"
                >
                  {isCreatingBookmark ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  )}
                  Add Bookmark
                </button>
              </div>

              {bookmarks.length === 0 ? (
                <div className="p-8 text-center bg-[#1a1a1a] rounded-lg border border-[#333]">
                  <span className="material-symbols-outlined text-4xl text-gray-600 mb-2">bookmark_border</span>
                  <p className="text-gray-500">No bookmarks yet. Add one to track key moments.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {bookmarks.map((bookmark, index) => (
                    <div
                      key={bookmark.id}
                      className={`group relative p-4 rounded-lg bg-surface-dark border transition-all duration-200 cursor-pointer ${
                        index === 0
                          ? 'border-primary/40 hover:border-primary shadow-lg shadow-black/20'
                          : 'border-[#333] hover:border-primary'
                      }`}
                    >
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button className="text-gray-400 hover:text-white">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button className="text-gray-400 hover:text-red-400">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-16 pt-1">
                          <span
                            className={`inline-flex items-center justify-center px-2 py-1 rounded font-mono text-sm font-medium border transition-colors ${
                              index === 0
                                ? 'bg-primary/10 text-primary border-primary/20 group-hover:bg-primary group-hover:text-black'
                                : 'bg-[#2a2a2a] text-gray-400 border-[#333] group-hover:text-black group-hover:bg-primary group-hover:border-primary'
                            }`}
                          >
                            {formatTimestamp(bookmark.timestamp_seconds)}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p
                            className={`text-sm font-medium leading-relaxed transition-colors ${
                              index === 0 ? 'text-white group-hover:text-primary' : 'text-gray-300 group-hover:text-white'
                            }`}
                          >
                            {bookmark.notes || bookmark.label || 'Bookmark'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="size-5 rounded-full bg-gray-600"></div>
                            <span className="text-xs text-gray-500">
                              Added {new Date(bookmark.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {bookmark.tags && bookmark.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {bookmark.tags.map((tag, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-[#2a2a2a] text-xs text-gray-400 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Bookmark Modal */}
      <AddBookmarkModal
        isOpen={showAddBookmark}
        onClose={() => setShowAddBookmark(false)}
        onSubmit={handleAddBookmark}
        timestamp={formatTimestamp(currentTime)}
      />
    </div>
  );
}
