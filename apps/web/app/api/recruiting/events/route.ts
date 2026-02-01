import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  event_type: z.enum(["deadline", "signing_period", "visit", "camp", "showcase", "evaluation", "contact_period", "dead_period"]).optional(),
  division: z.enum(["D1", "D2", "D3", "NAIA", "JUCO"]).optional(),
  class_year: z.coerce.number().optional(),
});

// GET /api/recruiting/events
// Returns recruiting calendar events
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const params = querySchema.parse({
      start_date: searchParams.get("start_date") || undefined,
      end_date: searchParams.get("end_date") || undefined,
      event_type: searchParams.get("event_type") as any || undefined,
      division: searchParams.get("division") as any || undefined,
      class_year: searchParams.get("class_year") || undefined,
    });

    // Default date range: current month + 3 months
    const startDate = params.start_date || new Date().toISOString().split("T")[0];
    const endDate = params.end_date || (() => {
      const d = new Date();
      d.setMonth(d.getMonth() + 3);
      return d.toISOString().split("T")[0];
    })();

    // Build query
    let query = supabase
      .from("recruiting_events")
      .select("*")
      .gte("start_date", startDate)
      .lte("start_date", endDate)
      .order("start_date", { ascending: true });

    if (params.event_type) {
      query = query.eq("event_type", params.event_type);
    }

    // Note: division and class_year filtering would use array contains
    // For now we'll filter in JS

    const { data: events, error: eventsError } = await query;

    if (eventsError) {
      console.error("Error fetching events:", eventsError);
      return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }

    // Filter by division/class_year if specified
    let filteredEvents = events || [];

    if (params.division) {
      filteredEvents = filteredEvents.filter(e =>
        !e.applies_to_divisions || e.applies_to_divisions.includes(params.division)
      );
    }

    if (params.class_year) {
      filteredEvents = filteredEvents.filter(e =>
        !e.applies_to_class_years || e.applies_to_class_years.includes(params.class_year)
      );
    }

    // If no events, return default NCAA calendar events
    if (filteredEvents.length === 0) {
      const year = new Date().getFullYear();
      const mockEvents = [
        {
          id: "mock-1",
          title: "Early Signing Period",
          event_type: "signing_period",
          start_date: `${year}-12-18`,
          end_date: `${year}-12-20`,
          is_ncaa_official: true,
          description: "First opportunity for prospects to sign National Letter of Intent",
        },
        {
          id: "mock-2",
          title: "National Signing Day",
          event_type: "deadline",
          start_date: `${year + 1}-02-07`,
          end_date: null,
          is_ncaa_official: true,
          description: "Traditional signing day for football recruits",
        },
        {
          id: "mock-3",
          title: "Spring Evaluation Period",
          event_type: "evaluation",
          start_date: `${year + 1}-04-15`,
          end_date: `${year + 1}-05-31`,
          is_ncaa_official: true,
          description: "Coaches can evaluate prospects at their schools",
        },
        {
          id: "mock-4",
          title: "June Official Visit Period",
          event_type: "contact_period",
          start_date: `${year + 1}-06-01`,
          end_date: `${year + 1}-06-30`,
          is_ncaa_official: true,
          description: "Peak time for official campus visits",
        },
        {
          id: "mock-5",
          title: "Dead Period - Thanksgiving",
          event_type: "dead_period",
          start_date: `${year}-11-25`,
          end_date: `${year}-11-30`,
          is_ncaa_official: true,
          description: "No in-person recruiting allowed",
        },
      ].filter(e => e.start_date >= startDate && e.start_date <= endDate);

      return NextResponse.json({
        events: mockEvents,
        period: { start: startDate, end: endDate },
        is_mock: true,
      });
    }

    return NextResponse.json({
      events: filteredEvents,
      period: { start: startDate, end: endDate },
      is_mock: false,
    });
  } catch (error) {
    console.error("Recruiting events API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid parameters", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
