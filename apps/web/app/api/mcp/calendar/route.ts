import { NextResponse } from "next/server";
import type { CalendarContext } from "@/lib/data/zone-data";

// Calendar data from MCP
const CALENDAR: CalendarContext = {
  currentPeriod: "Transfer Portal Window",
  portalWindowOpen: true,
  portalWindowStart: "2025-01-01",
  portalWindowEnd: "2025-01-16",
  nextSigningDate: "2025-02-05",
  daysUntilSigning: 4,
  keyDates: [
    { date: "2025-01-16", event: "Portal Window Closes" },
    { date: "2025-02-05", event: "National Signing Day" },
    { date: "2025-04-01", event: "Spring Portal Window Opens" },
    { date: "2025-04-15", event: "Spring Portal Window Closes" },
    { date: "2025-12-04", event: "Early Signing Period Begins" },
  ],
};

export async function GET() {
  return NextResponse.json({
    calendar: CALENDAR,
  });
}
