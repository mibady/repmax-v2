import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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

// GET - Fetch moderation queue items
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (adminProfile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "all";
    const status = searchParams.get("status") || "pending";

    // In a real implementation, we would have a moderation_queue table
    // For now, we'll return an empty array with the proper structure
    // This could be enhanced by scanning profiles/highlights for flagged content

    // Attempt to query profiles for any that might have been flagged
    // This is a placeholder - in production you'd have a proper moderation_flags table
    let items: ModerationItem[] = [];

    // TODO: Create moderation_queue table for proper content moderation
    // Currently returns empty — no moderation_flags table exists yet

    // Filter by type if specified
    if (type !== "all" && items.length > 0) {
      items = items.filter((item) => item.type === type);
    }

    // Filter by status
    if (status !== "all" && items.length > 0) {
      items = items.filter((item) => item.status === status);
    }

    // Calculate stats
    const stats: ModerationStats = {
      totalFlagged: items.length,
      pendingReview: items.filter((i) => i.status === "pending").length,
      resolvedToday: 0, // Would need proper tracking
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
export async function POST(request: NextRequest) {
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
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (adminProfile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { itemId, action, contentType, userId } = body;

    if (!itemId || !action) {
      return NextResponse.json(
        { error: "Item ID and action are required" },
        { status: 400 }
      );
    }

    if (!["approve", "warn", "remove"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be approve, warn, or remove" },
        { status: 400 }
      );
    }

    // In a real implementation, we would:
    // 1. Update the moderation_queue table with the action
    // 2. If action is 'remove', delete/hide the content
    // 3. If action is 'warn', send a notification to the user
    // 4. Log the moderation action for audit trail

    // Approve and warn are not yet implemented
    if (action === "approve" || action === "warn") {
      return NextResponse.json({ error: `${action} action not yet implemented` }, { status: 501 });
    }

    if (action === "remove" && contentType && userId) {
      // Remove content based on type
      if (contentType === "bio") {
        // Clear the bio field
        await supabase
          .from("profiles")
          .update({ bio: null })
          .eq("id", userId);
      } else if (contentType === "photo") {
        // Remove avatar
        await supabase
          .from("profiles")
          .update({ avatar_url: null })
          .eq("id", userId);
      } else if (contentType === "film") {
        // Delete highlight
        await supabase
          .from("highlights")
          .delete()
          .eq("id", itemId);
      }
    }

    // Log the moderation action (would go to audit_log table in production)
    console.log(`Moderation action: ${action} on item ${itemId} by ${user.id}`);

    return NextResponse.json({
      success: true,
      message: `Content ${action}d successfully`,
    });
  } catch (error) {
    console.error("Error processing moderation action:", error);
    return NextResponse.json(
      { error: "Failed to process moderation action" },
      { status: 500 }
    );
  }
}
