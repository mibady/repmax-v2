import type { AthleteCardData } from '@/lib/hooks/use-athlete-card-editor';

type FieldConfig = {
  field: keyof AthleteCardData;
  label: string;
  icon: string;
  tier: 1 | 2 | 3;
  section: string;
};

// Tier 1 (weight 3): Critical for recruiting — coaches look at these first
// Tier 2 (weight 2): High value — significantly improves card quality
// Tier 3 (weight 1): Good to have — shows completeness and effort
const FIELD_CONFIG: FieldConfig[] = [
  // Tier 1 — Critical
  { field: 'name', label: 'Full Name', icon: 'person', tier: 1, section: 'Basic Information' },
  { field: 'avatarUrl', label: 'Profile Photo', icon: 'photo_camera', tier: 1, section: 'Basic Information' },
  { field: 'position', label: 'Position', icon: 'sports_football', tier: 1, section: 'Basic Information' },
  { field: 'classYear', label: 'Class Year', icon: 'school', tier: 1, section: 'Basic Information' },
  { field: 'highSchool', label: 'High School', icon: 'location_city', tier: 1, section: 'Basic Information' },
  { field: 'city', label: 'City', icon: 'location_on', tier: 1, section: 'Basic Information' },
  { field: 'state', label: 'State', icon: 'map', tier: 1, section: 'Basic Information' },
  { field: 'height', label: 'Height', icon: 'straighten', tier: 1, section: 'Measurables' },
  { field: 'weight', label: 'Weight', icon: 'fitness_center', tier: 1, section: 'Measurables' },
  { field: 'gpa', label: 'GPA', icon: 'grade', tier: 1, section: 'Academics' },

  // Tier 2 — High Value
  { field: 'fortyYard', label: '40-Yard Dash', icon: 'speed', tier: 2, section: 'Measurables' },
  { field: 'vertical', label: 'Vertical Jump', icon: 'arrow_upward', tier: 2, section: 'Measurables' },
  { field: 'bio', label: 'Player Bio', icon: 'description', tier: 2, section: 'Basic Information' },
  { field: 'sat', label: 'SAT Score', icon: 'quiz', tier: 2, section: 'Academics' },
  { field: 'act', label: 'ACT Score', icon: 'quiz', tier: 2, section: 'Academics' },
  { field: 'hudlLink', label: 'Hudl Profile', icon: 'videocam', tier: 2, section: 'Film' },
  { field: 'youtubeLink', label: 'YouTube Highlight', icon: 'smart_display', tier: 2, section: 'Film' },
  { field: 'ncaaEcId', label: 'NCAA ID', icon: 'verified', tier: 2, section: 'Academics' },
  { field: 'coachPhone', label: 'HS Coach Phone', icon: 'call', tier: 2, section: 'Contact' },

  // Tier 3 — Good to Have
  { field: 'benchPress', label: 'Bench Press', icon: 'fitness_center', tier: 3, section: 'Measurables' },
  { field: 'squat', label: 'Squat', icon: 'fitness_center', tier: 3, section: 'Measurables' },
  { field: 'wingspan', label: 'Wingspan', icon: 'straighten', tier: 3, section: 'Measurables' },
  { field: 'broadJump', label: 'Broad Jump', icon: 'arrow_forward', tier: 3, section: 'Measurables' },
  { field: 'tenYardSplit', label: '10-Yard Split', icon: 'speed', tier: 3, section: 'Measurables' },
  { field: 'fiveTenFive', label: '5-10-5 Shuttle', icon: 'speed', tier: 3, section: 'Measurables' },
  { field: 'weightedGpa', label: 'Weighted GPA', icon: 'grade', tier: 3, section: 'Academics' },
  { field: 'coachEmail', label: 'HS Coach Email', icon: 'mail', tier: 3, section: 'Contact' },
  { field: 'phone', label: 'Phone Number', icon: 'phone', tier: 3, section: 'Contact' },
  { field: 'twitter', label: 'Twitter/X', icon: 'share', tier: 3, section: 'Contact' },
  { field: 'instagram', label: 'Instagram', icon: 'share', tier: 3, section: 'Contact' },
  { field: 'parent1Name', label: 'Parent/Guardian', icon: 'family_restroom', tier: 3, section: 'Contact' },
  { field: 'secondaryPosition', label: 'Secondary Position', icon: 'sports_football', tier: 3, section: 'Basic Information' },
  { field: 'jerseyNumber', label: 'Jersey Number', icon: 'tag', tier: 3, section: 'Basic Information' },
];

const TIER_WEIGHTS: Record<number, number> = { 1: 3, 2: 2, 3: 1 };

function isFilled(data: AthleteCardData, field: keyof AthleteCardData): boolean {
  const val = data[field];
  if (val === null || val === undefined) return false;
  if (typeof val === 'number') return val > 0;
  if (typeof val === 'string') return val.trim().length > 0;
  return false;
}

export interface ProfileCompletionResult {
  percentage: number;
  filledCount: number;
  totalCount: number;
  missingFields: {
    field: keyof AthleteCardData;
    label: string;
    icon: string;
    tier: 1 | 2 | 3;
    section: string;
  }[];
  topActions: ProfileCompletionResult['missingFields'];
}

export function calculateProfileCompletion(data: AthleteCardData): ProfileCompletionResult {
  let totalWeight = 0;
  let filledWeight = 0;
  let filledCount = 0;
  const missing: ProfileCompletionResult['missingFields'] = [];

  for (const config of FIELD_CONFIG) {
    const weight = TIER_WEIGHTS[config.tier];
    totalWeight += weight;

    if (isFilled(data, config.field)) {
      filledWeight += weight;
      filledCount++;
    } else {
      missing.push({
        field: config.field,
        label: config.label,
        icon: config.icon,
        tier: config.tier,
        section: config.section,
      });
    }
  }

  // SAT and ACT are either/or — if one is filled, don't count the other as missing
  const hasSat = isFilled(data, 'sat');
  const hasAct = isFilled(data, 'act');
  if (hasSat || hasAct) {
    const idx = missing.findIndex(m => (hasSat && m.field === 'act') || (hasAct && m.field === 'sat'));
    if (idx >= 0) {
      filledWeight += TIER_WEIGHTS[missing[idx].tier];
      missing.splice(idx, 1);
    }
  }

  // Hudl and YouTube are either/or
  const hasHudl = isFilled(data, 'hudlLink');
  const hasYoutube = isFilled(data, 'youtubeLink');
  if (hasHudl || hasYoutube) {
    const idx = missing.findIndex(m => (hasHudl && m.field === 'youtubeLink') || (hasYoutube && m.field === 'hudlLink'));
    if (idx >= 0) {
      filledWeight += TIER_WEIGHTS[missing[idx].tier];
      missing.splice(idx, 1);
    }
  }

  const percentage = totalWeight > 0 ? Math.round((filledWeight / totalWeight) * 100) : 0;

  return {
    percentage,
    filledCount,
    totalCount: FIELD_CONFIG.length,
    missingFields: missing,
    topActions: missing.slice(0, 5),
  };
}
