import { NextResponse } from "next/server";
import type { CalendarContext } from "@/lib/data/zone-data";
import { getCached, setCache } from "@/lib/utils/mcp-cache";

const CACHE_KEY = "calendar";

function getNcaaPeriod(now: Date) {
  const month = now.getMonth(); // 0-indexed
  const day = now.getDate();

  if (month === 11 && day >= 18 && day <= 20) {
    return "Early Signing Period";
  }
  if (month === 0 && day >= 1 && day <= 16) {
    return "Transfer Portal Window";
  }
  if (month === 1 && day >= 1 && day <= 7) {
    return "National Signing Day Window";
  }
  if (month >= 3 && month <= 4) {
    return "Spring Evaluation Period";
  }
  if (month === 5) {
    return "June Official Visit Period";
  }
  if (month >= 8 && month <= 10) {
    return "Fall Contact Period";
  }
  return "Recruiting Period";
}

function getPortalWindow(now: Date) {
  const year = now.getFullYear();

  // Winter window: Jan 1-16
  const winterStart = new Date(year, 0, 1);
  const winterEnd = new Date(year, 0, 16);
  // Spring window: Apr 15-30
  const springStart = new Date(year, 3, 15);
  const springEnd = new Date(year, 3, 30);

  if (now >= winterStart && now <= winterEnd) {
    return { open: true, start: formatDate(winterStart), end: formatDate(winterEnd) };
  }
  if (now >= springStart && now <= springEnd) {
    return { open: true, start: formatDate(springStart), end: formatDate(springEnd) };
  }

  // Find next portal window
  if (now < winterStart) {
    return { open: false, start: formatDate(winterStart), end: formatDate(winterEnd) };
  }
  if (now < springStart) {
    return { open: false, start: formatDate(springStart), end: formatDate(springEnd) };
  }
  // Past spring window — next is winter of next year
  const nextWinterStart = new Date(year + 1, 0, 1);
  const nextWinterEnd = new Date(year + 1, 0, 16);
  return { open: false, start: formatDate(nextWinterStart), end: formatDate(nextWinterEnd) };
}

function getNextSigningDate(now: Date): Date {
  const year = now.getFullYear();
  // NSD is first Wednesday of February — approximate as Feb 5
  const nsd = new Date(year, 1, 5);
  if (now > nsd) {
    return new Date(year + 1, 1, 5);
  }
  return nsd;
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export async function GET() {
  try {
    const cached = getCached<{ calendar: CalendarContext }>(CACHE_KEY);
    if (cached) return NextResponse.json(cached);

    const now = new Date();
    const year = now.getFullYear();

    const currentPeriod = getNcaaPeriod(now);
    const portal = getPortalWindow(now);
    const nextNSD = getNextSigningDate(now);
    const daysUntilSigning = Math.max(
      0,
      Math.ceil((nextNSD.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );

    const today = formatDate(now);

    // Generate key dates for current/next academic year
    const keyDates = [
      { date: `${year}-12-18`, event: "Early Signing Period Opens" },
      { date: `${year}-12-20`, event: "Early Signing Period Closes" },
      { date: `${year + 1}-01-01`, event: "Winter Portal Window Opens" },
      { date: `${year + 1}-01-16`, event: "Winter Portal Window Closes" },
      { date: `${year + 1}-02-05`, event: "National Signing Day" },
      { date: `${year + 1}-04-15`, event: "Spring Portal Window Opens" },
      { date: `${year + 1}-04-30`, event: "Spring Portal Window Closes" },
      { date: `${year + 1}-06-01`, event: "June Official Visit Period Opens" },
    ].filter((d) => d.date >= today);

    const calendar: CalendarContext = {
      currentPeriod,
      portalWindowOpen: portal.open,
      portalWindowStart: portal.start,
      portalWindowEnd: portal.end,
      nextSigningDate: formatDate(nextNSD),
      daysUntilSigning,
      keyDates,
    };

    const result = { calendar };
    setCache(CACHE_KEY, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
