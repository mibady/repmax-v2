import { NextRequest, NextResponse } from "next/server";
import type { Prospect } from "@/lib/data/zone-data";
import { getPlaceholderImage } from "@/lib/data/zone-data";

// Prospects data - sample data based on MCP connector output
const ALL_PROSPECTS: Prospect[] = [
  // QBs
  { id: "94add0fe-8857-4010-b12a-3673f8c714f3", full_name: "Brayden Holbrook", position: "QB", high_school: "Lakeland", class_year: 2026, star_rating: 3, zone_code: "MIDWEST", commitment_status: "uncommitted", committed_team: null, image_url: null },
  { id: "46242ba2-57c8-4e6e-a4af-b8065c4eef00", full_name: "Carsen Melvin", position: "QB", high_school: "Westfield", class_year: 2026, star_rating: 3, zone_code: "MIDWEST", commitment_status: "uncommitted", committed_team: null, image_url: null },
  { id: "c89c7f97-5f42-4320-97eb-b6fde42126b0", full_name: "Johnny O'Brien", position: "QB", high_school: "Palatine", class_year: 2026, star_rating: 4, zone_code: "MIDWEST", commitment_status: "uncommitted", committed_team: null, image_url: null },
  { id: "fe4ea032-2550-415c-a667-754f91b1ef26", full_name: "Donovan Moorhead", position: "QB", high_school: "Hawken", class_year: 2026, star_rating: 3, zone_code: "MIDWEST", commitment_status: "uncommitted", committed_team: null, image_url: null },
  { id: "877d7f44-d2ad-479d-8539-923ceb761172", full_name: "Alex Manske", position: "QB", high_school: "Algona", class_year: 2026, star_rating: 4, zone_code: "MIDWEST", commitment_status: "uncommitted", committed_team: null, image_url: null },
  { id: "sw-qb-1", full_name: "Jackson Arnold", position: "QB", high_school: "Guyer", class_year: 2024, star_rating: 5, zone_code: "SOUTHWEST", commitment_status: "committed", committed_team: "Oklahoma", image_url: null },
  { id: "sw-qb-2", full_name: "Quinn Ewers", position: "QB", high_school: "Southlake Carroll", class_year: 2024, star_rating: 5, zone_code: "SOUTHWEST", commitment_status: "committed", committed_team: "Texas", image_url: null },
  { id: "w-qb-1", full_name: "Malachi Nelson", position: "QB", high_school: "Los Alamitos", class_year: 2024, star_rating: 5, zone_code: "WEST", commitment_status: "committed", committed_team: "USC", image_url: null },
  { id: "w-qb-2", full_name: "Nico Iamaleava", position: "QB", high_school: "Warren", class_year: 2024, star_rating: 5, zone_code: "WEST", commitment_status: "committed", committed_team: "Tennessee", image_url: null },
  { id: "ne-qb-1", full_name: "Caleb Williams", position: "QB", high_school: "Gonzaga College HS", class_year: 2023, star_rating: 5, zone_code: "NORTHEAST", commitment_status: "committed", committed_team: "USC", image_url: null },
  // WRs
  { id: "se-wr-1", full_name: "Jeremiah Smith", position: "WR", high_school: "Chaminade-Madonna", class_year: 2024, star_rating: 5, zone_code: "SOUTHEAST", commitment_status: "committed", committed_team: "Ohio State", image_url: null },
  { id: "se-wr-2", full_name: "Ryan Wingo", position: "WR", high_school: "IMG Academy", class_year: 2025, star_rating: 5, zone_code: "SOUTHEAST", commitment_status: "uncommitted", committed_team: null, image_url: null },
  { id: "sw-wr-1", full_name: "Marcus Thorton", position: "WR", high_school: "Valley Christian", class_year: 2025, star_rating: 5, zone_code: "SOUTHWEST", commitment_status: "uncommitted", committed_team: null, image_url: null },
  // RBs
  { id: "sw-rb-1", full_name: "Rueben Owens", position: "RB", high_school: "El Campo", class_year: 2024, star_rating: 5, zone_code: "SOUTHWEST", commitment_status: "committed", committed_team: "Texas", image_url: null },
  { id: "se-rb-1", full_name: "Justice Haynes", position: "RB", high_school: "Buford", class_year: 2024, star_rating: 5, zone_code: "SOUTHEAST", commitment_status: "committed", committed_team: "Alabama", image_url: null },
  // LBs
  { id: "sw-lb-1", full_name: "David Chen", position: "LB", high_school: "Chandler High", class_year: 2026, star_rating: 4, zone_code: "SOUTHWEST", commitment_status: "uncommitted", committed_team: null, image_url: null },
  { id: "se-lb-1", full_name: "Sammy Brown", position: "LB", high_school: "Jefferson", class_year: 2024, star_rating: 5, zone_code: "SOUTHEAST", commitment_status: "committed", committed_team: "Clemson", image_url: null },
  // ATH
  { id: "se-ath-1", full_name: "KJ Bolden", position: "ATH", high_school: "Buford", class_year: 2024, star_rating: 5, zone_code: "SOUTHEAST", commitment_status: "committed", committed_team: "Georgia", image_url: null },
  // Edge
  { id: "se-edge-1", full_name: "Colin Simmons", position: "EDGE", high_school: "Duncanville", class_year: 2024, star_rating: 5, zone_code: "SOUTHWEST", commitment_status: "committed", committed_team: "Texas", image_url: null },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const position = searchParams.get("position");
  const zone = searchParams.get("zone");
  const _state = searchParams.get("state"); // eslint-disable-line @typescript-eslint/no-unused-vars
  const minStars = parseInt(searchParams.get("minStars") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  let filtered = [...ALL_PROSPECTS];

  if (position) {
    filtered = filtered.filter(p => p.position.toUpperCase() === position.toUpperCase());
  }

  if (zone) {
    filtered = filtered.filter(p => p.zone_code.toUpperCase() === zone.toUpperCase());
  }

  if (minStars > 0) {
    filtered = filtered.filter(p => p.star_rating >= minStars);
  }

  // Sort by star rating descending
  filtered.sort((a, b) => b.star_rating - a.star_rating);

  // Add placeholder images
  const withImages = filtered.map(p => ({
    ...p,
    image_url: p.image_url || getPlaceholderImage(p.id),
  }));

  return NextResponse.json({
    prospects: withImages.slice(0, limit),
    total: filtered.length,
  });
}
