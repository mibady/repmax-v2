import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const notificationSchema = z.object({
  notification_type: z.enum(['schedule_update', 'score_update', 'bracket_update', 'general']),
  title: z.string().min(1).max(255),
  body: z.string().min(1),
  channels: z.array(z.string()).default(['in_app']),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: tournamentId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the user is the tournament organizer
    const { data: tournament } = await supabase
      .from("tournaments")
      .select("id, organizer_id")
      .eq("id", tournamentId)
      .single();

    if (!tournament || tournament.organizer_id !== user.id) {
      return NextResponse.json(
        { error: "Only the tournament organizer can send notifications" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = notificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data: notification, error: notifError } = await supabase
      .from("tournament_notifications")
      .insert({
        tournament_id: tournamentId,
        notification_type: parsed.data.notification_type,
        title: parsed.data.title,
        body: parsed.data.body,
        channels: parsed.data.channels,
        created_by: profile.id,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (notifError) {
      console.error("Notification insert error:", notifError);
      return NextResponse.json({ error: notifError.message }, { status: 500 });
    }

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Tournament notification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: tournamentId } = await params;
    const supabase = await createClient();

    const { data: notifications, error } = await supabase
      .from("tournament_notifications")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notifications: notifications || [] });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
