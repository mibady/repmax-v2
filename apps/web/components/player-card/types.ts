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
}

export interface PlayerCardContentProps {
  data: PlayerCardData;
  actions?: React.ReactNode;
  variant?: 'standalone' | 'embedded';
}
