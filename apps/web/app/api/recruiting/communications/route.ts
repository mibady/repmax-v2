import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { requireRecruiterTier } from "@/lib/utils/subscription-server";

async function getCoachFromUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized", status: 401 } as const;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { error: "Profile not found", status: 404 } as const;

  const { data: coach } = await supabase
    .from("coaches")
    .select("id, school_name")
    .eq("profile_id", profile.id)
    .single();

  if (!coach) {
    return {
      error: "Only coaches can view communications",
      status: 403,
    } as const;
  }

  return { profile, coach } as const;
}

export async function GET(request: Request) {
  try {
    const { authorized } = await requireRecruiterTier("pro");
    if (!authorized) {
      return NextResponse.json({ error: "Pro subscription required" }, { status: 403 });
    }

    const supabase = await createClient();
    const authResult = await getCoachFromUser(supabase);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { profile, coach } = authResult;

    // Build staff members list from same school
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

    const staffMembers = (teamCoaches || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((c: any) => {
        const profileData = c.profile;
        const coachProfile = Array.isArray(profileData)
          ? profileData[0]
          : profileData;
        return {
          id: coachProfile?.id || "",
          name: coachProfile?.full_name || "Unknown",
        };
      })
      .filter((s: { id: string; name: string }) => s.id && s.name);

    if (staffMembers.length === 0) {
      staffMembers.push({
        id: profile.id,
        name: profile.full_name || "You",
      });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get("type");
    const searchQuery = searchParams.get("search");
    const staffFilter = searchParams.get("staff");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // --- Source 1: communication_log entries ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let commLogEntries: any[] = [];
    {
      let query = supabase
        .from("communication_log")
        .select(`
          id,
          comm_type,
          summary,
          created_at,
          athlete:athletes(
            id,
            class_year,
            profile:profiles(id, full_name, avatar_url)
          )
        `)
        .eq("recruiter_id", coach.id)
        .order("created_at", { ascending: false });

      if (dateFrom) query = query.gte("created_at", dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lt("created_at", endDate.toISOString().split("T")[0]);
      }

      const { data, error } = await query;
      if (!error && data) commLogEntries = data;
    }

    // --- Source 2: messages (DMs) ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let messageEntries: any[] = [];
    {
      let query = supabase
        .from("messages")
        .select(
          `
          id,
          subject,
          body,
          created_at,
          sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
          recipient:profiles!messages_recipient_id_fkey(id, full_name, avatar_url)
        `,
          { count: "exact" }
        )
        .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(
          `body.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%`
        );
      }
      if (dateFrom) query = query.gte("created_at", dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lt("created_at", endDate.toISOString().split("T")[0]);
      }

      const { data, error } = await query.limit(100);
      if (!error && data) messageEntries = data;
    }

    // --- Merge and transform ---
    const gradients = [
      { from: "from-blue-600", to: "to-indigo-800" },
      { from: "from-purple-600", to: "to-pink-800" },
      { from: "from-orange-600", to: "to-red-800" },
      { from: "from-teal-600", to: "to-cyan-800" },
      { from: "from-yellow-600", to: "to-red-600" },
      { from: "from-green-600", to: "to-emerald-800" },
    ];

    function getGradient(name: string) {
      const idx = (name?.charCodeAt(0) || 0) % gradients.length;
      return gradients[idx];
    }

    function getInitials(name: string) {
      return (
        name
          ?.split(" ")
          .map((n: string) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "??"
      );
    }

    function formatDatetime(dateStr: string) {
      return new Date(dateStr).toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }

    // Transform communication_log entries
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fromCommLog = commLogEntries.map((entry: any) => {
      const athleteProfile = Array.isArray(entry.athlete?.profile)
        ? entry.athlete.profile[0]
        : entry.athlete?.profile;
      const prospectName = athleteProfile?.full_name || "Unknown";
      const gradient = getGradient(prospectName);

      return {
        id: entry.id,
        prospect: {
          id: athleteProfile?.id || "",
          name: prospectName,
          initials: getInitials(prospectName),
          gradientFrom: gradient.from,
          gradientTo: gradient.to,
          classYear: entry.athlete?.class_year
            ? `Class of ${entry.athlete.class_year}`
            : "Prospect",
        },
        type: entry.comm_type as "call" | "visit" | "email" | "message",
        summary: entry.summary || "",
        staff: {
          id: profile.id,
          name: profile.full_name || "You",
          initials: getInitials(profile.full_name || "You"),
        },
        datetime: formatDatetime(entry.created_at),
        direction: "outgoing" as const,
        _sortDate: entry.created_at,
      };
    });

    // Transform messages
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fromMessages = messageEntries.map((msg: any) => {
      const sender = Array.isArray(msg.sender) ? msg.sender[0] : msg.sender;
      const recipient = Array.isArray(msg.recipient)
        ? msg.recipient[0]
        : msg.recipient;

      const isIncoming = recipient?.id === profile.id;
      const otherParty = isIncoming ? sender : recipient;
      const prospectName = otherParty?.full_name || "Unknown";
      const gradient = getGradient(prospectName);

      const staffPerson = isIncoming
        ? { name: profile.full_name || "You", id: profile.id }
        : {
            name: sender?.full_name || profile.full_name || "You",
            id: sender?.id || profile.id,
          };

      return {
        id: msg.id,
        prospect: {
          id: otherParty?.id || "",
          name: prospectName,
          initials: getInitials(prospectName),
          gradientFrom: gradient.from,
          gradientTo: gradient.to,
          classYear: "Prospect",
        },
        type: "message" as const,
        summary:
          msg.body.slice(0, 150) + (msg.body.length > 150 ? "..." : ""),
        staff: {
          id: staffPerson.id,
          name: staffPerson.name,
          initials: getInitials(staffPerson.name),
        },
        datetime: formatDatetime(msg.created_at),
        direction: (isIncoming ? "incoming" : "outgoing") as
          | "incoming"
          | "outgoing",
        _sortDate: msg.created_at,
      };
    });

    // Merge and sort by date DESC
    let allLogs = [...fromCommLog, ...fromMessages].sort(
      (a, b) =>
        new Date(b._sortDate).getTime() - new Date(a._sortDate).getTime()
    );

    // Apply type filter
    if (typeFilter) {
      allLogs = allLogs.filter((log) => log.type === typeFilter);
    }

    // Apply staff filter
    if (staffFilter) {
      allLogs = allLogs.filter((log) => log.staff.id === staffFilter);
    }

    // Apply search filter to comm_log entries too
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      allLogs = allLogs.filter(
        (log) =>
          log.summary.toLowerCase().includes(q) ||
          log.prospect.name.toLowerCase().includes(q)
      );
    }

    // Paginate
    const total = allLogs.length;
    const offset = (page - 1) * limit;
    const paginatedLogs = allLogs.slice(offset, offset + limit);

    // Strip _sortDate from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const logs = paginatedLogs.map(({ _sortDate, ...rest }) => rest);

    return NextResponse.json({
      logs,
      staffMembers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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

const createLogSchema = z.object({
  athlete_id: z.string().uuid(),
  comm_type: z.enum(["call", "visit", "email", "message"]),
  summary: z.string().min(1).max(2000),
});

// POST /api/recruiting/communications - Log a new communication
export async function POST(request: NextRequest) {
  try {
    const { authorized } = await requireRecruiterTier("pro");
    if (!authorized) {
      return NextResponse.json({ error: "Pro subscription required" }, { status: 403 });
    }

    const supabase = await createClient();
    const authResult = await getCoachFromUser(supabase);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    const parsed = createLogSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { coach } = authResult;
    const { data } = parsed;

    const { data: entry, error } = await supabase
      .from("communication_log")
      .insert({
        recruiter_id: coach.id,
        athlete_id: data.athlete_id,
        comm_type: data.comm_type,
        summary: data.summary,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { id: entry.id, success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create communication log error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
