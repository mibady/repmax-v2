import { NextRequest, NextResponse } from "next/server";
import type { Program } from "@/lib/data/zone-data";
import { getCached, setCache } from "@/lib/utils/mcp-cache";

// Static programs data — no DB table for HS football programs
const ALL_PROGRAMS: Program[] = [
  // Texas
  { id: "7c644cd5-ea93-49c9-85f4-9345e201dec2", team_name: "North Shore", city: "Houston", state: "TX", zone_code: "SOUTHWEST", current_rating: 891.164, state_rank: 1, current_record: "14-2", d1_prospect_count: 159 },
  { id: "064da9c8-77fd-48e6-a030-4cc7b3922267", team_name: "South Oak Cliff", city: "Dallas", state: "TX", zone_code: "SOUTHWEST", current_rating: 390.971, state_rank: 2, current_record: "14-1", d1_prospect_count: 159 },
  { id: "f992f604-7aed-4990-852a-aac71531be74", team_name: "DeSoto", city: "DeSoto", state: "TX", zone_code: "SOUTHWEST", current_rating: 86.377, state_rank: 3, current_record: "13-3", d1_prospect_count: 159 },
  { id: "fea929e6-60f2-43ea-9c70-53de4fef03d0", team_name: "Southlake Carroll", city: "Southlake", state: "TX", zone_code: "SOUTHWEST", current_rating: 86.324, state_rank: 4, current_record: "14-1", d1_prospect_count: 159 },
  { id: "67994474-a409-4167-8f3e-9c9447981b74", team_name: "Duncanville", city: "Duncanville", state: "TX", zone_code: "SOUTHWEST", current_rating: 86.299, state_rank: 5, current_record: "12-2", d1_prospect_count: 159 },
  // California
  { id: "w-1", team_name: "Mater Dei", city: "Santa Ana", state: "CA", zone_code: "WEST", current_rating: 920.0, state_rank: 1, current_record: "13-1", d1_prospect_count: 38 },
  { id: "w-2", team_name: "St. John Bosco", city: "Bellflower", state: "CA", zone_code: "WEST", current_rating: 905.0, state_rank: 2, current_record: "12-2", d1_prospect_count: 35 },
  { id: "w-3", team_name: "Serra", city: "San Mateo", state: "CA", zone_code: "WEST", current_rating: 780.0, state_rank: 3, current_record: "11-2", d1_prospect_count: 22 },
  // Florida
  { id: "se-1", team_name: "IMG Academy", city: "Bradenton", state: "FL", zone_code: "SOUTHEAST", current_rating: 950.0, state_rank: 1, current_record: "10-1", d1_prospect_count: 45 },
  { id: "se-fl-2", team_name: "Chaminade-Madonna", city: "Hollywood", state: "FL", zone_code: "SOUTHEAST", current_rating: 850.0, state_rank: 2, current_record: "12-1", d1_prospect_count: 28 },
  // Georgia
  { id: "se-2", team_name: "Buford", city: "Buford", state: "GA", zone_code: "SOUTHEAST", current_rating: 890.5, state_rank: 1, current_record: "15-0", d1_prospect_count: 32 },
  { id: "se-ga-2", team_name: "Mill Creek", city: "Hoschton", state: "GA", zone_code: "SOUTHEAST", current_rating: 820.0, state_rank: 2, current_record: "13-2", d1_prospect_count: 25 },
  // Alabama
  { id: "se-3", team_name: "Thompson", city: "Alabaster", state: "AL", zone_code: "SOUTHEAST", current_rating: 875.2, state_rank: 1, current_record: "14-1", d1_prospect_count: 28 },
  // Ohio
  { id: "mw-1", team_name: "St. Edward", city: "Lakewood", state: "OH", zone_code: "MIDWEST", current_rating: 820.0, state_rank: 1, current_record: "14-1", d1_prospect_count: 22 },
  // Pennsylvania
  { id: "ne-1", team_name: "St. Joseph's Prep", city: "Philadelphia", state: "PA", zone_code: "NORTHEAST", current_rating: 780.0, state_rank: 1, current_record: "12-1", d1_prospect_count: 15 },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const state = searchParams.get("state");
  const zone = searchParams.get("zone");
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  const cacheKey = `programs-${state || "all"}-${zone || "all"}-${limit}`;
  const cached = getCached<{ programs: Program[]; total: number }>(cacheKey);
  if (cached) return NextResponse.json(cached);

  let filtered = [...ALL_PROGRAMS];

  if (state) {
    filtered = filtered.filter(p => p.state.toUpperCase() === state.toUpperCase());
  }

  if (zone) {
    filtered = filtered.filter(p => p.zone_code.toUpperCase() === zone.toUpperCase());
  }

  // Sort by rating descending
  filtered.sort((a, b) => b.current_rating - a.current_rating);

  const result = {
    programs: filtered.slice(0, limit),
    total: filtered.length,
  };

  setCache(cacheKey, result);
  return NextResponse.json(result);
}
