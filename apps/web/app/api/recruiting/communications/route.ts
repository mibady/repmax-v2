import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get coach info
    const { data: coach } = await supabase
      .from("coaches")
      .select("id, school_name")
      .eq("profile_id", profile.id)
      .single();

    if (!coach) {
      return NextResponse.json(
        { error: "Only coaches can view communications" },
        { status: 403 }
      );
    }

    // Get all coaches from the same school (team members/staff)
    const { data: teamCoaches } = await supabase
      .from("coaches")
      .select(`
        id,
        profile:profiles!coaches_profile_id_fkey(
          id,
          full_name
        )
      `)
      .eq("school_name", coach.school_name);

    // Build staff members list
    // Note: Supabase returns relations as arrays even for single relations
    const staffMembers = (teamCoaches || [])
      .map((c) => {
        const profileData = c.profile;
        const coachProfile = Array.isArray(profileData) ? profileData[0] : profileData;
        return {
          id: coachProfile?.id || "",
          name: coachProfile?.full_name || "Unknown",
        };
      })
      .filter((s) => s.id && s.name);

    // If no team members found, at least include the current user
    if (staffMembers.length === 0) {
      staffMembers.push({
        id: profile.id,
        name: profile.full_name || "You",
      });
    }

    // Get URL params for filtering
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get("type");
    const searchQuery = searchParams.get("search");
    const staffFilter = searchParams.get("staff");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Get all messages sent or received by this profile
    // These represent communication logs
    let query = supabase
      .from("messages")
      .select(
        `
        id,
        subject,
        body,
        created_at,
        sender:profiles!messages_sender_id_fkey(
          id,
          full_name,
          avatar_url
        ),
        recipient:profiles!messages_recipient_id_fkey(
          id,
          full_name,
          avatar_url
        )
      `,
        { count: "exact" }
      )
      .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
      .order("created_at", { ascending: false });

    // Apply search filter
    if (searchQuery) {
      query = query.or(
        `body.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%`
      );
    }

    // Apply date range filters
    if (dateFrom) {
      query = query.gte("created_at", dateFrom);
    }
    if (dateTo) {
      // Add one day to include the entire end date
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt("created_at", endDate.toISOString().split("T")[0]);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: messages, count, error } = await query;

    if (error) {
      console.error("Error fetching communications:", error);
      return NextResponse.json(
        { error: "Failed to fetch communications" },
        { status: 500 }
      );
    }

    // Transform messages into communication logs
    const logs = (messages || []).map((msg) => {
      // Handle Supabase relation arrays
      const senderData = msg.sender;
      const recipientData = msg.recipient;
      const sender = Array.isArray(senderData) ? senderData[0] : senderData;
      const recipient = Array.isArray(recipientData) ? recipientData[0] : recipientData;

      // Determine if this is an incoming or outgoing message
      const isIncoming = recipient?.id === profile.id;
      const otherParty = isIncoming ? sender : recipient;

      // Generate initials
      const initials = otherParty?.full_name
        ?.split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "??";

      // Generate a consistent gradient based on the name
      const gradients = [
        { from: "from-blue-600", to: "to-indigo-800" },
        { from: "from-purple-600", to: "to-pink-800" },
        { from: "from-orange-600", to: "to-red-800" },
        { from: "from-teal-600", to: "to-cyan-800" },
        { from: "from-yellow-600", to: "to-red-600" },
        { from: "from-green-600", to: "to-emerald-800" },
      ];
      const gradientIndex =
        (otherParty?.full_name?.charCodeAt(0) || 0) % gradients.length;
      const gradient = gradients[gradientIndex];

      // Determine communication type based on subject or content
      let type: "call" | "visit" | "email" | "message" = "message";
      const subject = msg.subject?.toLowerCase() || "";
      const body = msg.body?.toLowerCase() || "";

      if (subject.includes("call") || body.includes("called")) {
        type = "call";
      } else if (
        subject.includes("visit") ||
        body.includes("visit") ||
        body.includes("campus")
      ) {
        type = "visit";
      } else if (subject.includes("email") || msg.subject) {
        type = "email";
      }

      // Format datetime
      const date = new Date(msg.created_at);
      const datetime = date.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      // Determine staff member (the sender for outgoing, current user for incoming)
      const staffPerson = isIncoming
        ? { name: profile.full_name || "You", id: profile.id }
        : { name: sender?.full_name || profile.full_name || "You", id: sender?.id || profile.id };

      const staffInitials = staffPerson.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "ME";

      return {
        id: msg.id,
        prospect: {
          id: otherParty?.id || "",
          name: otherParty?.full_name || "Unknown",
          initials,
          gradientFrom: gradient.from,
          gradientTo: gradient.to,
          classYear: "Prospect", // Would need athlete table join for real class year
        },
        type,
        summary: msg.body.slice(0, 150) + (msg.body.length > 150 ? "..." : ""),
        staff: {
          id: staffPerson.id,
          name: staffPerson.name,
          initials: staffInitials,
        },
        datetime,
        direction: isIncoming ? "incoming" : "outgoing",
      };
    });

    // Apply type filter after transformation (since type is computed)
    let filteredLogs = typeFilter
      ? logs.filter((log) => log.type === typeFilter)
      : logs;

    // Apply staff filter after transformation
    if (staffFilter) {
      filteredLogs = filteredLogs.filter((log) => log.staff.id === staffFilter);
    }

    return NextResponse.json({
      logs: filteredLogs,
      staffMembers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error in communications API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
