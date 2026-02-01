import { NextResponse } from "next/server";

// This would connect to the RepMax MCP in production

export async function GET() {
  const calendar = {
    currentPeriod: "Transfer Portal Window",
    portalWindowOpen: true,
    portalWindowStart: "2025-01-01",
    portalWindowEnd: "2025-01-16",
    nextSigningDate: "2025-02-05",
    daysUntilSigning: Math.max(0, Math.ceil((new Date("2025-02-05").getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
    keyDates: [
      {
        date: "2025-01-16",
        event: "Portal Window Closes",
      },
      {
        date: "2025-02-05",
        event: "National Signing Day",
      },
      {
        date: "2025-04-01",
        event: "Spring Portal Window Opens",
      },
    ],
  };

  return NextResponse.json(calendar);
}
