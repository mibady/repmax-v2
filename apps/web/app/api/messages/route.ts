import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/utils/rate-limit";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSubscription } from "@/lib/utils/subscription-server";
import { getRecruiterTier } from "@/lib/utils/subscription-tier";

const CreateMessageSchema = z.object({
  recipient_id: z.string().uuid(),
  subject: z.string().optional(),
  body: z.string().min(1).max(5000),
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder") || "inbox"; // inbox | sent

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success } = await rateLimit(user.id);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
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

    // Build query based on folder
    let query = supabase.from("messages").select(`
      *,
      sender:profiles!sender_id(id, full_name, avatar_url),
      recipient:profiles!recipient_id(id, full_name, avatar_url)
    `);

    if (folder === "inbox") {
      query = query.eq("recipient_id", profile.id);
    } else {
      query = query.eq("sender_id", profile.id);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Messages query error:", error);
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }

    // Count unread
    const { count: unreadCount } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", profile.id)
      .eq("read", false);

    return NextResponse.json({
      messages: data,
      unread_count: unreadCount || 0,
      profile_id: profile.id,
    });
  } catch (error) {
    console.error("Messages API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success: rateLimitOk } = await rateLimit(user.id);
    if (!rateLimitOk) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Enforce message limits for Recruiters
    if (profile.role === 'recruiter') {
      const sub = await getServerSubscription();
      const tier = getRecruiterTier(sub?.plan?.slug);
      
      if (tier === 'pro') {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("sender_id", profile.id)
          .gte("created_at", startOfMonth.toISOString());

        if ((count || 0) >= 50) {
          return NextResponse.json(
            { error: "Monthly message limit reached (50). Upgrade to Team for more." },
            { status: 403 }
          );
        }
      }
    }

    // Parse and validate body
    const body = await request.json();
    const parsed = CreateMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Check recipient exists
    const { data: recipient } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", parsed.data.recipient_id)
      .single();

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    // Create message
    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: profile.id,
        ...parsed.data,
      })
      .select()
      .single();

    if (error) {
      console.error("Message create error:", error);
      return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Messages API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Mark message as read
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("id");

    if (!messageId) {
      return NextResponse.json(
        { error: "Message id is required" },
        { status: 400 }
      );
    }

    // Get current user
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

    // Mark as read (RLS will ensure only recipient can do this)
    const { data, error } = await supabase
      .from("messages")
      .update({ read: true })
      .eq("id", messageId)
      .eq("recipient_id", profile?.id)
      .select()
      .single();

    if (error) {
      console.error("Message update error:", error);
      return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Messages API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
