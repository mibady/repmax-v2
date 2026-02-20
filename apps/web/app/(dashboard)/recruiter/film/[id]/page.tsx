'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useHighlightDetail } from '@/lib/hooks';
import { useState, useRef, useEffect, useCallback } from 'react';
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

  const { highlight, bookmarks, isLoading, error, formatTimestamp, formatHeight, createBookmark, deleteBookmark, updateBookmark } =
    useHighlightDetail(highlightId);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [isCreatingBookmark, setIsCreatingBookmark] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null);
  const [editBookmarkNotes, setEditBookmarkNotes] = useState('');

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const seekBack = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - 10);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const changeSpeed = useCallback((speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTimeUpdate = () => setCurrentTime(Math.floor(video.currentTime));
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [highlight]);

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
            {/* Real Video Element */}
            {highlight.video_url ? (
              <video
                ref={videoRef}
                src={highlight.video_url}
                poster={highlight.thumbnail_url || undefined}
                className="absolute inset-0 w-full h-full object-contain"
                onClick={togglePlay}
                playsInline
              />
            ) : highlight.thumbnail_url ? (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-90"
                style={{ backgroundImage: `url('${highlight.thumbnail_url}')` }}
              ></div>
            ) : (
              <div className="absolute inset-0 bg-[#1a1a1a] flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-gray-600">movie</span>
              </div>
            )}
            {/* Video Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"></div>

            {/* Centered Play Button — shown when paused */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover/player:scale-105 transition-transform duration-300">
                <button onClick={togglePlay} className="pointer-events-auto flex items-center justify-center size-20 rounded-full bg-primary/90 text-[#0f0f0f] shadow-[0_0_30px_rgba(237,188,29,0.3)] hover:bg-primary transition-all backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[40px] ml-1">play_arrow</span>
                </button>
              </div>
            )}

            {/* Top Controls (Title Overlay) */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start opacity-0 group-hover/player:opacity-100 transition-opacity duration-300">
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg drop-shadow-md">{highlight.title}</span>
                <span className="text-white/70 text-sm font-mono drop-shadow-md">
                  {highlight.view_count} views
                </span>
              </div>
              <div className="relative">
                <button onClick={() => setShowMoreMenu(!showMoreMenu)} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
                {showMoreMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl z-50 py-1">
                    <button onClick={() => { window.open(highlight.video_url, '_blank'); setShowMoreMenu(false); }} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">file_download</span>
                      Download Video
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); setShowMoreMenu(false); }} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">link</span>
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Control Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#0f0f0f]/90 backdrop-blur-md px-6 py-4 translate-y-full group-hover/player:translate-y-0 transition-transform duration-300 ease-out">
              {/* Timeline Scrubber */}
              <div
                className="relative w-full h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer group/timeline"
                onClick={(e) => {
                  const video = videoRef.current;
                  if (!video || !duration) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  video.currentTime = pct * duration;
                }}
              >
                {/* Progress */}
                <div className="absolute top-0 left-0 h-full bg-primary rounded-full" style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}>
                  <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 size-3 bg-white rounded-full scale-0 group-hover/timeline:scale-100 transition-transform shadow-sm"></div>
                </div>
                {/* Bookmark Dots on Timeline */}
                {timelineMarkers.map((marker, idx) => (
                  <div
                    key={idx}
                    className="absolute top-1/2 -translate-y-1/2 size-2 bg-primary rounded-full hover:scale-150 transition-transform cursor-pointer ring-2 ring-black/50"
                    style={{ left: `${marker.position}%` }}
                    title={marker.title}
                    onClick={(e) => {
                      e.stopPropagation();
                      const video = videoRef.current;
                      if (video && duration) video.currentTime = (marker.position / 100) * duration;
                    }}
                  ></div>
                ))}
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <button onClick={togglePlay} className="hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[28px]">{isPlaying ? 'pause' : 'play_arrow'}</span>
                  </button>
                  <button onClick={seekBack} className="hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[24px]">replay_10</span>
                  </button>
                  <div className="flex items-center gap-2 group/volume">
                    <button onClick={toggleMute} className="hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[24px]">{isMuted ? 'volume_off' : 'volume_up'}</span>
                    </button>
                  </div>
                  <span className="font-mono text-sm tracking-wide text-white/90">
                    <span className="text-primary font-medium">{formatTimestamp(currentTime)}</span>{' '}
                    <span className="text-white/40">/</span> {formatTimestamp(duration)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <button onClick={() => setShowSpeedMenu(!showSpeedMenu)} className="hover:text-primary transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-[24px]">settings</span>
                      {playbackSpeed !== 1 && <span className="text-xs font-mono text-primary">{playbackSpeed}x</span>}
                    </button>
                    {showSpeedMenu && (
                      <div className="absolute bottom-full right-0 mb-2 w-32 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl z-50 py-1">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                          <button key={speed} onClick={() => changeSpeed(speed)} className={`w-full px-4 py-1.5 text-left text-sm hover:bg-white/5 ${playbackSpeed === speed ? 'text-primary font-bold' : 'text-white'}`}>
                            {speed}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={toggleFullscreen} className="hover:text-primary transition-colors">
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
              <button onClick={() => window.open(highlight.video_url, "_blank")} title="Download video" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#333] hover:bg-[#444] text-white text-sm font-medium transition-colors border border-transparent hover:border-white/10">
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
              <button onClick={() => {
                const url = `${window.location.href}${window.location.href.includes('?') ? '&' : '?'}t=${currentTime}`;
                navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }} className="flex md:flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#1A1A1A] text-left md:text-center min-w-max transition-colors group">
                <div className="size-10 rounded-full bg-[#1A1A1A] group-hover:bg-[#333] flex items-center justify-center text-white transition-colors border border-[#333]">
                  <span className="material-symbols-outlined text-[20px]">share</span>
                </div>
                <div className="flex flex-col md:items-center">
                  <span className="text-sm font-medium text-white">{copied ? 'Copied!' : 'Share'}</span>
                  <span className="text-xs text-gray-500">at {formatTimestamp(currentTime)}</span>
                </div>
              </button>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex md:flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#1A1A1A] text-left md:text-center min-w-max transition-colors group">
                <div className="size-10 rounded-full bg-[#1A1A1A] group-hover:bg-[#333] flex items-center justify-center text-white transition-colors border border-[#333]">
                  <span className="material-symbols-outlined text-[20px]">link</span>
                </div>
                <div className="flex flex-col md:items-center">
                  <span className="text-sm font-medium text-white">{copied ? "Copied!" : "Copy Link"}</span>
                  <span className="text-xs text-gray-500">to clipboard</span>
                </div>
              </button>
              <button onClick={() => {
                window.open(`mailto:support@repmax.io?subject=Video Report: ${encodeURIComponent(highlight.title)}&body=${encodeURIComponent(`I'd like to report an issue with video: ${window.location.href}`)}`);
              }} className="flex md:flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#1A1A1A] text-left md:text-center min-w-max transition-colors group">
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
                        <button onClick={() => {
                          setEditingBookmarkId(bookmark.id);
                          setEditBookmarkNotes(bookmark.notes || bookmark.label || '');
                        }} className="text-gray-400 hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={async () => {
                          if (confirm('Delete this bookmark?')) {
                            try { await deleteBookmark(bookmark.id); } catch (err) { console.error('Failed to delete bookmark:', err); }
                          }
                        }} className="text-gray-400 hover:text-red-400 transition-colors">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                      {editingBookmarkId === bookmark.id && (
                        <div className="absolute inset-0 bg-[#1a1a1a]/95 rounded-lg flex items-center p-4 z-10">
                          <form onSubmit={async (e) => {
                            e.preventDefault();
                            try { await updateBookmark(bookmark.id, { notes: editBookmarkNotes }); setEditingBookmarkId(null); } catch (err) { console.error('Failed to update bookmark:', err); }
                          }} className="flex items-center gap-2 w-full">
                            <input
                              type="text"
                              value={editBookmarkNotes}
                              onChange={(e) => setEditBookmarkNotes(e.target.value)}
                              className="flex-1 px-3 py-2 bg-[#0f0f0f] border border-[#333] rounded-lg text-white text-sm focus:border-primary focus:outline-none"
                              autoFocus
                            />
                            <button type="submit" className="px-3 py-2 bg-primary text-[#0f0f0f] rounded-lg text-sm font-medium hover:bg-[#dcae18]">Save</button>
                            <button type="button" onClick={() => setEditingBookmarkId(null)} className="px-3 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
                          </form>
                        </div>
                      )}
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
