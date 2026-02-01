import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has a profile, create one if not
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
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
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
