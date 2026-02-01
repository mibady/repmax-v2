/**
 * Zone Intel Types
 *
 * These types define the structure of zone-specific recruiting intelligence data.
 * Zone Pulse shows real-time recruiting activity in the athlete's geographic region.
 */

export type ZoneCode = "WEST" | "MIDWEST" | "SOUTHEAST" | "SOUTHWEST" | "NORTHEAST" | "PLAINS";

export interface ZonePulse {
  zone: ZoneCode;
  zoneName: string;
  weeklyActivity: {
    profileViews: number;
    profileViewsTrend: "up" | "down" | "stable";
    shortlistAdds: number;
    shortlistAddsTrend: "up" | "down" | "stable";
    messagesReceived: number;
    messagesTrend: "up" | "down" | "stable";
  };
  hotPositions: string[];
  activeConferences: string[];
  insightMessage: string;
  lastUpdated: string;
}

export interface ZoneEvent {
  id: string;
  type: "camp" | "combine" | "visit" | "signing" | "deadline";
  title: string;
  date: string;
  location: string;
  description?: string;
  url?: string;
}

export interface ZoneIntel {
  pulse: ZonePulse;
  upcomingEvents: ZoneEvent[];
  topSchools: Array<{
    name: string;
    logo?: string;
    activelyRecruiting: boolean;
  }>;
}

// State to zone mapping (based on RepMax MCP zones)
export const STATE_TO_ZONE: Record<string, ZoneCode> = {
  // West - CA, NV, OR, WA, UT, CO
  WA: "WEST",
  OR: "WEST",
  CA: "WEST",
  NV: "WEST",
  UT: "WEST",
  CO: "WEST",

  // Midwest - OH, MI, IL, IN, WI, MN, IA
  OH: "MIDWEST",
  MI: "MIDWEST",
  IL: "MIDWEST",
  IN: "MIDWEST",
  WI: "MIDWEST",
  MN: "MIDWEST",
  IA: "MIDWEST",

  // Southeast - FL, GA, AL, SC, NC, TN, MS
  FL: "SOUTHEAST",
  GA: "SOUTHEAST",
  AL: "SOUTHEAST",
  SC: "SOUTHEAST",
  NC: "SOUTHEAST",
  TN: "SOUTHEAST",
  MS: "SOUTHEAST",

  // Southwest - TX, OK, AZ, NM, LA
  TX: "SOUTHWEST",
  OK: "SOUTHWEST",
  AZ: "SOUTHWEST",
  NM: "SOUTHWEST",
  LA: "SOUTHWEST",

  // Northeast - PA, MD, NJ, NY, VA, MA, CT, DE, DC, WV, ME, NH, VT, RI
  PA: "NORTHEAST",
  MD: "NORTHEAST",
  NJ: "NORTHEAST",
  NY: "NORTHEAST",
  VA: "NORTHEAST",
  MA: "NORTHEAST",
  CT: "NORTHEAST",
  DE: "NORTHEAST",
  DC: "NORTHEAST",
  WV: "NORTHEAST",
  ME: "NORTHEAST",
  NH: "NORTHEAST",
  VT: "NORTHEAST",
  RI: "NORTHEAST",

  // Plains - NE, KS, MO, AR
  NE: "PLAINS",
  KS: "PLAINS",
  MO: "PLAINS",
  AR: "PLAINS",

  // Remaining states mapped to closest region
  ID: "WEST",
  MT: "WEST",
  WY: "WEST",
  AK: "WEST",
  HI: "WEST",
  ND: "PLAINS",
  SD: "PLAINS",
  KY: "SOUTHEAST",
};

export const ZONE_NAMES: Record<ZoneCode, string> = {
  WEST: "West",
  MIDWEST: "Midwest",
  SOUTHEAST: "Southeast",
  SOUTHWEST: "Southwest",
  NORTHEAST: "Northeast",
  PLAINS: "Plains",
};

export const ZONE_CONFERENCES: Record<ZoneCode, string[]> = {
  WEST: ["PAC-12", "Mountain West", "Big West", "Big Sky"],
  MIDWEST: ["Big Ten", "Big 12", "MAC", "Missouri Valley"],
  SOUTHEAST: ["SEC", "ACC", "Sun Belt", "C-USA"],
  SOUTHWEST: ["Big 12", "SEC", "AAC", "Mountain West"],
  NORTHEAST: ["ACC", "Big East", "Ivy League", "Patriot League"],
  PLAINS: ["Big 12", "SEC", "Missouri Valley"],
};
