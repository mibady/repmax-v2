import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get user's bookings with event info via join
    const { data: bookingsRaw, error: bookingsError } = await supabase
      .from("dashr_bookings")
      .select(`
        id,
        event_id,
        quantity,
        status,
        amount_cents,
        stripe_session_id,
        created_at,
        dashr_events(title, start_date)
      `)
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });

    if (bookingsError) {
      console.error("Dashr bookings query error:", bookingsError);
      return NextResponse.json({ error: bookingsError.message }, { status: 500 });
    }

    // Flatten bookings with event data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bookings = (bookingsRaw || []).map((booking: any) => {
      const event = booking.dashr_events;
      return {
        id: booking.id,
        event_id: booking.event_id,
        quantity: booking.quantity,
        status: booking.status,
        amount_cents: booking.amount_cents,
        stripe_session_id: booking.stripe_session_id,
        created_at: booking.created_at,
        event_title: event?.title || null,
        event_date: event?.start_date || null,
      };
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Dashr bookings GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
