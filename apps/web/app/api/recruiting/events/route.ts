import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  event_type: z
    .enum([
      "deadline",
      "signing_period",
      "visit",
      "camp",
      "showcase",
      "evaluation",
      "contact_period",
      "dead_period",
    ])
    .optional(),
  division: z.enum(["D1", "D2", "D3", "NAIA", "JUCO"]).optional(),
  class_year: z.coerce.number().optional(),
});

// Generate NCAA recruiting calendar events for the current academic year
function generateNcaaCalendar(
  startDate: string,
  endDate: string,
  eventType?: string
) {
  const now = new Date();
  const year = now.getFullYear();
  // Academic year: use current year for fall events, next year for spring
  const fallYear = now.getMonth() >= 7 ? year : year - 1;
  const springYear = fallYear + 1;

  const allEvents = [
    {
      id: `ncaa-fall-eval-${fallYear}`,
      title: "Fall Evaluation Period",
      event_type: "evaluation",
      start_date: `${fallYear}-09-01`,
      end_date: `${fallYear}-11-24`,
      is_ncaa_official: true,
      description:
        "Coaches may watch games and evaluate prospects at their schools",
    },
    {
      id: `ncaa-dead-thanksgiving-${fallYear}`,
      title: "Dead Period - Thanksgiving",
      event_type: "dead_period",
      start_date: `${fallYear}-11-25`,
      end_date: `${fallYear}-11-30`,
      is_ncaa_official: true,
      description: "No in-person recruiting contact allowed",
    },
    {
      id: `ncaa-contact-dec-${fallYear}`,
      title: "December Contact Period",
      event_type: "contact_period",
      start_date: `${fallYear}-12-01`,
      end_date: `${fallYear}-12-17`,
      is_ncaa_official: true,
      description: "Coaches may contact and visit prospects",
    },
    {
      id: `ncaa-esp-${fallYear}`,
      title: "Early Signing Period",
      event_type: "signing_period",
      start_date: `${fallYear}-12-18`,
      end_date: `${fallYear}-12-20`,
      is_ncaa_official: true,
      description:
        "First opportunity for prospects to sign National Letter of Intent",
    },
    {
      id: `ncaa-dead-holiday-${fallYear}`,
      title: "Dead Period - Holiday",
      event_type: "dead_period",
      start_date: `${fallYear}-12-21`,
      end_date: `${springYear}-01-10`,
      is_ncaa_official: true,
      description: "No in-person recruiting contact allowed",
    },
    {
      id: `ncaa-contact-jan-${springYear}`,
      title: "January Contact Period",
      event_type: "contact_period",
      start_date: `${springYear}-01-11`,
      end_date: `${springYear}-02-04`,
      is_ncaa_official: true,
      description: "Coaches may contact and visit prospects",
    },
    {
      id: `ncaa-nsd-${springYear}`,
      title: "National Signing Day",
      event_type: "deadline",
      start_date: `${springYear}-02-05`,
      end_date: null,
      is_ncaa_official: true,
      description: "Traditional signing day for football recruits",
    },
    {
      id: `ncaa-dead-feb-${springYear}`,
      title: "Dead Period - Post NSD",
      event_type: "dead_period",
      start_date: `${springYear}-02-06`,
      end_date: `${springYear}-03-31`,
      is_ncaa_official: true,
      description: "No in-person recruiting contact allowed",
    },
    {
      id: `ncaa-spring-eval-${springYear}`,
      title: "Spring Evaluation Period",
      event_type: "evaluation",
      start_date: `${springYear}-04-15`,
      end_date: `${springYear}-05-31`,
      is_ncaa_official: true,
      description: "Coaches can evaluate prospects at their schools",
    },
    {
      id: `ncaa-june-ov-${springYear}`,
      title: "June Official Visit Period",
      event_type: "contact_period",
      start_date: `${springYear}-06-01`,
      end_date: `${springYear}-06-30`,
      is_ncaa_official: true,
      description: "Peak period for official campus visits",
    },
    {
      id: `ncaa-dead-july-${springYear}`,
      title: "Dead Period - July",
      event_type: "dead_period",
      start_date: `${springYear}-07-01`,
      end_date: `${springYear}-07-31`,
      is_ncaa_official: true,
      description: "No in-person recruiting contact allowed",
    },
  ];

  // Filter by date range
  let filtered = allEvents.filter(
    (e) => e.start_date >= startDate && e.start_date <= endDate
  );

  // Filter by event type
  if (eventType) {
    filtered = filtered.filter((e) => e.event_type === eventType);
  }

  return filtered;
}

// GET /api/recruiting/events
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = querySchema.parse({
      start_date: searchParams.get("start_date") || undefined,
      end_date: searchParams.get("end_date") || undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      event_type: (searchParams.get("event_type") as any) || undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      division: (searchParams.get("division") as any) || undefined,
      class_year: searchParams.get("class_year") || undefined,
    });

    // Default date range: current date + 3 months
    const startDate =
      params.start_date || new Date().toISOString().split("T")[0];
    const endDate =
      params.end_date ||
      (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 3);
        return d.toISOString().split("T")[0];
      })();

    const events = generateNcaaCalendar(
      startDate,
      endDate,
      params.event_type
    );

    return NextResponse.json({
      events,
      period: { start: startDate, end: endDate },
    });
  } catch (error) {
    console.error("Recruiting events API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid parameters", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
