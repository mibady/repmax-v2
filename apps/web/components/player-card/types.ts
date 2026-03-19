export interface PlayerCardMetrics {
  height: string;
  weight: number | null;
  fortyYard: number | null;
  tenYardSplit: number | null;
  fiveTenFive: number | null;
  broadJump: number | null;
  vertical: number | null;
  wingspan: number | null;
  bench: number | null;
  squat: number | null;
}

export interface PlayerCardAcademics {
  gpa: number | null;
  weightedGpa: number | null;
  sat: number | null;
  act: number | null;
}

export interface PlayerCardDocument {
  id: string;
  fileUrl: string;
}

export interface PlayerCardHighlight {
  thumbnail: string;
  title: string;
  videoUrl: string | null;
}

export interface PlayerCardData {
  id: string;
  name: string;
  school: string | null;
  city: string | null;
  state: string | null;
  zone: string | null;
  classYear: number | null;
  primaryPosition: string | null;
  secondaryPosition: string | null;
  starRating: number;
  verified: boolean;
  avatarUrl: string | null;
  bio: string | null;
  coachNotes: string | null;
  playerSummary: string | null;
  ncaaId: string | null;
  repmaxId: string | null;
  offersCount: number;
  metrics: PlayerCardMetrics;
  academics: PlayerCardAcademics;
  documents: {
    transcripts: PlayerCardDocument[];
    recommendations: PlayerCardDocument[];
  };
  highlight: PlayerCardHighlight | null;

  // Extended fields for redesigned card
  jerseyNumber?: string | null;
  hudlLink?: string | null;
  youtubeLink?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  academicInterest?: string | null;
  collegePriority?: string | null;
  awards?: string | null;
  otherSports?: string | null;
  campsAttended?: string | null;
  dreamSchools?: string | null;
  coachPhone?: string | null;
  coachEmail?: string | null;
  coachName?: string | null;
  parent1Name?: string | null;
  parent1Phone?: string | null;
  parent1Email?: string | null;
  parent2Name?: string | null;
  parent2Phone?: string | null;
  parent2Email?: string | null;
  cleatSize?: string | null;
  shirtSize?: string | null;
  pantsSize?: string | null;
  helmetSize?: string | null;
  gloveSize?: string | null;
  coreGpa?: number | null;
}

export interface PlayerCardContentProps {
  data: PlayerCardData;
  actions?: React.ReactNode;
  variant?: 'standalone' | 'embedded' | 'mini';
}
