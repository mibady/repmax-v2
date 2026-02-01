/**
 * Zone Intel Service
 *
 * This service provides zone-specific recruiting intelligence.
 * In the future, this can be enhanced with MCP (Model Context Protocol)
 * to fetch real-time data from recruiting services.
 *
 * Current implementation uses mock data for demonstration.
 * TODO: Wire to RepMax MCP for live zone data
 */

import {
  ZoneCode,
  ZonePulse,
  ZoneEvent,
  ZoneIntel,
  STATE_TO_ZONE,
  ZONE_NAMES,
  ZONE_CONFERENCES,
} from "./types";

/**
 * Get the zone code from a US state abbreviation
 */
export function getZoneFromState(state: string): ZoneCode {
  const upperState = state.toUpperCase();
  return STATE_TO_ZONE[upperState] || "WEST";
}

/**
 * Get zone display name
 */
export function getZoneName(zone: ZoneCode): string {
  return ZONE_NAMES[zone];
}

/**
 * Get conferences active in a zone
 */
export function getZoneConferences(zone: ZoneCode): string[] {
  return ZONE_CONFERENCES[zone];
}

/**
 * Generate a zone-specific insight message based on position and activity
 */
function generateInsightMessage(zone: ZoneCode, position?: string): string {
  const conferences = ZONE_CONFERENCES[zone];
  const mainConference = conferences[0];

  const messages: Record<ZoneCode, string[]> = {
    WEST: [
      `Coaches from the ${mainConference} are actively scouting this week. Keep your profile updated.`,
      `Spring evaluation period is heating up in the West. Several D1 programs are looking for talent.`,
      `${mainConference} coaches showed increased activity in your area this month.`,
    ],
    MIDWEST: [
      `Big Ten programs are expanding their recruiting radius. Your profile is getting noticed.`,
      `Winter conditioning reports are in high demand from ${mainConference} coaches.`,
      `Multiple ${mainConference} schools are hosting junior days next month.`,
    ],
    SOUTH: [
      `SEC and ACC schools are competing for top talent in your zone.`,
      `${mainConference} spring practices start soon - coaches are finalizing target lists.`,
      `High activity from Southern programs this recruiting cycle.`,
    ],
    NORTHEAST: [
      `Ivy League and ${mainConference} programs are actively building their classes.`,
      `Academic showcases are drawing interest from top-tier Northeast schools.`,
      `FCS programs in the Northeast are looking for early commits.`,
    ],
  };

  const zoneMessages = messages[zone];
  const baseMessage = zoneMessages[Math.floor(Math.random() * zoneMessages.length)];

  if (position) {
    return baseMessage.replace("coaches", `${position} coaches`);
  }

  return baseMessage;
}

/**
 * Get mock zone pulse data
 * TODO: Replace with MCP call to RepMax service
 */
export async function getZonePulse(
  zone: ZoneCode,
  position?: string
): Promise<ZonePulse> {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Generate semi-random but consistent data based on zone
  const zoneHash = zone.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return {
    zone,
    zoneName: ZONE_NAMES[zone],
    weeklyActivity: {
      profileViews: 45 + (zoneHash % 30),
      profileViewsTrend: ["up", "down", "stable"][zoneHash % 3] as "up" | "down" | "stable",
      shortlistAdds: 3 + (zoneHash % 5),
      shortlistAddsTrend: "up",
      messagesReceived: 2 + (zoneHash % 4),
      messagesTrend: ["up", "stable"][zoneHash % 2] as "up" | "stable",
    },
    hotPositions: getHotPositionsForZone(zone),
    activeConferences: ZONE_CONFERENCES[zone].slice(0, 2),
    insightMessage: generateInsightMessage(zone, position),
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Get hot positions for recruiting in a zone
 */
function getHotPositionsForZone(zone: ZoneCode): string[] {
  const basePositions: Record<ZoneCode, string[]> = {
    WEST: ["Wide Receiver", "Quarterback", "Defensive Back"],
    MIDWEST: ["Offensive Line", "Linebacker", "Tight End"],
    SOUTH: ["Running Back", "Defensive Line", "Safety"],
    NORTHEAST: ["Quarterback", "Wide Receiver", "Cornerback"],
  };
  return basePositions[zone];
}

/**
 * Get upcoming zone events
 * TODO: Replace with MCP call to RepMax service
 */
export async function getZoneEvents(zone: ZoneCode): Promise<ZoneEvent[]> {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 100));

  const now = new Date();
  const conferences = ZONE_CONFERENCES[zone];

  // Generate mock events
  const events: ZoneEvent[] = [
    {
      id: `${zone}-camp-1`,
      type: "camp",
      title: `${conferences[0]} Elite Camp`,
      date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: getZoneCity(zone),
      description: "Annual elite prospects showcase",
    },
    {
      id: `${zone}-combine-1`,
      type: "combine",
      title: `Regional Combine - ${ZONE_NAMES[zone]}`,
      date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      location: getZoneCity(zone),
      description: "Official measurements and testing",
    },
    {
      id: `${zone}-deadline-1`,
      type: "deadline",
      title: "Early Signing Period Opens",
      date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      location: "National",
      description: "First day to sign NLI",
    },
  ];

  return events;
}

/**
 * Get a representative city for a zone
 */
function getZoneCity(zone: ZoneCode): string {
  const cities: Record<ZoneCode, string> = {
    WEST: "Los Angeles, CA",
    MIDWEST: "Indianapolis, IN",
    SOUTH: "Atlanta, GA",
    NORTHEAST: "Philadelphia, PA",
  };
  return cities[zone];
}

/**
 * Get complete zone intel package
 * TODO: Replace with MCP call to RepMax service
 */
export async function getZoneIntel(
  zone: ZoneCode,
  position?: string
): Promise<ZoneIntel> {
  const [pulse, upcomingEvents] = await Promise.all([
    getZonePulse(zone, position),
    getZoneEvents(zone),
  ]);

  return {
    pulse,
    upcomingEvents,
    topSchools: getTopSchoolsForZone(zone),
  };
}

/**
 * Get top recruiting schools in a zone
 */
function getTopSchoolsForZone(zone: ZoneCode): ZoneIntel["topSchools"] {
  const schools: Record<ZoneCode, ZoneIntel["topSchools"]> = {
    WEST: [
      { name: "USC", activelyRecruiting: true },
      { name: "UCLA", activelyRecruiting: true },
      { name: "Oregon", activelyRecruiting: false },
      { name: "Washington", activelyRecruiting: true },
    ],
    MIDWEST: [
      { name: "Ohio State", activelyRecruiting: true },
      { name: "Michigan", activelyRecruiting: true },
      { name: "Notre Dame", activelyRecruiting: false },
      { name: "Penn State", activelyRecruiting: true },
    ],
    SOUTH: [
      { name: "Alabama", activelyRecruiting: true },
      { name: "Georgia", activelyRecruiting: true },
      { name: "Texas", activelyRecruiting: true },
      { name: "Florida", activelyRecruiting: false },
    ],
    NORTHEAST: [
      { name: "Penn State", activelyRecruiting: true },
      { name: "Boston College", activelyRecruiting: true },
      { name: "Syracuse", activelyRecruiting: false },
      { name: "Rutgers", activelyRecruiting: true },
    ],
  };
  return schools[zone];
}
