import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const TeamSchema = z.object({
  name: z.string().min(1),
  school_name: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  zone: z.enum(["West", "Southwest", "Midwest", "Southeast", "Northeast", "Mid-Atlantic"]),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (!profile || profile.role !== "coach") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = TeamSchema.parse(await request.json());

    const { data: team, error } = await supabase
      .from("teams")
      .insert({
        name: body.name,
        school_name: body.school_name,
        city: body.city,
        state: body.state,
        zone: body.zone,
        coach_profile_id: profile.id,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Fire-and-forget: seed starter data for new coach
    try {
      const { data: coachRecord } = await supabase
        .from("coaches")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

      if (coachRecord) {
        // Only seed if coach has no existing tasks (idempotency)
        const { count } = await supabase
          .from("coach_tasks")
          .select("id", { count: "exact", head: true })
          .eq("coach_id", coachRecord.id);

        if (count === 0) {
          const now = new Date();
          const in3Days = new Date(now.getTime() + 3 * 86400000)
            .toISOString()
            .split("T")[0];
          const in7Days = new Date(now.getTime() + 7 * 86400000)
            .toISOString()
            .split("T")[0];

          // 4 Starter Tasks
          await supabase.from("coach_tasks").insert([
            {
              coach_id: coachRecord.id,
              title: "Set up your recruiting board",
              description:
                "Add target college programs to your recruiting board to track interest levels and upcoming visits.",
              due_date: in3Days,
              priority: "medium",
              status: "pending",
            },
            {
              coach_id: coachRecord.id,
              title: "Add athletes to your roster",
              description:
                "Import or manually add your team roster so athletes appear on your dashboard.",
              due_date: in3Days,
              priority: "high",
              status: "pending",
            },
            {
              coach_id: coachRecord.id,
              title: "Review compliance calendar",
              description:
                "Check NCAA recruiting calendar for current contact and evaluation periods.",
              due_date: in7Days,
              priority: "medium",
              status: "pending",
            },
            {
              coach_id: coachRecord.id,
              title: "Contact target program coordinators",
              description:
                "Reach out to recruiting coordinators at your target college programs to introduce your athletes.",
              due_date: in7Days,
              priority: "high",
              status: "pending",
            },
          ]);

          // 6 College Tracking Entries (zone-based)
          const collegesByZone: Record<string, string[]> = {
            West: ["USC", "UCLA", "Oregon", "Washington", "Stanford", "Cal Berkeley"],
            Southwest: ["Arizona State", "Texas", "Oklahoma", "Baylor", "TCU", "Texas Tech"],
            Midwest: ["Ohio State", "Michigan", "Notre Dame", "Iowa", "Wisconsin", "Penn State"],
            Southeast: ["Alabama", "Georgia", "LSU", "Florida", "Tennessee", "Auburn"],
            Northeast: ["Boston College", "Syracuse", "Pittsburgh", "Rutgers", "UConn", "Temple"],
            "Mid-Atlantic": ["Virginia Tech", "Maryland", "West Virginia", "Virginia", "Duke", "NC State"],
          };

          const colleges = collegesByZone[body.zone] ?? collegesByZone["West"];

          await supabase.from("coach_college_tracking").insert(
            colleges.map((school) => ({
              coach_id: coachRecord.id,
              school_name: school,
              temperature: "warm",
              prospect_count: 0,
              scheduled_visits: 0,
              notes: null,
            }))
          );

          // 3 Starter Notes
          await supabase.from("coach_structured_notes").insert([
            {
              coach_id: coachRecord.id,
              content:
                "Welcome to RepMax! Start by adding your athletes to the roster, then track college program interest on your recruiting board. Use tasks to stay on top of deadlines and compliance dates.",
              category: "general",
              is_pinned: true,
            },
            {
              coach_id: coachRecord.id,
              content:
                "Review NCAA recruiting calendar for current dead periods and contact windows. Ensure all staff are aware of compliance requirements before initiating outreach.",
              category: "urgent",
              is_pinned: false,
            },
            {
              coach_id: coachRecord.id,
              content:
                "Season recruiting strategy: 1) Build complete athlete profiles with film and academics 2) Identify target programs by fit 3) Track all interactions on the recruiting board 4) Coordinate campus visits during open periods.",
              category: "strategy",
              is_pinned: true,
            },
          ]);
        }
      }
    } catch {
      // Swallow errors — team creation is the critical path
    }

    return NextResponse.json({ team }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
