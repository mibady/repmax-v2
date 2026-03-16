import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("user_id", user.id)
          .single();

        if (!profile) {
          // Create profile from user metadata
          const metadata = user.user_metadata;
          await supabase.from("profiles").insert({
            user_id: user.id,
            full_name: metadata.full_name || metadata.name || user.email?.split("@")[0] || "User",
            role: metadata.role || "athlete",
          });
        }

        // Handle invited athletes: skip onboarding, claim invite
        if (
          profile &&
          profile.role === "athlete" &&
          user.user_metadata?.invited_by_coach
        ) {
          // Claim the invite using service client (bypasses RLS)
          if (user.email) {
            const serviceClient = createServiceClient();
            await serviceClient
              .from("coach_athlete_invites")
              .update({ status: "claimed", claimed_at: new Date().toISOString() })
              .eq("athlete_email", user.email.toLowerCase())
              .eq("status", "pending");
          }

          return NextResponse.redirect(`${origin}/athlete`);
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
