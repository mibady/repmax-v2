import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const markReadSchema = z.union([
  z.object({ id: z.string().uuid() }),
  z.object({ all: z.literal(true) }),
]);

export async function GET(): Promise<NextResponse> {
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

    const { data: notifications, error: fetchError } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (fetchError) {
      console.error("Notifications fetch error:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    return NextResponse.json({ notifications: notifications || [] });
  } catch (error) {
    console.error("Notifications GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
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
    const parsed = markReadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if ("all" in parsed.data) {
      // Mark all unread notifications as read
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (updateError) {
        console.error("Mark all read error:", updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    } else {
      // Mark single notification as read
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", parsed.data.id)
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Mark read error:", updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notifications PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
