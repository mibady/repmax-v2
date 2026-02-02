import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "all";
    const _status = searchParams.get("status") || "all"; // eslint-disable-line @typescript-eslint/no-unused-vars
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" });

    // Apply search filter
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply role filter
    if (role !== "all") {
      query = query.eq("role", role);
    }

    // Apply status filter (we'll treat suspended as a flag)
    // For now, all users are considered active unless we add a status column
    // This could be enhanced with a proper status column

    // Add pagination and ordering
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: users, count, error: usersError } = await query;

    if (usersError) {
      throw usersError;
    }

    // Get stats
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Get today's active (simplified - users who logged in today or have recent activity)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: activeToday } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("updated_at", today.toISOString());

    // Get new signups in last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const { count: newSignups } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", yesterday.toISOString());

    // Transform users for the frontend
    const transformedUsers = users?.map((u) => ({
      id: u.id,
      name: u.full_name || "Unknown User",
      email: u.email || "",
      roles: [u.role || "athlete"],
      joinedDate: new Date(u.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      lastActive: getLastActiveText(u.updated_at),
      isOnlineNow: isOnlineNow(u.updated_at),
      status: "active" as const, // Default to active; add status column for real implementation
      imageUrl: u.avatar_url || "",
    }));

    return NextResponse.json({
      users: transformedUsers || [],
      stats: {
        totalUsers: totalUsers || 0,
        activeToday: activeToday || 0,
        newSignups: newSignups || 0,
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

function getLastActiveText(updatedAt: string): string {
  const now = new Date();
  const updated = new Date(updatedAt);
  const diffMs = now.getTime() - updated.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 5) return "Active now";
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays} days ago`;
  return updated.toLocaleDateString();
}

function isOnlineNow(updatedAt: string): boolean {
  const now = new Date();
  const updated = new Date(updatedAt);
  const diffMins = (now.getTime() - updated.getTime()) / (1000 * 60);
  return diffMins < 5;
}

// PATCH - Update user status or role
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, role, status: _status } = body; // eslint-disable-line @typescript-eslint/no-unused-vars

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (role) updates.role = role;
    // Add status updates when status column exists

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
