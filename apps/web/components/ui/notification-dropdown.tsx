'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotifications, type Notification } from '@/lib/hooks/use-notifications';

function formatTimeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const NOTIFICATION_ICONS: Record<Notification['type'], string> = {
  profile_view: 'visibility',
  shortlist: 'bookmark_added',
  deadline: 'schedule',
  parent_link: 'family_restroom',
  summary: 'summarize',
  message: 'mail',
  offer: 'school',
};

interface NotificationDropdownProps {
  userId: string;
}

export function NotificationDropdown({ userId }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications({ userId });

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch {
      // Error already logged in hook
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch {
      // Error already logged in hook
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-[#0a0a0a]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-[400px] bg-[#1F1F22] border border-white/10 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <h3 className="text-white text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-primary text-xs font-medium hover:text-primary/80 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="size-8 rounded-full border-3 border-primary border-t-transparent animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <span className="material-symbols-outlined text-white/20 text-3xl mb-2">notifications_none</span>
                <p className="text-slate-400 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0 ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className={`mt-0.5 flex-shrink-0 size-8 rounded-full flex items-center justify-center ${
                    !notification.read ? 'bg-primary/15 text-primary' : 'bg-white/5 text-white/40'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">
                      {NOTIFICATION_ICONS[notification.type] || 'notifications'}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-tight ${!notification.read ? 'text-white font-medium' : 'text-slate-400'}`}>
                      {notification.title}
                    </p>
                    {notification.description && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notification.description}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">{formatTimeAgo(notification.created_at)}</p>
                  </div>

                  {/* Unread indicator */}
                  {!notification.read && (
                    <div className="flex-shrink-0 mt-2">
                      <div className="size-2 bg-primary rounded-full" />
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
