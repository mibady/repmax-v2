import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the event
    const { data: event, error: eventError } = await supabase
      .from("dashr_events")
      .select("*")
      .eq("id", id)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Only show published events (unless creator)
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!event.is_published && event.created_by !== profile?.id) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get booking count for remaining capacity
    const { count: bookingCount } = await supabase
      .from("dashr_bookings")
      .select("id", { count: "exact", head: true })
      .eq("event_id", id)
      .neq("status", "canceled");

    // Check if current user has already booked
    let userBooking = null;
    if (profile) {
      const { data: existingBooking } = await supabase
        .from("dashr_bookings")
        .select("id, status, quantity, created_at")
        .eq("event_id", id)
        .eq("profile_id", profile.id)
        .neq("status", "canceled")
        .limit(1)
        .single();

      userBooking = existingBooking || null;
    }

    return NextResponse.json({
      event: {
        ...event,
        booking_count: bookingCount || 0,
      },
      userBooking,
    });
  } catch (error) {
    console.error("Dashr event detail GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
