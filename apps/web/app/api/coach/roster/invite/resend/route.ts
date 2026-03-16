import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

const ResendSchema = z.object({
  athlete_id: z.string().uuid(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (!profile || profile.role !== "coach") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { athlete_id } = ResendSchema.parse(await request.json());

    const serviceClient = createServiceClient();

    // Find the invite
    const { data: invite } = await serviceClient
      .from("coach_athlete_invites")
      .select("id, athlete_email, status")
      .eq("coach_profile_id", profile.id)
      .eq("athlete_profile_id", athlete_id)
      .single();

    if (!invite) {
      return NextResponse.json(
        { error: "No invite found for this athlete" },
        { status: 404 }
      );
    }

    if (invite.status === "claimed") {
      return NextResponse.json(
        { error: "Athlete has already claimed their account" },
        { status: 400 }
      );
    }

    // Generate a new magic link
    const { error: linkError } =
      await serviceClient.auth.admin.generateLink({
        type: "magiclink",
        email: invite.athlete_email,
      });

    if (linkError) {
      return NextResponse.json(
        { error: linkError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, email: invite.athlete_email });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Resend invite error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
