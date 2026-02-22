import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { requireRecruiterTier } from "@/lib/utils/subscription-server";

const updateSchema = z.object({
  priority: z.enum(["low", "medium", "high", "top"]).optional(),
  notes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { authorized } = await requireRecruiterTier("pro");
    if (!authorized) {
      return NextResponse.json({ error: "Pro recruiter subscription required" }, { status: 403 });
    }

    const { id } = await params;
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate body
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Get user's profile and coach record
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data: coach } = await supabase
      .from("coaches")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (!coach) {
      return NextResponse.json({ error: "Coach profile not found" }, { status: 404 });
    }

    // Update the shortlist entry (ownership enforced by coach_id match)
    const { data: shortlist, error: updateError } = await supabase
      .from("shortlists")
      .update({
        ...parsed.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("coach_id", coach.id)
      .select()
      .single();

    if (updateError || !shortlist) {
      return NextResponse.json(
        { error: "Shortlist entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ shortlist });
  } catch (error) {
    console.error("Shortlist update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
