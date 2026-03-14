import { NextRequest, NextResponse } from "next/server";
import { ALL_PROGRAMS, type Program } from "@/lib/data/zone-data";
import { getCached, setCache } from "@/lib/utils/mcp-cache";

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
