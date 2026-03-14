import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data: athlete } = await supabase
      .from("athletes")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (!athlete) {
      return NextResponse.json({ offers: [] });
    }

    const { data: offers, error } = await supabase
      .from("offers")
      .select("*")
      .eq("athlete_id", athlete.id)
      .order("offer_date", { ascending: false });

    if (error) {
      console.error("Error fetching offers:", error);
      return NextResponse.json(
        { error: "Failed to fetch offers" },
        { status: 500 }
      );
    }

    return NextResponse.json({ offers: offers || [] });
  } catch (error) {
    console.error("Error in athlete offers API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
