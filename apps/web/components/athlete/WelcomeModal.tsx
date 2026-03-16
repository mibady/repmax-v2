'use client';

import { useEffect, useCallback } from 'react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  firstName: string;
}

const features = [
  { icon: 'id_card', label: 'Player Card', desc: 'Build your digital profile for coaches' },
  { icon: 'videocam', label: 'Film', desc: 'Upload highlights to showcase your talent' },
  { icon: 'analytics', label: 'Analytics', desc: "Track who's viewing your profile" },
  { icon: 'calendar_month', label: 'Calendar', desc: 'Stay on top of recruiting periods' },
];

export function WelcomeModal({ isOpen, onClose, firstName }: WelcomeModalProps) {
  const handleClose = useCallback(() => {
    localStorage.setItem('repmax_welcome_seen', 'true');
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-md mx-4 bg-[#1F1F22] border border-white/10 rounded-xl shadow-2xl p-8 text-center">
        <div className="size-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-primary text-[28px]">emoji_events</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">
          Welcome to RepMax, {firstName}!
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          Your recruiting command center is ready.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {features.map((f) => (
            <div
              key={f.label}
              className="bg-white/5 rounded-lg p-4 text-left border border-white/5"
            >
              <span className="material-symbols-outlined text-primary text-[22px] mb-2 block">
                {f.icon}
              </span>
              <div className="text-sm font-semibold text-white mb-0.5">{f.label}</div>
              <div className="text-xs text-gray-400">{f.desc}</div>
            </div>
          ))}
        </div>

        <button
          onClick={handleClose}
          className="w-full bg-primary text-black font-bold py-3 rounded-lg text-sm hover:bg-primary/90 transition-colors"
        >
          Let&apos;s Get Started
        </button>
      </div>
    </div>
  );
}
