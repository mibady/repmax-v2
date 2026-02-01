import { NextResponse } from "next/server";

// This would connect to the RepMax MCP in production
// For now, return static data that matches the MCP structure

export async function GET() {
  // In production, this would call the RepMax MCP
  const zones = [
    {
      zone_code: "MIDWEST",
      zone_name: "Midwest",
      states: ["OH", "MI", "IL", "IN", "WI", "MN", "IA"],
      state_count: 7,
      metro_areas: ["Cleveland", "Detroit", "Chicago", "Indianapolis", "Columbus", "Minneapolis", "Cincinnati"],
      description: "Big Ten territory - strong football tradition with consistent talent production",
      total_recruits: 87,
      blue_chip_count: 87,
      pending_alerts: 0,
      upcoming_events_30d: 0,
    },
    {
      zone_code: "NORTHEAST",
      zone_name: "Northeast",
      states: ["PA", "MD", "NJ", "NY", "VA", "MA", "CT", "DE", "DC", "WV", "ME", "NH", "VT", "RI"],
      state_count: 14,
      metro_areas: ["Philadelphia", "New York", "Baltimore", "Washington DC", "Boston", "Pittsburgh", "Newark"],
      description: "Mid-Atlantic and New England - ACC/Big Ten overlap with strong academic focus",
      total_recruits: 73,
      blue_chip_count: 73,
      pending_alerts: 0,
      upcoming_events_30d: 0,
    },
    {
      zone_code: "PLAINS",
      zone_name: "Plains",
      states: ["NE", "KS", "MO", "AR"],
      state_count: 4,
      metro_areas: ["Kansas City", "St. Louis", "Little Rock", "Omaha", "Wichita"],
      description: "Central recruiting - Big 12/SEC border region with underrecruited talent",
      total_recruits: 25,
      blue_chip_count: 25,
      pending_alerts: 0,
      upcoming_events_30d: 0,
    },
    {
      zone_code: "SOUTHEAST",
      zone_name: "Southeast",
      states: ["FL", "GA", "AL", "SC", "NC", "TN", "MS"],
      state_count: 7,
      metro_areas: ["Miami", "Atlanta", "Birmingham", "Charlotte", "Nashville", "Jacksonville", "Tampa"],
      description: "SEC country - elite talent region with strongest high school football tradition",
      total_recruits: 281,
      blue_chip_count: 281,
      pending_alerts: 0,
      upcoming_events_30d: 3,
    },
    {
      zone_code: "SOUTHWEST",
      zone_name: "Southwest",
      states: ["TX", "OK", "AZ", "NM", "LA"],
      state_count: 5,
      metro_areas: ["Dallas", "Houston", "Austin", "San Antonio", "Phoenix", "Oklahoma City", "New Orleans"],
      description: "Texas pipeline - HS football powerhouse region with elite talent concentration",
      total_recruits: 141,
      blue_chip_count: 141,
      pending_alerts: 0,
      upcoming_events_30d: 4,
    },
    {
      zone_code: "WEST",
      zone_name: "West",
      states: ["CA", "NV", "OR", "WA", "UT", "CO"],
      state_count: 6,
      metro_areas: ["Los Angeles", "San Francisco", "San Diego", "Seattle", "Denver", "Las Vegas", "Portland"],
      description: "West Coast talent - diverse recruiting landscape with growing football programs",
      total_recruits: 81,
      blue_chip_count: 81,
      pending_alerts: 0,
      upcoming_events_30d: 3,
    },
  ];

  return NextResponse.json({ zones });
}
