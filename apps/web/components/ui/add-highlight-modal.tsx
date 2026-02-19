'use client';

import { useState, useEffect, useCallback } from 'react';

interface AddHighlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string; video_url: string }) => Promise<void>;
  editData?: { id: string; title: string; description?: string; video_url: string } | null;
  isSubmitting?: boolean;
}

export function AddHighlightModal({
  isOpen,
  onClose,
  onSubmit,
  editData,
  isSubmitting = false,
}: AddHighlightModalProps) {
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!editData;

  // Pre-fill fields when editData is provided
  useEffect(() => {
    if (editData) {
      setTitle(editData.title);
      setVideoUrl(editData.video_url);
      setDescription(editData.description || '');
    } else {
      setTitle('');
      setVideoUrl('');
      setDescription('');
    }
    setError(null);
  }, [editData, isOpen]);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    onClose();
  }, [isSubmitting, onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!videoUrl.trim()) {
      setError('Video URL is required');
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        video_url: videoUrl.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
      });
      // Clear form on success
      setTitle('');
      setVideoUrl('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-[#1F1F22] border border-white/10 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'Edit Highlight' : 'Add Highlight'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="highlight-title" className="text-sm font-medium text-slate-400">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              id="highlight-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Junior Season Highlights"
              className="w-full px-3 py-2.5 bg-[#2A2A2E] border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors"
              disabled={isSubmitting}
            />
          </div>

          {/* Video URL */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="highlight-url" className="text-sm font-medium text-slate-400">
              Video URL <span className="text-red-400">*</span>
            </label>
            <input
              id="highlight-url"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... or https://hudl.com/..."
              className="w-full px-3 py-2.5 bg-[#2A2A2E] border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors"
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="highlight-description" className="text-sm font-medium text-slate-400">
              Description
            </label>
            <textarea
              id="highlight-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your highlight reel..."
              rows={3}
              className="w-full px-3 py-2.5 bg-[#2A2A2E] border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-black font-bold text-sm rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && (
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              )}
              {isEditing ? 'Save Changes' : 'Add Highlight'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
