import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export interface ModerationItem {
  id: string;
  user: {
    id: string;
    name: string;
    imageUrl: string;
  };
  type: "photo" | "bio" | "film";
  flagReason: string;
  content?: string;
  reportedAt: string;
  reportedAgo: string;
  status: "pending" | "approved" | "warned" | "removed";
  matchConfidence?: string;
}

export interface ModerationStats {
  totalFlagged: number;
  pendingReview: number;
  resolvedToday: number;
}

const ActionSchema = z.object({
  itemId: z.string().uuid(),
  action: z.enum(["approve", "warn", "remove"]),
  contentType: z.string().optional(),
  userId: z.string().uuid().optional(),
});

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
}

// GET - Fetch moderation queue items
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

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "all";
    const status = searchParams.get("status") || "pending";

    // Query moderation_queue with profile join
    let query = supabase
      .from("moderation_queue")
      .select("*, user:profiles!user_id(full_name, avatar_url)")
      .order("created_at", { ascending: false });

    if (type !== "all") {
      query = query.eq("content_type", type);
    }
    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data: queueItems, error } = await query;

    if (error) {
      console.error("Moderation queue query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform DB rows to API shape
    const items: ModerationItem[] = (queueItems || []).map((item) => {
      const userProfile = item.user as unknown as {
        full_name: string | null;
        avatar_url: string | null;
      } | null;

      return {
        id: item.id,
        user: {
          id: item.user_id,
          name: userProfile?.full_name || "Unknown",
          imageUrl: userProfile?.avatar_url || "",
        },
        type: item.content_type as "photo" | "bio" | "film",
        flagReason: item.reason || "Flagged for review",
        content: item.content_ref || undefined,
        reportedAt: item.created_at,
        reportedAgo: getTimeAgo(item.created_at),
        status: item.status as "pending" | "approved" | "warned" | "removed",
        matchConfidence: undefined,
      };
    });

    // Stats: count by status
    const { count: totalCount } = await supabase
      .from("moderation_queue")
      .select("*", { count: "exact", head: true });

    const { count: pendingCount } = await supabase
      .from("moderation_queue")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count: resolvedTodayCount } = await supabase
      .from("moderation_queue")
      .select("*", { count: "exact", head: true })
      .neq("status", "pending")
      .gte("resolved_at", todayStart.toISOString());

    const stats: ModerationStats = {
      totalFlagged: totalCount || 0,
      pendingReview: pendingCount || 0,
      resolvedToday: resolvedTodayCount || 0,
    };

    return NextResponse.json({
      items,
      stats,
    });
  } catch (error) {
    console.error("Error fetching moderation queue:", error);
    return NextResponse.json(
      { error: "Failed to fetch moderation queue" },
      { status: 500 }
    );
  }
}

// POST - Update moderation status (approve/warn/remove)
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
    const parsed = ActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { itemId, action, contentType, userId } = parsed.data;

    // Map action to status
    const statusMap: Record<string, string> = {
      approve: "approved",
      warn: "warned",
      remove: "removed",
    };

    // Update moderation_queue record
    const { error: updateError } = await supabase
      .from("moderation_queue")
      .update({
        status: statusMap[action],
        resolved_by: adminProfile.id,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", itemId);

    if (updateError) {
      console.error("Moderation update error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // For 'remove' action, also delete/hide the content
    if (action === "remove" && contentType && userId) {
      if (contentType === "bio") {
        await supabase
          .from("profiles")
          .update({ bio: null })
          .eq("id", userId);
      } else if (contentType === "photo") {
        await supabase
          .from("profiles")
          .update({ avatar_url: null })
          .eq("id", userId);
      } else if (contentType === "film") {
        await supabase
          .from("highlights")
          .delete()
          .eq("id", itemId);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Content ${statusMap[action]} successfully`,
    });
  } catch (error) {
    console.error("Error processing moderation action:", error);
    return NextResponse.json(
      { error: "Failed to process moderation action" },
      { status: 500 }
    );
  }
}
