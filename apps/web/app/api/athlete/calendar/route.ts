import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_EVENT_TYPES = ['visit', 'camp', 'combine', 'game', 'deadline', 'signing', 'other'];

async function getAthleteId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .single();
  if (!profile) return null;

  const { data: athlete } = await supabase
    .from("athletes")
    .select("id")
    .eq("profile_id", profile.id)
    .single();
  return athlete?.id || null;
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
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

    const { data: athlete } = await supabase
      .from("athletes")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (!athlete) {
      return NextResponse.json({ upcoming: [], past: [] });
    }

    const today = new Date().toISOString().split("T")[0];

    const [upcomingRes, pastRes] = await Promise.all([
      supabase
        .from("athlete_events")
        .select("*")
        .eq("athlete_id", athlete.id)
        .gte("event_date", today)
        .order("event_date", { ascending: true }),
      supabase
        .from("athlete_events")
        .select("*")
        .eq("athlete_id", athlete.id)
        .lt("event_date", today)
        .order("event_date", { ascending: false })
        .limit(20),
    ]);

    if (upcomingRes.error) {
      console.error("Error fetching upcoming events:", upcomingRes.error);
    }
    if (pastRes.error) {
      console.error("Error fetching past events:", pastRes.error);
    }

    return NextResponse.json({
      upcoming: upcomingRes.data || [],
      past: pastRes.data || [],
    });
  } catch (error) {
    console.error("Error in athlete calendar API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const athleteId = await getAthleteId(supabase, user.id);
    if (!athleteId) return NextResponse.json({ error: "Athlete not found" }, { status: 404 });

    const body = await req.json();
    const { title, description, event_type, event_date, event_time, location, priority } = body;

    if (!title || !event_type || !event_date) {
      return NextResponse.json({ error: "Title, event type, and date are required" }, { status: 400 });
    }
    if (!VALID_EVENT_TYPES.includes(event_type)) {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("athlete_events")
      .insert({
        athlete_id: athleteId,
        title,
        description: description || null,
        event_type,
        event_date,
        event_time: event_time || null,
        location: location || null,
        priority: priority || 'normal',
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating event:", error);
      return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }

    return NextResponse.json({ event: data }, { status: 201 });
  } catch (error) {
    console.error("Error in calendar POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const athleteId = await getAthleteId(supabase, user.id);
    if (!athleteId) return NextResponse.json({ error: "Athlete not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('id');
    if (!eventId) return NextResponse.json({ error: "Event ID required" }, { status: 400 });

    const { error } = await supabase
      .from("athlete_events")
      .delete()
      .eq("id", eventId)
      .eq("athlete_id", athleteId);

    if (error) {
      console.error("Error deleting event:", error);
      return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in calendar DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
