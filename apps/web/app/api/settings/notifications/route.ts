import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

// GET /api/settings/notifications - Get user's notification preferences
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get notification preferences
    // eslint-disable-next-line prefer-const
    let { data: preferences, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", profile.id)
      .single();

    // If no preferences exist, create default ones
    if (!preferences) {
      const { data: newPrefs, error: insertError } = await supabase
        .from("notification_preferences")
        .insert({ user_id: profile.id })
        .select()
        .single();

      if (insertError) {
        console.error("Failed to create default preferences:", insertError);
        return NextResponse.json(
          { error: "Failed to create preferences" },
          { status: 500 }
        );
      }

      preferences = newPrefs;
    }

    if (error && !preferences) {
      console.error("Preferences query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to frontend format
    const settings = {
      push: {
        profileViews: preferences.profile_view_push,
        newOffers: preferences.shortlist_add_push, // mapped from shortlist
        shortlist: preferences.shortlist_add_push,
        messages: preferences.staff_messages_push,
        calendar: preferences.schedule_changes_push,
      },
      email: {
        digest: preferences.weekly_summary_email,
        digestFrequency: preferences.weekly_summary_email
          ? "weekly"
          : "never",
        deadlines: preferences.signing_deadlines_email,
        marketing: preferences.monthly_stats_email,
      },
      inApp: {
        badge: true, // Not stored in DB, default to true
        sounds: false, // Not stored in DB, default to false
      },
      quietHours: {
        enabled: preferences.quiet_hours_enabled,
        from: preferences.quiet_hours_start || "22:00",
        to: preferences.quiet_hours_end || "07:00",
      },
    };

    return NextResponse.json({ preferences: settings });
  } catch (error) {
    console.error("Notification preferences GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/settings/notifications - Update user's notification preferences
const updateSchema = z.object({
  push: z
    .object({
      profileViews: z.boolean().optional(),
      newOffers: z.boolean().optional(),
      shortlist: z.boolean().optional(),
      messages: z.boolean().optional(),
      calendar: z.boolean().optional(),
    })
    .optional(),
  email: z
    .object({
      digest: z.boolean().optional(),
      digestFrequency: z.enum(["daily", "weekly", "monthly", "never"]).optional(),
      deadlines: z.boolean().optional(),
      marketing: z.boolean().optional(),
    })
    .optional(),
  inApp: z
    .object({
      badge: z.boolean().optional(),
      sounds: z.boolean().optional(),
    })
    .optional(),
  quietHours: z
    .object({
      enabled: z.boolean().optional(),
      from: z.string().optional(),
      to: z.string().optional(),
    })
    .optional(),
});

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Parse body
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updates = parsed.data;

    // Build database update object
    const dbUpdates: Record<string, unknown> = {};

    if (updates.push) {
      if (updates.push.profileViews !== undefined) {
        dbUpdates.profile_view_push = updates.push.profileViews;
      }
      if (updates.push.shortlist !== undefined) {
        dbUpdates.shortlist_add_push = updates.push.shortlist;
      }
      if (updates.push.newOffers !== undefined) {
        dbUpdates.shortlist_add_push = updates.push.newOffers;
      }
      if (updates.push.messages !== undefined) {
        dbUpdates.staff_messages_push = updates.push.messages;
      }
      if (updates.push.calendar !== undefined) {
        dbUpdates.schedule_changes_push = updates.push.calendar;
      }
    }

    if (updates.email) {
      if (updates.email.digest !== undefined) {
        dbUpdates.weekly_summary_email = updates.email.digest;
      }
      if (updates.email.deadlines !== undefined) {
        dbUpdates.signing_deadlines_email = updates.email.deadlines;
      }
      if (updates.email.marketing !== undefined) {
        dbUpdates.monthly_stats_email = updates.email.marketing;
      }
    }

    if (updates.quietHours) {
      if (updates.quietHours.enabled !== undefined) {
        dbUpdates.quiet_hours_enabled = updates.quietHours.enabled;
      }
      if (updates.quietHours.from !== undefined) {
        dbUpdates.quiet_hours_start = updates.quietHours.from;
      }
      if (updates.quietHours.to !== undefined) {
        dbUpdates.quiet_hours_end = updates.quietHours.to;
      }
    }

    // Update preferences
    const { error } = await supabase
      .from("notification_preferences")
      .upsert({
        user_id: profile.id,
        ...dbUpdates,
      });

    if (error) {
      console.error("Preferences update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notification preferences PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
