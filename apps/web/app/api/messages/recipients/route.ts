import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Role-based recipient eligibility
const ELIGIBLE_ROLES: Record<string, string[]> = {
  athlete: ["coach", "recruiter"],
  coach: ["athlete", "recruiter", "coach"],
  recruiter: ["athlete", "coach", "recruiter"],
  parent: ["coach", "recruiter"],
  admin: ["athlete", "coach", "recruiter", "parent", "club", "admin"],
  club: ["athlete", "coach"],
};

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const eligibleRoles = ELIGIBLE_ROLES[profile.role] || [];
    if (eligibleRoles.length === 0) {
      return NextResponse.json({ recipients: [] });
    }

    // Query profiles with eligible roles, excluding self
    let profileQuery = supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role")
      .in("role", eligibleRoles)
      .neq("id", profile.id)
      .order("full_name")
      .limit(30);

    if (query) {
      profileQuery = profileQuery.ilike("full_name", `%${query}%`);
    }

    const { data: profiles, error } = await profileQuery;
    if (error) {
      console.error("Error fetching recipients:", error);
      return NextResponse.json({ error: "Failed to fetch recipients" }, { status: 500 });
    }

    // Get organization info for coaches/recruiters
    const coachProfileIds = (profiles || [])
      .filter((p) => p.role === "coach" || p.role === "recruiter")
      .map((p) => p.id);

    const coachMap: Record<string, string> = {};
    if (coachProfileIds.length > 0) {
      const { data: coaches } = await supabase
        .from("coaches")
        .select("profile_id, school_name")
        .in("profile_id", coachProfileIds);

      if (coaches) {
        for (const c of coaches) {
          coachMap[c.profile_id] = c.school_name;
        }
      }
    }

    const recipients = (profiles || []).map((p) => ({
      id: p.id,
      name: p.full_name || "Unknown",
      organization: coachMap[p.id] || "",
      role: p.role,
      avatar: p.avatar_url,
      isCompliant: true,
    }));

    return NextResponse.json({ recipients });
  } catch (error) {
    console.error("Error in recipients API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
