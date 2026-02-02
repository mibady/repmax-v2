import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { ZoneInfo, Program, Prospect, ZoneCode } from "@/lib/data/zone-data";
import { getPlaceholderImage } from "@/lib/data/zone-data";

const zoneSchema = z.enum(["MIDWEST", "NORTHEAST", "PLAINS", "SOUTHEAST", "SOUTHWEST", "WEST"]);

// Zone data
const ZONES: Record<ZoneCode, ZoneInfo> = {
  MIDWEST: {
    zone_code: "MIDWEST",
    zone_name: "Midwest",
    states: ["OH", "MI", "IL", "IN", "WI", "MN", "IA"],
    metro_areas: ["Cleveland", "Detroit", "Chicago", "Indianapolis", "Columbus", "Minneapolis", "Cincinnati"],
    description: "Big Ten territory - strong football tradition with consistent talent production",
    total_recruits: 87,
    blue_chip_count: 87,
    pending_alerts: 0,
    upcoming_events_30d: 0,
  },
  NORTHEAST: {
    zone_code: "NORTHEAST",
    zone_name: "Northeast",
    states: ["PA", "MD", "NJ", "NY", "VA", "MA", "CT", "DE", "DC", "WV", "ME", "NH", "VT", "RI"],
    metro_areas: ["Philadelphia", "New York", "Baltimore", "Washington DC", "Boston", "Pittsburgh", "Newark"],
    description: "Mid-Atlantic and New England - ACC/Big Ten overlap with strong academic focus",
    total_recruits: 73,
    blue_chip_count: 73,
    pending_alerts: 0,
    upcoming_events_30d: 0,
  },
  PLAINS: {
    zone_code: "PLAINS",
    zone_name: "Plains",
    states: ["NE", "KS", "MO", "AR"],
    metro_areas: ["Kansas City", "St. Louis", "Little Rock", "Omaha", "Wichita"],
    description: "Central recruiting - Big 12/SEC border region with underrecruited talent",
    total_recruits: 25,
    blue_chip_count: 25,
    pending_alerts: 0,
    upcoming_events_30d: 0,
  },
  SOUTHEAST: {
    zone_code: "SOUTHEAST",
    zone_name: "Southeast",
    states: ["FL", "GA", "AL", "SC", "NC", "TN", "MS"],
    metro_areas: ["Miami", "Atlanta", "Birmingham", "Charlotte", "Nashville", "Jacksonville", "Tampa"],
    description: "SEC country - elite talent region with strongest high school football tradition",
    total_recruits: 281,
    blue_chip_count: 281,
    pending_alerts: 0,
    upcoming_events_30d: 2,
  },
  SOUTHWEST: {
    zone_code: "SOUTHWEST",
    zone_name: "Southwest",
    states: ["TX", "OK", "AZ", "NM", "LA"],
    metro_areas: ["Dallas", "Houston", "Austin", "San Antonio", "Phoenix", "Oklahoma City", "New Orleans"],
    description: "Texas pipeline - HS football powerhouse region with elite talent concentration",
    total_recruits: 141,
    blue_chip_count: 141,
    pending_alerts: 0,
    upcoming_events_30d: 4,
  },
  WEST: {
    zone_code: "WEST",
    zone_name: "West",
    states: ["CA", "NV", "OR", "WA", "UT", "CO"],
    metro_areas: ["Los Angeles", "San Francisco", "San Diego", "Seattle", "Denver", "Las Vegas", "Portland"],
    description: "West Coast talent - diverse recruiting landscape with growing football programs",
    total_recruits: 81,
    blue_chip_count: 81,
    pending_alerts: 0,
    upcoming_events_30d: 3,
  },
};

