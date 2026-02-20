import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const UpdateFlagSchema = z.object({
  id: z.string().uuid(),
  enabled: z.boolean(),
});

const CreateFlagSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  enabled: z.boolean().default(false),
});

async function getAdminProfile(supabase: Awaited<ReturnType<typeof createClient>>): Promise<{ id: string; role: string } | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "admin") return null;
  return profile;
}

// GET /api/admin/feature-flags - Get all feature flags
export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const profile = await getAdminProfile(supabase);
    if (!profile) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: flags, error } = await supabase
      .from("feature_flags")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching feature flags:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      flags: flags || [],
      total: flags?.length ?? 0,
      filtered: flags?.length ?? 0,
    });
  } catch (error) {
    console.error("Error fetching feature flags:", error);
    return NextResponse.json(
      { error: "Failed to fetch feature flags" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/feature-flags - Update a feature flag
export async function PUT(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const profile = await getAdminProfile(supabase);
    if (!profile) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = UpdateFlagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data: flag, error } = await supabase
      .from("feature_flags")
      .update({
        enabled: parsed.data.enabled,
        updated_by: profile.id,
      })
      .eq("id", parsed.data.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating feature flag:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ flag });
  } catch (error) {
    console.error("Error updating feature flag:", error);
    return NextResponse.json(
      { error: "Failed to update feature flag" },
      { status: 500 }
    );
  }
}

// POST /api/admin/feature-flags - Create a new feature flag
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const profile = await getAdminProfile(supabase);
    if (!profile) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = CreateFlagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data: flag, error } = await supabase
      .from("feature_flags")
      .insert({
        key: parsed.data.key,
        label: parsed.data.label,
        description: parsed.data.description || null,
        enabled: parsed.data.enabled,
        updated_by: profile.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating feature flag:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ flag }, { status: 201 });
  } catch (error) {
    console.error("Error creating feature flag:", error);
    return NextResponse.json(
      { error: "Failed to create feature flag" },
      { status: 500 }
    );
  }
}
