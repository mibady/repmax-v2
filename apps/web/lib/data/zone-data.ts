// Static zone data - this can be enhanced with MCP connector data at runtime
// The MCP connector provides real-time data through the RepMax tools

export type ZoneCode = "MIDWEST" | "NORTHEAST" | "PLAINS" | "SOUTHEAST" | "SOUTHWEST" | "WEST";

export interface ZoneInfo {
  zone_code: ZoneCode;
  zone_name: string;
  states: string[];
  metro_areas: string[];
  description: string;
  total_recruits: number;
  blue_chip_count: number;
  pending_alerts: number;
  upcoming_events_30d: number;
}

export interface Program {
  id: string;
  team_name: string;
  city: string;
  state: string;
  zone_code: string;
  current_rating: number;
  state_rank: number | null;
  current_record: string;
  d1_prospect_count: number;
}

export interface Prospect {
  id: string;
  full_name: string;
  position: string;
  high_school: string;
  class_year: number;
  star_rating: number;
  zone_code: string;
  commitment_status: string;
  committed_team: string | null;
  image_url: string | null;
}

export interface CalendarContext {
  currentPeriod: string;
  portalWindowOpen: boolean;
  portalWindowStart: string;
  portalWindowEnd: string;
  nextSigningDate: string;
  daysUntilSigning: number;
  keyDates: Array<{
    date: string;
    event: string;
  }>;
}

// DB enum → UI ZoneCode mapping
export const DB_ZONE_TO_UI: Record<string, ZoneCode> = {
  'West': 'WEST',
  'Southwest': 'SOUTHWEST',
  'Midwest': 'MIDWEST',
  'Southeast': 'SOUTHEAST',
  'Northeast': 'NORTHEAST',
  'Mid-Atlantic': 'NORTHEAST',
};

export const UI_ZONE_TO_DB: Record<ZoneCode, string[]> = {
  WEST: ['West'],
  SOUTHWEST: ['Southwest'],
  MIDWEST: ['Midwest'],
  SOUTHEAST: ['Southeast'],
  NORTHEAST: ['Northeast', 'Mid-Atlantic'],
  PLAINS: [], // no DB equivalent
};

// Static zone metadata (states, metro areas, descriptions)
export const ZONE_METADATA: Record<ZoneCode, { states: string[]; metro_areas: string[]; description: string }> = {
  MIDWEST: {
    states: ["OH", "MI", "IL", "IN", "WI", "MN", "IA"],
    metro_areas: ["Cleveland", "Detroit", "Chicago", "Indianapolis", "Columbus", "Minneapolis", "Cincinnati"],
    description: "Big Ten territory - strong football tradition with consistent talent production",
  },
  NORTHEAST: {
    states: ["PA", "MD", "NJ", "NY", "VA", "MA", "CT", "DE", "DC", "WV", "ME", "NH", "VT", "RI"],
    metro_areas: ["Philadelphia", "New York", "Baltimore", "Washington DC", "Boston", "Pittsburgh", "Newark"],
    description: "Mid-Atlantic and New England - ACC/Big Ten overlap with strong academic focus",
  },
  PLAINS: {
    states: ["NE", "KS", "MO", "AR"],
    metro_areas: ["Kansas City", "St. Louis", "Little Rock", "Omaha", "Wichita"],
    description: "Central recruiting - Big 12/SEC border region with underrecruited talent",
  },
  SOUTHEAST: {
    states: ["FL", "GA", "AL", "SC", "NC", "TN", "MS"],
    metro_areas: ["Miami", "Atlanta", "Birmingham", "Charlotte", "Nashville", "Jacksonville", "Tampa"],
    description: "SEC country - elite talent region with strongest high school football tradition",
  },
  SOUTHWEST: {
    states: ["TX", "OK", "AZ", "NM", "LA"],
    metro_areas: ["Dallas", "Houston", "Austin", "San Antonio", "Phoenix", "Oklahoma City", "New Orleans"],
    description: "Texas pipeline - HS football powerhouse region with elite talent concentration",
  },
  WEST: {
    states: ["CA", "NV", "OR", "WA", "UT", "CO"],
    metro_areas: ["Los Angeles", "San Francisco", "San Diego", "Seattle", "Denver", "Las Vegas", "Portland"],
    description: "West Coast talent - diverse recruiting landscape with growing football programs",
  },
};

