import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (adminProfile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, city, state } = body;

    if (!name || !city || !state) {
      return NextResponse.json(
        { error: "School name, city, and state are required" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Create school record (columns: name, slug, city, state, created_by)
    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .insert({
        name,
        slug,
        city,
        state,
        created_by: adminProfile.id,
      })
      .select()
      .single();

    if (schoolError) {
      return NextResponse.json(
        { error: schoolError.message },
        { status: 500 }
      );
    }

    // Add admin as school member with 'admin' role
    await supabase.from("school_members").insert({
      school_id: school.id,
      profile_id: adminProfile.id,
      role: "admin",
    });

    return NextResponse.json(
      { school_id: school.id, school_name: school.name },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
