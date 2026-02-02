// Auth & User
export { useUser } from "./use-user";

// Athletes
export { useAthletes, useAthlete } from "./use-athletes";

// Shortlist
export { useShortlist, type PipelineStatus } from "./use-shortlist";

// Messages
export { useMessages } from "./use-messages";

// Conversation Thread
export {
  useConversation,
  type ThreadMessage,
  type ContactInfo,
  type CurrentUser,
} from "./use-conversation";

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

// Onboarding Profile (form-based)
export {
  useOnboardingProfile,
  type ProfileData,
  type AthleteData,
  type CompletionData,
  type OnboardingProfileData,
  type ProfileUpdateData,
} from "./use-onboarding-profile";

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

// MCP Connector Hooks (RepMax data)
export {
  useMcpZones,
  useMcpZone,
  useMcpProspectsByPosition,
  useMcpPrograms,
  useMcpCalendar,
} from "./use-mcp-zones";

// Highlights / Film
export { useHighlights, type Highlight } from "./use-highlights";

// Highlight Detail (for recruiter film viewer)
export { useHighlightDetail } from "./use-highlight-detail";

// Notification Preferences
export {
  useNotificationPreferences,
  type NotificationPreferences,
} from "./use-notification-preferences";

// Campus Visits
export {
  useCampusVisits,
  type CampusVisit,
  type VisitStats,
  type CalendarEvent,
} from "./use-campus-visits";

// Athlete Documents
export {
  useAthleteDocuments,
  type AthleteDocument,
} from "./use-athlete-documents";

// Communication Logs
export {
  useCommunicationLogs,
  type CommunicationLog,
  type StaffMember as CommunicationStaffMember,
} from "./use-communication-logs";

// Recruiting Reports
export {
  useRecruitingReports,
  type FunnelStage,
  type StaffMember,
  type ZoneCoverageData,
  type ReportStats,
} from "./use-recruiting-reports";

// Athlete Dashboard
export {
  useAthleteDashboard,
  type AthleteProfile as AthleteDashboardProfile,
  type DashboardStats,
  type ShortlistCoach,
  type CalendarEvent as DashboardCalendarEvent,
} from "./use-athlete-dashboard";

// Athlete Card Editor
export {
  useAthleteCardEditor,
  type AthleteCardData,
} from "./use-athlete-card-editor";

// Admin Moderation
export {
  useAdminModeration,
  type ModerationItem,
  type ModerationStats,
  type ModerationUser,
} from "./use-admin-moderation";

// Admin Feature Flags
export {
  useFeatureFlags,
  getScopeDisplayText,
  isFlagActive,
  type FeatureFlag,
  type FlagStatus,
  type FlagScope,
  type FeatureFlagsFilter,
} from "./use-feature-flags";

// Zone Assignments
export {
  useZoneAssignments,
  type ZoneAssignment,
  type AvailableRecruiter,
} from "./use-zone-assignments";
