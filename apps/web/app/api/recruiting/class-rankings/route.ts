import { NextResponse } from "next/server";

// This would connect to the RepMax MCP in production

export async function GET() {
  const rankings = [
    {
      team: "Texas A&M",
      total_commits: 24,
      avg_rating: "91.0288",
      five_stars: 1,
      four_stars: 14,
      three_stars: 9,
    },
    {
      team: "Kentucky",
      total_commits: 12,
      avg_rating: "88.0518",
      five_stars: 0,
      four_stars: 3,
      three_stars: 9,
    },
    {
      team: "Indiana",
      total_commits: 22,
      avg_rating: "87.8939",
      five_stars: 0,
      four_stars: 7,
      three_stars: 15,
    },
    {
      team: "Baylor",
      total_commits: 12,
      avg_rating: "87.6909",
      five_stars: 0,
      four_stars: 1,
      three_stars: 11,
    },
    {
      team: "Arizona",
      total_commits: 11,
      avg_rating: "87.5820",
      five_stars: 0,
      four_stars: 3,
      three_stars: 8,
    },
    {
      team: "Nebraska",
      total_commits: 9,
      avg_rating: "87.5720",
      five_stars: 0,
      four_stars: 2,
      three_stars: 7,
    },
    {
      team: "Arizona State",
      total_commits: 13,
      avg_rating: "87.5670",
      five_stars: 0,
      four_stars: 2,
      three_stars: 11,
    },
    {
      team: "Illinois",
      total_commits: 26,
      avg_rating: "87.5492",
      five_stars: 0,
      four_stars: 3,
      three_stars: 23,
    },
    {
      team: "Penn State",
      total_commits: 13,
      avg_rating: "87.2219",
      five_stars: 0,
      four_stars: 4,
      three_stars: 9,
    },
    {
      team: "Rutgers",
      total_commits: 22,
      avg_rating: "87.1973",
      five_stars: 0,
      four_stars: 2,
      three_stars: 20,
    },
  ];

  return NextResponse.json({ rankings });
}
