import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

async function getCoachFromUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized", status: 401 } as const;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { error: "Profile not found", status: 404 } as const;
  if (profile.role !== "coach" && profile.role !== "recruiter") {
    return { error: "Only coaches can manage visits", status: 403 } as const;
  }

  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (!coach) return { error: "Coach profile not found", status: 404 } as const;

  return { coach } as const;
}

// GET /api/recruiting/visits - Get campus visits for the current coach
export async function GET() {
  try {
    const supabase = await createClient();
    const authResult = await getCoachFromUser(supabase);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { coach } = authResult;

    // Query campus_visits joined with athletes + profiles
    const { data: visitRows, error: visitError } = await supabase
      .from("campus_visits")
      .select(`
        id,
        athlete_id,
        visit_date,
        visit_time,
        visit_type,
        status,
        notes,
        created_at,
        athlete:athletes(
          id,
          primary_position,
          star_rating,
          class_year,
          high_school,
          state,
          height_inches,
          weight_lbs,
          profile:profiles(full_name, avatar_url)
        )
      `)
      .eq("recruiter_id", coach.id)
      .neq("status", "cancelled")
      .order("visit_date", { ascending: true });

    if (visitError) {
      console.error("Campus visits query error:", visitError);
      return NextResponse.json({ error: visitError.message }, { status: 500 });
    }

    // Transform to the response shape the UI expects
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const visits = (visitRows || []).map((row: any) => {
      const athlete = row.athlete;
      const visitDate = new Date(row.visit_date);

      return {
        id: row.id,
        athleteId: athlete?.id || row.athlete_id,
        athleteName: athlete?.profile?.full_name || "Unknown",
        position: athlete?.primary_position || "ATH",
        stars: athlete?.star_rating || 0,
        avatar: athlete?.profile?.avatar_url || null,
        classYear: athlete?.class_year,
        highSchool: athlete?.high_school,
        state: athlete?.state,
        visitType: row.visit_type || "unofficial",
        status: row.status || "pending",
        date: visitDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        time: row.visit_time || "TBD",
        details: row.notes || "",
        rawDate: row.visit_date,
      };
    });

    // Calculate stats from real data
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthVisits = visits.filter((v) => {
      const d = new Date(v.rawDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const stats = {
      totalVisits: monthVisits.length,
      officialVisits: monthVisits.filter((v) => v.visitType === "official")
        .length,
      pendingVisits: monthVisits.filter((v) => v.status === "pending").length,
      winRate:
        monthVisits.length > 0
          ? Math.round(
              (monthVisits.filter((v) => v.status === "confirmed").length /
                monthVisits.length) *
                100
            )
          : 0,
    };

    // Create calendar events from visits
    const calendarEvents = visits.map((v) => {
      const d = new Date(v.rawDate);
      return {
        day: d.getDate(),
        title: `${v.time !== "TBD" ? v.time + " " : ""}${v.athleteName
          .split(" ")
          .map((n: string) => n[0])
          .join(".")}`,
        type: v.visitType,
        time: v.time,
        athleteId: v.athleteId,
      };
    });

    return NextResponse.json({ visits, stats, calendarEvents });
  } catch (error) {
    console.error("Visits API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const createVisitSchema = z.object({
  athlete_id: z.string().uuid(),
  visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  visit_time: z.string().optional(),
  visit_type: z.enum(["official", "unofficial"]),
  notes: z.string().optional(),
});

// POST /api/recruiting/visits - Create a new campus visit
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const authResult = await getCoachFromUser(supabase);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    const parsed = createVisitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { data } = parsed;
    const { coach } = authResult;

    const { data: visit, error } = await supabase
      .from("campus_visits")
      .insert({
        recruiter_id: coach.id,
        athlete_id: data.athlete_id,
        visit_date: data.visit_date,
        visit_time: data.visit_time || null,
        visit_type: data.visit_type,
        status: "pending",
        notes: data.notes || null,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: visit.id, success: true }, { status: 201 });
  } catch (error) {
    console.error("Create visit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const updateVisitSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["confirmed", "pending", "cancelled"]).optional(),
  visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  visit_time: z.string().optional(),
  visit_type: z.enum(["official", "unofficial"]).optional(),
  notes: z.string().optional(),
});

// PUT /api/recruiting/visits - Update a campus visit
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const authResult = await getCoachFromUser(supabase);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    const parsed = updateVisitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { id, ...updates } = parsed.data;
    const { coach } = authResult;

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );

    if (Object.keys(cleanUpdates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { error } = await supabase
      .from("campus_visits")
      .update(cleanUpdates)
      .eq("id", id)
      .eq("recruiter_id", coach.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update visit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
