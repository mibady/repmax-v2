'use client';

import { useState } from 'react';
import { Bell, Star, User, Calendar, Users, BarChart3, Check, Eye, Settings, ChevronRight } from 'lucide-react';

export interface Notification {
  id: string;
  notification_type: 'profile_view' | 'shortlist' | 'deadline' | 'parent_link' | 'summary' | 'message' | 'offer';
  title: string;
  message?: string;
  timestamp: string;
  read: boolean;
  data?: {
    schoolName?: string;
    schoolLogo?: string;
  };
}

interface NotificationCenterProps {
  notifications?: Notification[];
  onMarkAllRead?: () => void;
  onNotificationClick?: (notification: Notification) => void;
  onViewAll?: () => void;
  onOpenSettings?: () => void;
  isLoading?: boolean;
}

const NOTIFICATION_ICONS: Record<Notification['notification_type'], React.ElementType> = {
  profile_view: Star,
  shortlist: User,
  deadline: Calendar,
  parent_link: Users,
  summary: BarChart3,
  message: Bell,
  offer: Star,
};

export function NotificationCenter({
  notifications = [],
  onMarkAllRead,
  onNotificationClick,
  onViewAll,
  onOpenSettings,
  isLoading = false,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      {/* Notification Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-[#2a2a2d] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#d4af35] text-[#201d12] text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-[380px] bg-[#1F1F22] rounded-xl shadow-2xl border border-[#2a2a2d] z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2d]">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-[#d4af35] text-[#201d12] text-xs font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onMarkAllRead}
                  className="p-1.5 rounded-lg hover:bg-[#2a2a2d] transition-colors text-gray-400 hover:text-white"
                  title="Mark all as read"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  className="p-1.5 rounded-lg hover:bg-[#2a2a2d] transition-colors text-gray-400 hover:text-white"
                  title="Visibility settings"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-[#d4af35] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-gray-500 text-sm mt-2">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-[#2a2a2d]">
                  {notifications.map((notification) => {
                    const Icon = NOTIFICATION_ICONS[notification.notification_type] || Bell;
                    return (
                      <button
                        key={notification.id}
                        onClick={() => onNotificationClick?.(notification)}
                        className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-[#2a2a2d] transition-colors text-left ${
                          !notification.read ? 'bg-[#2a2a2d]/50' : ''
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            !notification.read
                              ? 'bg-[#d4af35]/20 text-[#d4af35]'
                              : 'bg-[#2a2a2d] text-gray-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm ${
                              !notification.read ? 'text-white font-medium' : 'text-gray-300'
                            }`}
                          >
                            {notification.title}
                          </p>
                          {notification.message && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              {notification.message}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-[#d4af35] mt-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#2a2a2d] bg-[#1a1a1d]">
              <button
                onClick={onViewAll}
                className="flex items-center gap-1 text-sm text-[#d4af35] hover:text-[#e5c246] transition-colors"
              >
                View all notifications
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenSettings}
                className="p-1.5 rounded-lg hover:bg-[#2a2a2d] transition-colors text-gray-400 hover:text-white"
                title="Notification settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3a3a3d;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4a4a4d;
        }
      ` }} />
    </div>
  );
}

export default NotificationCenter;
