import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type { ZoneCode } from "@/lib/data/zone-data";

// Type for zone assignment
export interface ZoneAssignment {
  id: string;
  recruiterId: string;
  recruiterName: string;
  imageUrl: string | null;
  zoneCode: ZoneCode;
  assignedAt: string;
}

// Default recruiter images for fallback
const DEFAULT_RECRUITER_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCKMNfqhA3Y4K2Vn2GsO-4YnZUEcLaYlsKsFb6-9RX7cwPs7KHrDDxd1IzNd_rE6oZUFuHtzN0Zm3KuSa2mOsc8JmfSl6SLCg7JttYVwdNmEIWycK_yTAZ3H7d611SQq8mQ3JwdGU3Ge0dXTZcHfhBfV_uu8l94ikNV-Q_JGZ5mi_7MbhPis_48TJzii1S50BzrMcH78FzOm6lgDlJk6ynXlo07YSUjS2TOB8gJW1aze8jeyX5KbWaN5kYVGWcx9GqX2m9jYgJvZBk",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAjRlwOrXtxqF1rl9lXKlYANtartnTjvfLYqDT7j88FLnbk3s58fB6NaHynF8qJ_f3DIj2RIX20I-REbxJiKkLyQTwPJ-UsCDV2MT9eeDvPy0LmS_tXn1ky8dUlIups6X3obeT0pQ7a9B45apFvSqSxRH-Yxagw37OZ_TaEaiKPG5aIvzsmLFcZAjK7O7urbi8gP-jWhPhloL8aN0J-pO-aM6UT1Ow4evaFr5DadFdKyvwxVX1bmgKUKlIW-kXS89Y3Mun5STiBDGk",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDDgdm8Sgd36Hp-GHBtvczhEJH4wBSZL9mcfIAqIXSFMTCiX9LXzAWonlengRglghwwvSEArAi-3eZmXuvxSDY9o1fI4WJBMokuJUDNDPH-ty4aqZqeQwtIBZrUSTH8OMB3SIivaimgTMWgMc0bqEHiXvaF-kzyWvzfTmvQoz1gR09wO-HjKoL7xpxosNAAKKN_wuWtuZASXqeTprF-54OieQ5nbVhBqdo1QkyS6D6YKqWKs0sOllUf7AINPxGhUpfRa2ydNgaafJg",
];

// Mock zone assignments based on coach/recruiter index
// In production, this would come from a zone_assignments table
const ZONE_ORDER: ZoneCode[] = ["SOUTHWEST", "WEST", "SOUTHEAST", "MIDWEST", "NORTHEAST", "PLAINS"];

function getPlaceholderImage(index: number): string {
  return DEFAULT_RECRUITER_IMAGES[index % DEFAULT_RECRUITER_IMAGES.length];
}

// GET /api/recruiter/assignments - Get all zone assignments
export async function GET() {
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

    // Fetch all coach/recruiter profiles
    const { data: coaches, error: coachError } = await supabase
      .from("coaches")
      .select(`
        id,
        profile_id,
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

    // Build zone assignments by mapping coaches to zones
    // This simulates what would come from a zone_assignments table
    const assignments: Record<string, ZoneAssignment> = {};

    if (coaches && coaches.length > 0) {
      // Assign the first few coaches to zones based on their index
      coaches.slice(0, 3).forEach((coach, index) => {
        // Supabase returns joined data as an array, get the first item
        const profileData = coach.profile as unknown;
        const coachProfile = Array.isArray(profileData)
          ? profileData[0] as { id: string; full_name: string; avatar_url: string | null } | undefined
          : profileData as { id: string; full_name: string; avatar_url: string | null } | null;
        const zoneCode = ZONE_ORDER[index];

        if (coachProfile && zoneCode) {
          assignments[zoneCode] = {
            id: `assignment-${coach.id}-${zoneCode}`,
            recruiterId: coach.id,
            recruiterName: coachProfile.full_name || `Coach ${index + 1}`,
            imageUrl: coachProfile.avatar_url || getPlaceholderImage(index),
            zoneCode,
            assignedAt: new Date().toISOString(),
          };
        }
      });
    }

    // If no coaches found, return empty assignments
    // The UI will show all zones as unassigned

    // Also return available recruiters for the assignment dropdown
    const availableRecruiters = (coaches || []).map((coach, index) => {
      // Supabase returns joined data as an array, get the first item
      const profileData = coach.profile as unknown;
      const coachProfile = Array.isArray(profileData)
        ? profileData[0] as { id: string; full_name: string; avatar_url: string | null } | undefined
        : profileData as { id: string; full_name: string; avatar_url: string | null } | null;
      return {
        id: coach.id,
        name: coachProfile?.full_name || `Coach ${index + 1}`,
        imageUrl: coachProfile?.avatar_url || getPlaceholderImage(index),
        title: coach.title || "Recruiting Coordinator",
        school: coach.school_name,
      };
    });

    return NextResponse.json({
      assignments,
      availableRecruiters,
      lastSaved: new Date().toISOString(),
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
export async function POST(request: NextRequest) {
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
        { error: "Only coaches or admins can manage territory assignments" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, zoneCode, recruiterId } = body;

    if (!action || !zoneCode) {
      return NextResponse.json(
        { error: "Missing required fields: action and zoneCode" },
        { status: 400 }
      );
    }

    // In a real implementation, this would update a zone_assignments table
    // For now, we simulate success

    if (action === "assign") {
      if (!recruiterId) {
        return NextResponse.json(
          { error: "Missing recruiterId for assign action" },
          { status: 400 }
        );
      }

      // Would insert/update zone_assignments table
      return NextResponse.json({
        success: true,
        message: `Recruiter assigned to ${zoneCode}`,
        assignment: {
          id: `assignment-${recruiterId}-${zoneCode}`,
          recruiterId,
          zoneCode,
          assignedAt: new Date().toISOString(),
        },
      });
    } else if (action === "remove") {
      // Would delete from zone_assignments table
      return NextResponse.json({
        success: true,
        message: `Assignment removed from ${zoneCode}`,
      });
    } else if (action === "save_all") {
      const { assignments } = body;
      if (!assignments) {
        return NextResponse.json(
          { error: "Missing assignments for save_all action" },
          { status: 400 }
        );
      }

      // Would batch update zone_assignments table
      return NextResponse.json({
        success: true,
        message: "All assignments saved",
        savedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Assignments POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
