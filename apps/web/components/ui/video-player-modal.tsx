'use client';

import { useEffect, useCallback } from 'react';

interface VideoPlayerModalProps {
  videoUrl: string;
  title?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoPlayerModal({ videoUrl, title, isOpen, onClose }: VideoPlayerModalProps) {
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll while modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-xl overflow-hidden bg-[#141414] border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          {title ? (
            <h3 className="text-white text-sm font-semibold truncate pr-4">{title}</h3>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            aria-label="Close video player"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Video */}
        <div className="w-full aspect-video bg-black">
          <video
            className="w-full h-full"
            src={videoUrl}
            controls
            autoPlay
          >
            <track kind="captions" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}
