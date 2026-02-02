import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const getQuerySchema = z.object({
  highlight_id: z.string().uuid().optional(),
});

const postBodySchema = z.object({
  highlight_id: z.string().uuid(),
  timestamp_seconds: z.number().min(0),
  label: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
  rating: z.number().min(1).max(5).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

// GET /api/film/bookmarks
// Returns film bookmarks for the current coach
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get coach profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (!profile || (profile.role !== "coach" && profile.role !== "recruiter")) {
      return NextResponse.json({ error: "Must be a coach or recruiter" }, { status: 403 });
    }

    const { data: coach } = await supabase
      .from("coaches")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (!coach) {
      return NextResponse.json({ error: "Coach profile not found" }, { status: 404 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const params = getQuerySchema.parse({
      highlight_id: searchParams.get("highlight_id") || undefined,
    });

    // Build query
    let query = supabase
      .from("film_bookmarks")
      .select(`
        *,
        highlights!inner(
          id,
          title,
          video_url,
          thumbnail_url,
          duration_seconds,
          athletes!inner(
            id,
            primary_position,
            profiles!inner(full_name)
          )
        )
      `)
      .eq("coach_id", coach.id)
      .order("created_at", { ascending: false });

    if (params.highlight_id) {
      query = query.eq("highlight_id", params.highlight_id);
    }

    const { data: bookmarks, error: bookmarksError } = await query;

    if (bookmarksError) {
      console.error("Error fetching bookmarks:", bookmarksError);
      return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
    }

    return NextResponse.json({
      bookmarks: bookmarks?.map(b => ({
        id: b.id,
        highlight_id: b.highlight_id,
        timestamp_seconds: b.timestamp_seconds,
        label: b.label,
        notes: b.notes,
        rating: b.rating,
        tags: b.tags,
        created_at: b.created_at,
        highlight: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          id: (b.highlights as any)?.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          title: (b.highlights as any)?.title,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          thumbnail: (b.highlights as any)?.thumbnail_url,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          duration: (b.highlights as any)?.duration_seconds,
          athlete: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            id: (b.highlights as any)?.athletes?.id,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name: (b.highlights as any)?.athletes?.profiles?.full_name,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            position: (b.highlights as any)?.athletes?.primary_position,
          },
        },
      })) || [],
    });
  } catch (error) {
    console.error("Film bookmarks GET error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid parameters", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/film/bookmarks
// Create a new film bookmark
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get coach profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (!profile || (profile.role !== "coach" && profile.role !== "recruiter")) {
      return NextResponse.json({ error: "Must be a coach or recruiter" }, { status: 403 });
    }

    const { data: coach } = await supabase
      .from("coaches")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (!coach) {
      return NextResponse.json({ error: "Coach profile not found" }, { status: 404 });
    }

    // Parse body
    const body = await request.json();
    const data = postBodySchema.parse(body);

    // Verify highlight exists
    const { data: highlight } = await supabase
      .from("highlights")
      .select("id")
      .eq("id", data.highlight_id)
      .single();

    if (!highlight) {
      return NextResponse.json({ error: "Highlight not found" }, { status: 404 });
    }

    // Create bookmark
    const { data: bookmark, error: insertError } = await supabase
      .from("film_bookmarks")
      .insert({
        highlight_id: data.highlight_id,
        coach_id: coach.id,
        timestamp_seconds: data.timestamp_seconds,
        label: data.label,
        notes: data.notes,
        rating: data.rating,
        tags: data.tags,
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json({ error: "Bookmark already exists at this timestamp" }, { status: 409 });
      }
      console.error("Error creating bookmark:", insertError);
      return NextResponse.json({ error: "Failed to create bookmark" }, { status: 500 });
    }

    return NextResponse.json({ bookmark }, { status: 201 });
  } catch (error) {
    console.error("Film bookmarks POST error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
