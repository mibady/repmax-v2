import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  due_date: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  athlete_id: z.string().uuid().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate body
    const body = await request.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Get user's profile and coach record
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data: coach } = await supabase
      .from("coaches")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (!coach) {
      return NextResponse.json({ error: "Coach profile not found" }, { status: 404 });
    }

    // Insert new task
    const { data: task, error: insertError } = await supabase
      .from("coach_tasks")
      .insert({
        coach_id: coach.id,
        title: parsed.data.title,
        description: parsed.data.description || null,
        due_date: parsed.data.due_date || null,
        priority: parsed.data.priority,
        status: "pending",
        athlete_id: parsed.data.athlete_id || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Coach task create error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        task: {
          id: task.id,
          title: task.title,
          description: task.description,
          dueDate: task.due_date,
          priority: task.priority,
          status: task.status,
          athleteId: task.athlete_id,
          createdAt: task.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Coach task create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
