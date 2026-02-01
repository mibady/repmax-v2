"use client";

export type EmptyStateType =
  | "no-athletes"
  | "no-offers"
  | "no-messages"
  | "no-shortlists"
  | "no-highlights"
  | "no-results";

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const emptyStateConfig: Record<
  EmptyStateType,
  { icon: string; defaultTitle: string; defaultDescription: string; defaultAction?: string }
> = {
  "no-athletes": {
    icon: "group_off",
    defaultTitle: "No Athletes Found",
    defaultDescription: "Try adjusting your filters or search criteria to find more athletes.",
    defaultAction: "Clear Filters",
  },
  "no-offers": {
    icon: "mail_off",
    defaultTitle: "No Offers Yet",
    defaultDescription: "Offers from college programs will appear here when you receive them.",
  },
  "no-messages": {
    icon: "chat_bubble_outline",
    defaultTitle: "No Messages",
    defaultDescription: "Your conversations with coaches and recruiters will appear here.",
    defaultAction: "Start a Conversation",
  },
  "no-shortlists": {
    icon: "bookmark_border",
    defaultTitle: "No Shortlists",
    defaultDescription: "Create shortlists to organize and track athletes you're interested in.",
    defaultAction: "Create Shortlist",
  },
  "no-highlights": {
    icon: "videocam_off",
    defaultTitle: "No Highlights Uploaded",
    defaultDescription: "Upload your game highlights to showcase your skills to college programs.",
    defaultAction: "Upload Highlights",
  },
  "no-results": {
    icon: "search_off",
    defaultTitle: "No Results Found",
    defaultDescription: "We couldn't find anything matching your search. Try different keywords.",
    defaultAction: "Clear Search",
  },
};

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const config = emptyStateConfig[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icon Circle */}
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
        <span className="material-symbols-rounded text-4xl text-text-grey">
          {config.icon}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-2 text-center">
        {title || config.defaultTitle}
      </h3>

      {/* Description */}
      <p className="text-sm text-text-grey text-center max-w-md mb-6">
        {description || config.defaultDescription}
      </p>

      {/* Action Button */}
      {(actionLabel || config.defaultAction) && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 rounded-lg bg-primary hover:bg-primary-hover text-black font-bold transition-colors"
        >
          {actionLabel || config.defaultAction}
        </button>
      )}
    </div>
  );
}

// Specialized empty states for specific contexts
export function NoAthletesEmpty({ onClearFilters }: { onClearFilters?: () => void }) {
  return <EmptyState type="no-athletes" onAction={onClearFilters} />;
}

export function NoOffersEmpty() {
  return (
    <EmptyState
      type="no-offers"
      description="Keep building your profile and uploading highlights. Coaches are always watching!"
    />
  );
}

export function NoMessagesEmpty({ onStartConversation }: { onStartConversation?: () => void }) {
  return <EmptyState type="no-messages" onAction={onStartConversation} />;
}

export function NoShortlistsEmpty({ onCreateShortlist }: { onCreateShortlist?: () => void }) {
  return <EmptyState type="no-shortlists" onAction={onCreateShortlist} />;
}

export function NoHighlightsEmpty({ onUpload }: { onUpload?: () => void }) {
  return <EmptyState type="no-highlights" onAction={onUpload} />;
}

export function NoResultsEmpty({ onClearSearch }: { onClearSearch?: () => void }) {
  return <EmptyState type="no-results" onAction={onClearSearch} />;
}
