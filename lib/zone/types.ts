/**
 * Zone Intel Types
 *
 * These types define the structure of zone-specific recruiting intelligence data.
 * Zone Pulse shows real-time recruiting activity in the athlete's geographic region.
 */

export type ZoneCode = "WEST" | "MIDWEST" | "SOUTH" | "NORTHEAST";

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

// State to zone mapping
export const STATE_TO_ZONE: Record<string, ZoneCode> = {
  // West
  WA: "WEST",
  OR: "WEST",
  CA: "WEST",
  NV: "WEST",
  AZ: "WEST",
  UT: "WEST",
  CO: "WEST",
  NM: "WEST",
  ID: "WEST",
  MT: "WEST",
  WY: "WEST",
  AK: "WEST",
  HI: "WEST",

  // Midwest
  ND: "MIDWEST",
  SD: "MIDWEST",
  NE: "MIDWEST",
  KS: "MIDWEST",
  MN: "MIDWEST",
  IA: "MIDWEST",
  MO: "MIDWEST",
  WI: "MIDWEST",
  IL: "MIDWEST",
  MI: "MIDWEST",
  IN: "MIDWEST",
  OH: "MIDWEST",

  // South
  TX: "SOUTH",
  OK: "SOUTH",
  AR: "SOUTH",
  LA: "SOUTH",
  MS: "SOUTH",
  AL: "SOUTH",
  TN: "SOUTH",
  KY: "SOUTH",
  WV: "SOUTH",
  VA: "SOUTH",
  NC: "SOUTH",
  SC: "SOUTH",
  GA: "SOUTH",
  FL: "SOUTH",

  // Northeast
  ME: "NORTHEAST",
  NH: "NORTHEAST",
  VT: "NORTHEAST",
  MA: "NORTHEAST",
  RI: "NORTHEAST",
  CT: "NORTHEAST",
  NY: "NORTHEAST",
  NJ: "NORTHEAST",
  PA: "NORTHEAST",
  DE: "NORTHEAST",
  MD: "NORTHEAST",
  DC: "NORTHEAST",
};

export const ZONE_NAMES: Record<ZoneCode, string> = {
  WEST: "West",
  MIDWEST: "Midwest",
  SOUTH: "South",
  NORTHEAST: "Northeast",
};

export const ZONE_CONFERENCES: Record<ZoneCode, string[]> = {
  WEST: ["PAC-12", "Mountain West", "Big West", "Big Sky"],
  MIDWEST: ["Big Ten", "Big 12", "MAC", "Missouri Valley"],
  SOUTH: ["SEC", "ACC", "Big 12", "Sun Belt", "C-USA"],
  NORTHEAST: ["ACC", "Big East", "Ivy League", "Patriot League"],
};