// Zone color configuration for UI
export const ZONE_COLORS: Record<ZoneCode, { primary: string; bg: string; border: string; text: string }> = {
  MIDWEST: {
    primary: "blue",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
  },
  NORTHEAST: {
    primary: "purple",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    text: "text-purple-400",
  },
  PLAINS: {
    primary: "amber",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
  },
  SOUTHEAST: {
    primary: "green",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-400",
  },
  SOUTHWEST: {
    primary: "orange",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    text: "text-orange-400",
  },
  WEST: {
    primary: "teal",
    bg: "bg-teal-500/10",
    border: "border-teal-500/30",
    text: "text-teal-400",
  },
};

// Maps URL-friendly zone names to zone codes
export const ZONE_SLUG_MAP: Record<string, ZoneCode> = {
  "midwest": "MIDWEST",
  "northeast": "NORTHEAST",
  "plains": "PLAINS",
  "southeast": "SOUTHEAST",
  "southwest": "SOUTHWEST",
  "west": "WEST",
};

// Maps zone codes to display names
export const ZONE_DISPLAY_NAMES: Record<ZoneCode, string> = {
  MIDWEST: "Midwest",
  NORTHEAST: "Northeast",
  PLAINS: "Plains",
  SOUTHEAST: "Southeast",
  SOUTHWEST: "Southwest",
  WEST: "West",
};

// Default placeholder images for athletes without photos
export const DEFAULT_ATHLETE_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAIvqgVkdUU4nQI1Qb-uq22o8rpq0nja3rrXOEXhqWhDSzt79nHDeUYS9ZXa0pYZ42ziPSUK3QGiG1TKizAN-UrvCFjELE-gcwl6Bg3v4Ux0KKhrMW3vicpsXzlkraEELYMyMujuO5Cq8Rd7oHRyihzujqGxHWpYjef9JF3_4_W-NJc2dCizHge-DNh3b8AnLhHQ6gq8bovzzYcRUPGDu9wjGm_Mub0O5GI9bkok1WIyL7IOsjRYWTR7AQ67_3ZBuKpPQMyFGi9w8g",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAZhzxfehyO0HU279tCSY7TrdLlw3hl2qlzk0abEQ9HQmA2N-8iUzAgwCnkEPgpf0KnaONvwXucwmBlqB4BpWR_VlwBOXncHIA6d4dLwE3pl0J7uRuvbGh2ZpPOs8jZZ8h_hJakwoW-HfqPY8_ousG2OPwnXK2nRzDzpFWBnvPgFHXeIkRwdZW--CRDfH6uvbLpJ_eu5AsoWVs3TQCO9zbqLQAKGANpT3nZyR1ttUvOEkvhJxMwu4n2asNlrvO8XjELtTWLjrkxoo0",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCyow-8JJY03JjK1QFWh_ZdoHduFLoQ1zBgNvATDDREDuAnOyHvtej1XuK6t_lp1tjEDkvQnrcTVXOz_76NoSRNodTLRdpWJa2t61hJqF9pJ8d8-zpFOdezTnVXad7bj5hQpa5jdAl_FgPg8Rksg_x-8fDsX5uxDPiooojthcYgokhjtXdDIA-fepD7p8QUyMneAx4qcFNcuPT-Ur9w_Z8g0hIK0t7qhUzorcZhGwe8nu5AB_jgKCzFmaeunWFuiNP_LMrjM0m8Omc",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDY4HCaoMWyhCggQEg7sSJt4vPQdQPnt_q7IrP4Yfjsfk2So51TmNV0nnBEs4lqppIk9PzyLrfTnlMEy1ZNvov6B4YqAbpE3DzZMeSAmnormJq5be2EGo1ZvkOq1_Y3MXhLfqt0Lzb7xEHBPPPY9t8uXKztV_f1A4xHgJKcWTdbpirFZDtjP2bYcxu1GaWGcU189kp750OrjNx5xIVayjWPNwPK_k97LK60A14IexzH5pqqVkeyrSuH6sdMZ8q8iYWChxl4MSIvNC0",
];

// Get a deterministic placeholder image based on ID
export function getPlaceholderImage(id: string): string {
  const index = id.charCodeAt(0) % DEFAULT_ATHLETE_IMAGES.length;
  return DEFAULT_ATHLETE_IMAGES[index];
}
