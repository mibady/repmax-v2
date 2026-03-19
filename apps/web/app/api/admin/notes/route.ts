import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET - List notes with optional target_type filter
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (adminProfile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const targetType = searchParams.get("target_type");

    let query = supabase
      .from("admin_notes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (targetType && targetType !== "all") {
      query = query.eq("target_type", targetType);
    }

    const { data: notes, error } = await query;

    if (error) {
      console.error("Admin notes query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notes: notes || [] });
  } catch (error) {
    console.error("Error fetching admin notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// POST - Create a new note
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
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (adminProfile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { target_type, target_id, target_name, note_type, content, visibility, priority } = body;

    if (!target_type || !note_type || !content) {
      return NextResponse.json(
        { error: "target_type, note_type, and content are required" },
        { status: 400 }
      );
    }

    const { data: note, error } = await supabase
      .from("admin_notes")
      .insert({
        author_id: adminProfile.id,
        target_type,
        target_id: target_id || null,
        target_name: target_name || null,
        note_type,
        content,
        visibility: visibility || "admin_only",
        priority: priority || "normal",
      })
      .select()
      .single();

    if (error) {
      console.error("Admin note insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("Error creating admin note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
