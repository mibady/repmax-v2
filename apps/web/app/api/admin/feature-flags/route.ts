import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/admin/feature-flags - Get all feature flags
export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // TODO: Create feature_flags table
    return NextResponse.json({ flags: [], total: 0, filtered: 0 });
  } catch (error) {
    console.error("Error fetching feature flags:", error);
    return NextResponse.json(
      { error: "Failed to fetch feature flags" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/feature-flags - Update a feature flag
export async function PUT(): Promise<NextResponse> {
  return NextResponse.json({ error: "Feature flags not yet implemented" }, { status: 501 });
}

// POST /api/admin/feature-flags - Create a new feature flag
export async function POST(): Promise<NextResponse> {
  return NextResponse.json({ error: "Feature flags not yet implemented" }, { status: 501 });
}
