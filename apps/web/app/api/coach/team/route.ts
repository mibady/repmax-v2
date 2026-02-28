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

    return NextResponse.json({ team }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