// Sample programs data (from MCP)
const PROGRAMS: Record<ZoneCode, Program[]> = {
  SOUTHWEST: [
    { id: "7c644cd5-ea93-49c9-85f4-9345e201dec2", team_name: "North Shore", city: "Houston", state: "TX", zone_code: "SOUTHWEST", current_rating: 891.164, state_rank: 1, current_record: "14-2", d1_prospect_count: 159 },
    { id: "064da9c8-77fd-48e6-a030-4cc7b3922267", team_name: "South Oak Cliff", city: "Dallas", state: "TX", zone_code: "SOUTHWEST", current_rating: 390.971, state_rank: 2, current_record: "14-1", d1_prospect_count: 159 },
    { id: "f992f604-7aed-4990-852a-aac71531be74", team_name: "DeSoto", city: "DeSoto", state: "TX", zone_code: "SOUTHWEST", current_rating: 86.377, state_rank: 3, current_record: "13-3", d1_prospect_count: 159 },
    { id: "fea929e6-60f2-43ea-9c70-53de4fef03d0", team_name: "Southlake Carroll", city: "Southlake", state: "TX", zone_code: "SOUTHWEST", current_rating: 86.324, state_rank: 4, current_record: "14-1", d1_prospect_count: 159 },
  ],
  SOUTHEAST: [
    { id: "se-1", team_name: "IMG Academy", city: "Bradenton", state: "FL", zone_code: "SOUTHEAST", current_rating: 950.0, state_rank: 1, current_record: "10-1", d1_prospect_count: 45 },
    { id: "se-2", team_name: "Buford", city: "Buford", state: "GA", zone_code: "SOUTHEAST", current_rating: 890.5, state_rank: 1, current_record: "15-0", d1_prospect_count: 32 },
    { id: "se-3", team_name: "Thompson", city: "Alabaster", state: "AL", zone_code: "SOUTHEAST", current_rating: 875.2, state_rank: 1, current_record: "14-1", d1_prospect_count: 28 },
  ],
  MIDWEST: [
    { id: "mw-1", team_name: "St. Edward", city: "Lakewood", state: "OH", zone_code: "MIDWEST", current_rating: 820.0, state_rank: 1, current_record: "14-1", d1_prospect_count: 22 },
    { id: "mw-2", team_name: "Loyola Academy", city: "Wilmette", state: "IL", zone_code: "MIDWEST", current_rating: 780.5, state_rank: 1, current_record: "12-2", d1_prospect_count: 18 },
  ],
  WEST: [
    { id: "w-1", team_name: "Mater Dei", city: "Santa Ana", state: "CA", zone_code: "WEST", current_rating: 920.0, state_rank: 1, current_record: "13-1", d1_prospect_count: 38 },
    { id: "w-2", team_name: "St. John Bosco", city: "Bellflower", state: "CA", zone_code: "WEST", current_rating: 905.0, state_rank: 2, current_record: "12-2", d1_prospect_count: 35 },
  ],
  NORTHEAST: [
    { id: "ne-1", team_name: "St. Joseph's Prep", city: "Philadelphia", state: "PA", zone_code: "NORTHEAST", current_rating: 780.0, state_rank: 1, current_record: "12-1", d1_prospect_count: 15 },
    { id: "ne-2", team_name: "Don Bosco Prep", city: "Ramsey", state: "NJ", zone_code: "NORTHEAST", current_rating: 760.0, state_rank: 1, current_record: "11-2", d1_prospect_count: 12 },
  ],
  PLAINS: [
    { id: "pl-1", team_name: "De Smet Jesuit", city: "St. Louis", state: "MO", zone_code: "PLAINS", current_rating: 720.0, state_rank: 1, current_record: "10-3", d1_prospect_count: 8 },
  ],
};

