'use client';

import { MessageSquare } from 'lucide-react';

type BadgeSize = 'sm' | 'md' | 'lg';
type BadgeVariant = 'default' | 'dot' | 'icon';

interface MessageBadgeProps {
  count: number;
  size?: BadgeSize;
  variant?: BadgeVariant;
  maxCount?: number;
  showZero?: boolean;
  className?: string;
  onClick?: () => void;
}

const SIZE_CLASSES: Record<BadgeSize, { badge: string; icon: string; dot: string }> = {
  sm: {
    badge: 'min-w-[16px] h-4 text-[10px] px-1',
    icon: 'w-4 h-4',
    dot: 'w-2 h-2',
  },
  md: {
    badge: 'min-w-[20px] h-5 text-xs px-1.5',
    icon: 'w-5 h-5',
    dot: 'w-2.5 h-2.5',
  },
  lg: {
    badge: 'min-w-[24px] h-6 text-sm px-2',
    icon: 'w-6 h-6',
    dot: 'w-3 h-3',
  },
};

export function MessageBadge({
  count,
  size = 'md',
  variant = 'default',
  maxCount = 99,
  showZero = false,
  className = '',
  onClick,
}: MessageBadgeProps) {
  const sizeClasses = SIZE_CLASSES[size];
  const displayCount = count > maxCount ? `${maxCount}+` : count;
  const shouldShow = count > 0 || showZero;

  if (variant === 'dot') {
    return (
      <span
        className={`inline-block rounded-full bg-[#d4af35] ${sizeClasses.dot} ${
          shouldShow ? 'opacity-100' : 'opacity-0'
        } transition-opacity ${className}`}
      />
    );
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={onClick}
        className={`relative p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors ${className}`}
      >
        <MessageSquare className={`${sizeClasses.icon} text-gray-400`} />
        {shouldShow && (
          <span
            className={`absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full bg-[#d4af35] text-[#201d12] font-bold ${sizeClasses.badge}`}
          >
            {displayCount}
          </span>
        )}
      </button>
    );
  }

  // Default badge
  if (!shouldShow) return null;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-[#d4af35] text-[#201d12] font-bold ${sizeClasses.badge} ${className}`}
    >
      {displayCount}
    </span>
  );
}

/**
 * Message badge for navigation items (sidebar, tab bar)
 */
interface NavMessageBadgeProps {
  count: number;
  label?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function NavMessageBadge({
  count,
  label = 'Messages',
  isActive = false,
  onClick,
}: NavMessageBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors ${
        isActive
          ? 'bg-[#d4af35]/10 text-[#d4af35]'
          : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
      }`}
    >
      <div className="relative">
        <MessageSquare className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 flex items-center justify-center rounded-full bg-[#d4af35] text-[#201d12] text-[9px] font-bold px-1">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </div>
      <span className="font-medium text-sm">{label}</span>
      {count > 0 && (
        <span className="ml-auto text-xs text-gray-500">{count} unread</span>
      )}
    </button>
  );
}

/**
 * Mobile tab bar message badge
 */
interface TabBarMessageBadgeProps {
  count: number;
  label?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function TabBarMessageBadge({
  count,
  label = 'Messages',
  isActive = false,
  onClick,
}: TabBarMessageBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
        isActive ? 'text-[#d4af35]' : 'text-gray-500'
      }`}
    >
      <div className="relative">
        <MessageSquare className="w-6 h-6" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-[#d4af35] text-[#201d12] text-[10px] font-bold px-1">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

export default MessageBadge;
