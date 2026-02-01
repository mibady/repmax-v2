import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const CreateShortlistSchema = z.object({
  athlete_id: z.string().uuid(),
  notes: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "top"]).default("medium"),
});

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get coach ID
    const { data: coach } = await supabase
      .from("coaches")
      .select("id")
      .eq("profile_id", (
        await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .single()
      ).data?.id)
      .single();

    if (!coach) {
      return NextResponse.json(
        { error: "Only coaches can access shortlists" },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("shortlists")
      .select(
        `
        *,
        athlete:athletes(
          *,
          profile:profiles(full_name, avatar_url)
        )
      `
      )
      .eq("coach_id", coach.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Shortlists query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ shortlists: data });
  } catch (error) {
    console.error("Shortlists API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get coach ID
    const { data: coach } = await supabase
      .from("coaches")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (!coach) {
      return NextResponse.json(
        { error: "Only coaches can add to shortlists" },
        { status: 403 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const parsed = CreateShortlistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Create shortlist entry
    const { data, error } = await supabase
      .from("shortlists")
      .insert({
        coach_id: coach.id,
        ...parsed.data,
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate entry
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Athlete already in shortlist" },
          { status: 409 }
        );
      }
      console.error("Shortlist create error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Shortlists API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const athleteId = searchParams.get("athlete_id");

    if (!athleteId) {
      return NextResponse.json(
        { error: "athlete_id is required" },
        { status: 400 }
      );
    }

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get profile and coach ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    const { data: coach } = await supabase
      .from("coaches")
      .select("id")
      .eq("profile_id", profile?.id)
      .single();

    if (!coach) {
      return NextResponse.json(
        { error: "Only coaches can remove from shortlists" },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from("shortlists")
      .delete()
      .eq("coach_id", coach.id)
      .eq("athlete_id", athleteId);

    if (error) {
      console.error("Shortlist delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Shortlists API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
