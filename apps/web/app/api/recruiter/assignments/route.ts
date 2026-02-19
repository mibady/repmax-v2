import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/recruiter/assignments - Get all zone assignments
export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the user is a coach/recruiter/admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.role !== "coach" && profile.role !== "recruiter" && profile.role !== "admin") {
      return NextResponse.json(
        { error: "Only coaches or admins can view territory assignments" },
        { status: 403 }
      );
    }

    // TODO: Create zone_assignments table for persistent zone-to-recruiter mapping
    // For now, return empty assignments — the UI will show all zones as unassigned

    // Return available recruiters for the assignment dropdown
    const { data: coaches, error: coachError } = await supabase
      .from("coaches")
      .select(`
        id,
        school_name,
        title,
        profile:profiles(id, full_name, avatar_url)
      `)
      .order("created_at", { ascending: true })
      .limit(10);

    if (coachError) {
      console.error("Coach query error:", coachError);
      return NextResponse.json({ error: coachError.message }, { status: 500 });
    }

    const availableRecruiters = (coaches || []).map((coach, index) => {
      const profileData = coach.profile as unknown;
      const coachProfile = Array.isArray(profileData)
        ? profileData[0] as { id: string; full_name: string; avatar_url: string | null } | undefined
        : profileData as { id: string; full_name: string; avatar_url: string | null } | null;
      return {
        id: coach.id,
        name: coachProfile?.full_name || `Coach ${index + 1}`,
        imageUrl: coachProfile?.avatar_url || null,
        title: coach.title || "Recruiting Coordinator",
        school: coach.school_name,
      };
    });

    return NextResponse.json({
      assignments: {},
      availableRecruiters,
    });
  } catch (error) {
    console.error("Assignments API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/recruiter/assignments - Create or update zone assignments
export async function POST(): Promise<NextResponse> {
  return NextResponse.json({ error: "Zone assignments not yet implemented" }, { status: 501 });
}
