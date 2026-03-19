import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

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

    const athleteId = await getAthleteId(supabase, user.id);

    if (!athleteId) {
      return NextResponse.json({ offers: [] });
    }

    const { data: offers, error } = await supabase
      .from("offers")
      .select("*")
      .eq("athlete_id", athleteId)
      .order("offer_date", { ascending: false });

    if (error) {
      console.error("Error fetching offers:", error);
      return NextResponse.json(
        { error: "Failed to fetch offers" },
        { status: 500 }
      );
    }

    return NextResponse.json({ offers: offers || [] });
  } catch (error) {
    console.error("Error in athlete offers API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const offerSchema = z.object({
  school_name: z.string().min(1, "School name is required"),
  division: z.string().min(1, "Division is required"),
  scholarship_type: z.string().nullable().optional(),
  offer_date: z.string().min(1, "Offer date is required"),
  committed: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const athleteId = await getAthleteId(supabase, user.id);
    if (!athleteId) return NextResponse.json({ error: "Athlete not found" }, { status: 404 });

    const body = await req.json();
    const parsed = offerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    // If committing, un-commit any existing committed offer
    if (parsed.data.committed) {
      await supabase
        .from("offers")
        .update({ committed: false })
        .eq("athlete_id", athleteId)
        .eq("committed", true);
    }

    const { data, error } = await supabase
      .from("offers")
      .insert({
        athlete_id: athleteId,
        ...parsed.data,
        scholarship_type: parsed.data.scholarship_type || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating offer:", error);
      return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
    }

    return NextResponse.json({ offer: data }, { status: 201 });
  } catch (error) {
    console.error("Error in offers POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const offerUpdateSchema = z.object({
  id: z.string().uuid(),
  school_name: z.string().min(1).optional(),
  division: z.string().min(1).optional(),
  scholarship_type: z.string().nullable().optional(),
  offer_date: z.string().optional(),
  committed: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const athleteId = await getAthleteId(supabase, user.id);
    if (!athleteId) return NextResponse.json({ error: "Athlete not found" }, { status: 404 });

    const body = await req.json();
    const parsed = offerUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const { id, ...updates } = parsed.data;

    // If committing, un-commit any existing committed offer
    if (updates.committed) {
      await supabase
        .from("offers")
        .update({ committed: false })
        .eq("athlete_id", athleteId)
        .eq("committed", true);
    }

    const { data, error } = await supabase
      .from("offers")
      .update(updates)
      .eq("id", id)
      .eq("athlete_id", athleteId)
      .select()
      .single();

    if (error) {
      console.error("Error updating offer:", error);
      return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
    }

    return NextResponse.json({ offer: data });
  } catch (error) {
    console.error("Error in offers PATCH:", error);
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
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Offer ID required" }, { status: 400 });

    const { error } = await supabase
      .from("offers")
      .delete()
      .eq("id", id)
      .eq("athlete_id", athleteId);

    if (error) {
      console.error("Error deleting offer:", error);
      return NextResponse.json({ error: "Failed to delete offer" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in offers DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
