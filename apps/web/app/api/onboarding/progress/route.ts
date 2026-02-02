import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateBodySchema = z.object({
  current_step: z.number().min(1).max(20).optional(),
  completed_steps: z.array(z.number()).optional(),
  collected_data: z.record(z.any()).optional(),
  chat_history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
    timestamp: z.string().optional(),
  })).optional(),
  completed: z.boolean().optional(),
});

// GET /api/onboarding/progress
// Returns the current user's onboarding progress
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get onboarding progress
    const { data: progress, error: progressError } = await supabase
      .from("onboarding_progress")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (progressError && progressError.code !== "PGRST116") {
      console.error("Error fetching onboarding progress:", progressError);
      return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
    }

    // If no progress exists, return default state
    if (!progress) {
      return NextResponse.json({
        exists: false,
        progress: {
          current_step: 1,
          completed_steps: [],
          collected_data: {},
          chat_history: [],
          started_at: null,
          completed_at: null,
        },
      });
    }

    return NextResponse.json({
      exists: true,
      progress: {
        id: progress.id,
        role: progress.role,
        current_step: progress.current_step,
        completed_steps: progress.completed_steps || [],
        collected_data: progress.collected_data || {},
        chat_history: progress.chat_history || [],
        started_at: progress.started_at,
        completed_at: progress.completed_at,
        last_interaction_at: progress.last_interaction_at,
      },
    });
  } catch (error) {
    console.error("Onboarding progress GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/onboarding/progress
// Update onboarding progress
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse body
    const body = await request.json();
    const data = updateBodySchema.parse(body);

    // Check if progress exists
    const { data: existing } = await supabase
      .from("onboarding_progress")
      .select("id, collected_data, completed_steps, chat_history")
      .eq("user_id", user.id)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {
      last_interaction_at: new Date().toISOString(),
    };

    if (data.current_step !== undefined) {
      updateData.current_step = data.current_step;
    }

    if (data.completed_steps !== undefined) {
      updateData.completed_steps = data.completed_steps;
    }

    if (data.collected_data !== undefined) {
      // Merge with existing data
      updateData.collected_data = {
        ...(existing?.collected_data || {}),
        ...data.collected_data,
      };
    }

    if (data.chat_history !== undefined) {
      // Append to existing history
      updateData.chat_history = [
        ...(existing?.chat_history || []),
        ...data.chat_history,
      ];
    }

    if (data.completed) {
      updateData.completed_at = new Date().toISOString();
    }

    if (existing) {
      // Update existing
      const { data: updated, error: updateError } = await supabase
        .from("onboarding_progress")
        .update(updateData)
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating onboarding progress:", updateError);
        return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
      }

      return NextResponse.json({ progress: updated });
    } else {
      // Get user's role from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      // Create new
      const { data: created, error: insertError } = await supabase
        .from("onboarding_progress")
        .insert({
          user_id: user.id,
          role: profile?.role || "athlete",
          current_step: data.current_step || 1,
          completed_steps: data.completed_steps || [],
          collected_data: data.collected_data || {},
          chat_history: data.chat_history || [],
          started_at: new Date().toISOString(),
          last_interaction_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating onboarding progress:", insertError);
        return NextResponse.json({ error: "Failed to create progress" }, { status: 500 });
      }

      return NextResponse.json({ progress: created }, { status: 201 });
    }
  } catch (error) {
    console.error("Onboarding progress PUT error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
