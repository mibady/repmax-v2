import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const AssignmentSchema = z.object({
  zone: z.string().min(1),
  recruiter_id: z.string().uuid(),
});

// GET /api/recruiter/assignments - Get all zone assignments
export async function GET(request: NextRequest): Promise<NextResponse> {
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

    // Get zone filter if present
    const zone = request.nextUrl.searchParams.get("zone");

    // Query zone_assignments with recruiter and profile join
    let assignmentQuery = supabase
      .from("zone_assignments")
      .select(`
        id,
        zone,
        created_at,
        recruiter:coaches!recruiter_id(
          id,
          school_name,
          title,
          profile:profiles!profile_id(full_name, email, avatar_url)
        )
      `);

    if (zone) {
      assignmentQuery = assignmentQuery.eq("zone", zone);
    }

    const { data: assignments, error: assignmentError } = await assignmentQuery;

    if (assignmentError) {
      console.error("Zone assignments query error:", assignmentError);
      return NextResponse.json({ error: assignmentError.message }, { status: 500 });
    }

    // Group assignments by zone
    const grouped: Record<string, Array<{
      id: string;
      name: string;
      imageUrl: string | null;
      title: string;
      school: string;
    }>> = {};

    for (const assignment of assignments || []) {
      const recruiter = assignment.recruiter as unknown as {
        id: string;
        user_id: string;
        school_name: string | null;
        title: string | null;
        profile: { full_name: string | null; email: string | null; avatar_url: string | null } | null;
      } | null;

      if (!recruiter) continue;

      const recruiterProfile = recruiter.profile;

      if (!grouped[assignment.zone]) {
        grouped[assignment.zone] = [];
      }

      grouped[assignment.zone].push({
        id: recruiter.id,
        name: recruiterProfile?.full_name || recruiterProfile?.email || "Unknown",
        imageUrl: recruiterProfile?.avatar_url || null,
        title: recruiter.title || "Recruiting Coordinator",
        school: recruiter.school_name || "",
      });
    }

    // Fetch available recruiters (coaches not yet assigned to the requested zone)
    const coachQuery = supabase
      .from("coaches")
      .select(`
        id,
        school_name,
        title,
        profile:profiles!user_id(id, full_name, avatar_url)
      `)
      .order("created_at", { ascending: true })
      .limit(50);

    // If a zone filter was provided, exclude coaches already assigned to that zone
    const assignedRecruiterIds = zone && grouped[zone]
      ? grouped[zone].map((r) => r.id)
      : [];

    if (assignedRecruiterIds.length > 0) {
      // Filter out already-assigned recruiters client-side since not.in may not be supported for all types
      const { data: coaches, error: coachError } = await coachQuery;

      if (coachError) {
        console.error("Coach query error:", coachError);
        return NextResponse.json({ error: coachError.message }, { status: 500 });
      }

      const availableRecruiters = (coaches || [])
        .filter((c) => !assignedRecruiterIds.includes(c.id))
        .map((coach) => {
          const profileData = coach.profile as unknown;
          const coachProfile = Array.isArray(profileData)
            ? profileData[0] as { id: string; full_name: string; avatar_url: string | null } | undefined
            : profileData as { id: string; full_name: string; avatar_url: string | null } | null;
          return {
            id: coach.id,
            name: coachProfile?.full_name || "Unknown",
            imageUrl: coachProfile?.avatar_url || null,
            title: coach.title || "Recruiting Coordinator",
            school: coach.school_name || "",
          };
        });

      return NextResponse.json({
        assignments: grouped,
        availableRecruiters,
      });
    }

    const { data: coaches, error: coachError } = await coachQuery;

    if (coachError) {
      console.error("Coach query error:", coachError);
      return NextResponse.json({ error: coachError.message }, { status: 500 });
    }

    const availableRecruiters = (coaches || []).map((coach) => {
      const profileData = coach.profile as unknown;
      const coachProfile = Array.isArray(profileData)
        ? profileData[0] as { id: string; full_name: string; avatar_url: string | null } | undefined
        : profileData as { id: string; full_name: string; avatar_url: string | null } | null;
      return {
        id: coach.id,
        name: coachProfile?.full_name || "Unknown",
        imageUrl: coachProfile?.avatar_url || null,
        title: coach.title || "Recruiting Coordinator",
        school: coach.school_name || "",
      };
    });

    return NextResponse.json({
      assignments: grouped,
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

// POST /api/recruiter/assignments - Create or update zone assignment
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = AssignmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Upsert zone assignment
    const { data: assignment, error } = await supabase
      .from("zone_assignments")
      .upsert(
        {
          zone: parsed.data.zone,
          recruiter_id: parsed.data.recruiter_id,
          assigned_by: profile.id,
          assigned_at: new Date().toISOString(),
        },
        { onConflict: "zone,recruiter_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Zone assignment upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    console.error("Assignments API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
