import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ school: null });
    }

    const { data: membership } = await supabase
      .from("school_members")
      .select("school_id, role")
      .eq("profile_id", profile.id)
      .limit(1)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ school: null });
    }

    const { data: school } = await supabase
      .from("schools")
      .select("id, name, slug, division, conference, city, state")
      .eq("id", membership.school_id)
      .single();

    return NextResponse.json({
      school: school || null,
      role: membership.role,
    });
  } catch (error) {
    console.error("Schools/me GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
