// Auth & User
export { useUser } from "./use-user";

// Athletes
export { useAthletes, useAthlete } from "./use-athletes";

// Shortlist
export { useShortlist } from "./use-shortlist";

// Messages
export { useMessages } from "./use-messages";

// Notifications (Realtime)
export { useNotifications, type Notification } from "./use-notifications";

// Realtime Messages
export {
  useRealtimeMessages,
  useConversations,
  type Message,
  type Conversation,
} from "./use-realtime-messages";

// Subscriptions
export { useSubscription, useSubscriptionPlans } from "./use-subscription";

// Recruiting Intelligence (Legacy)
export {
  useZones,
  useZone,
  useRecruitingCalendar,
  useClassRankings as useClassRankingsLegacy,
  type ZoneData,
  type CalendarData,
  type ClassRanking as ClassRankingLegacy,
} from "./use-recruiting";

// Sprint 2B: Profile Analytics
export {
  useProfileViews,
  useGeographicViews,
  type ProfileViewSummary,
  type ProfileView,
} from "./use-profile-views";

// Sprint 2B: Zone Activity (Enhanced)
export {
  useZoneActivity,
  useZoneDetail,
  type ZoneActivity,
  type ZoneDetail,
  type RecruitingZone,
  type ActivityLevel,
} from "./use-zone-activity";

// Sprint 2B: Film Bookmarks
export {
  useFilmBookmarks,
  useCreateFilmBookmark,
  type FilmBookmark,
} from "./use-film-bookmarks";

// Sprint 2B: Onboarding
export {
  useOnboarding,
  type OnboardingProgress,
} from "./use-onboarding";

// Sprint 2B: Class & Program Rankings (Enhanced)
export {
  useClassRankings,
  useProgramRankings,
  type ClassRanking,
  type ProgramRanking,
} from "./use-class-rankings";

// Sprint 2B: Recruiting Events
export {
  useRecruitingEvents,
  type RecruitingEvent,
  type EventType,
} from "./use-recruiting-events";