// Sample prospects data
const PROSPECTS: Record<ZoneCode, Prospect[]> = {
  SOUTHWEST: [
    { id: "sw-1", full_name: "Jalen Green", position: "QB", high_school: "Desert Ridge", class_year: 2025, star_rating: 5, zone_code: "SOUTHWEST", commitment_status: "uncommitted", committed_team: null, image_url: null },
    { id: "sw-2", full_name: "Marcus Thorton", position: "WR", high_school: "Valley Christian", class_year: 2025, star_rating: 5, zone_code: "SOUTHWEST", commitment_status: "uncommitted", committed_team: null, image_url: null },
    { id: "sw-3", full_name: "David Chen", position: "LB", high_school: "Chandler High", class_year: 2026, star_rating: 4, zone_code: "SOUTHWEST", commitment_status: "uncommitted", committed_team: null, image_url: null },
    { id: "sw-4", full_name: "Trey Williams", position: "RB", high_school: "Saguaro", class_year: 2024, star_rating: 5, zone_code: "SOUTHWEST", commitment_status: "committed", committed_team: "Texas", image_url: null },
  ],
  SOUTHEAST: [
    { id: "se-p1", full_name: "Jeremiah Smith", position: "WR", high_school: "Chaminade-Madonna", class_year: 2024, star_rating: 5, zone_code: "SOUTHEAST", commitment_status: "committed", committed_team: "Ohio State", image_url: null },
    { id: "se-p2", full_name: "KJ Bolden", position: "ATH", high_school: "Buford", class_year: 2024, star_rating: 5, zone_code: "SOUTHEAST", commitment_status: "committed", committed_team: "Georgia", image_url: null },
    { id: "se-p3", full_name: "Ryan Wingo", position: "WR", high_school: "IMG Academy", class_year: 2025, star_rating: 5, zone_code: "SOUTHEAST", commitment_status: "uncommitted", committed_team: null, image_url: null },
  ],
  MIDWEST: [
    { id: "mw-p1", full_name: "Johnny O'Brien", position: "QB", high_school: "Palatine", class_year: 2026, star_rating: 4, zone_code: "MIDWEST", commitment_status: "uncommitted", committed_team: null, image_url: null },
    { id: "mw-p2", full_name: "Alex Manske", position: "QB", high_school: "Algona", class_year: 2026, star_rating: 4, zone_code: "MIDWEST", commitment_status: "uncommitted", committed_team: null, image_url: null },
  ],
  WEST: [
    { id: "w-p1", full_name: "Malachi Nelson", position: "QB", high_school: "Los Alamitos", class_year: 2024, star_rating: 5, zone_code: "WEST", commitment_status: "committed", committed_team: "USC", image_url: null },
    { id: "w-p2", full_name: "Nico Iamaleava", position: "QB", high_school: "Warren", class_year: 2024, star_rating: 5, zone_code: "WEST", commitment_status: "committed", committed_team: "Tennessee", image_url: null },
  ],
  NORTHEAST: [
    { id: "ne-p1", full_name: "Caleb Williams Jr", position: "QB", high_school: "Gonzaga College HS", class_year: 2026, star_rating: 4, zone_code: "NORTHEAST", commitment_status: "uncommitted", committed_team: null, image_url: null },
  ],
  PLAINS: [
    { id: "pl-p1", full_name: "Arch Manning Jr", position: "QB", high_school: "De Smet Jesuit", class_year: 2027, star_rating: 4, zone_code: "PLAINS", commitment_status: "uncommitted", committed_team: null, image_url: null },
  ],
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ zone: string }> }
) {
  try {
    const { zone } = await params;
    const upperZone = zone.toUpperCase();

    const validZone = zoneSchema.safeParse(upperZone);
    if (!validZone.success) {
      return NextResponse.json({ error: "Invalid zone" }, { status: 400 });
    }

    const zoneCode = validZone.data as ZoneCode;
    const zoneData = ZONES[zoneCode];
    const zonePrograms = PROGRAMS[zoneCode] || [];
    const zoneProspects = (PROSPECTS[zoneCode] || []).map(p => ({
      ...p,
      image_url: p.image_url || getPlaceholderImage(p.id),
    }));

    return NextResponse.json({
      zone: zoneData,
      programs: zonePrograms,
      prospects: zoneProspects,
    });
  } catch (error) {
    console.error("Zone API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
