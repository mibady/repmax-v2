import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get("type");
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    let query = supabase
      .from("dashr_events")
      .select("*")
      .eq("is_published", true)
      .order("start_date", { ascending: true });

    if (typeFilter) {
      query = query.eq("event_type", typeFilter);
    }

    if (fromDate) {
      query = query.gte("start_date", fromDate);
    }

    if (toDate) {
      query = query.lte("start_date", toDate);
    }

    const { data: events, error: eventsError } = await query;

    if (eventsError) {
      console.error("Dashr events query error:", eventsError);
      return NextResponse.json({ error: eventsError.message }, { status: 500 });
    }

    // Get all booking counts in a single query to avoid N+1
    const { data: allBookings, error: countsError } = await supabase
      .from("dashr_bookings")
      .select("event_id")
      .neq("status", "canceled");

    if (countsError) {
      console.error("Booking counts query error:", countsError);
    }

    const countMap = (allBookings || []).reduce((acc: Record<string, number>, curr) => {
      acc[curr.event_id] = (acc[curr.event_id] || 0) + 1;
      return acc;
    }, {});

    const eventsWithCounts = (events || []).map((event) => ({
      ...event,
      booking_count: countMap[event.id] || 0,
    }));

    return NextResponse.json({ events: eventsWithCounts });
  } catch (error) {
    console.error("Dashr events GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
