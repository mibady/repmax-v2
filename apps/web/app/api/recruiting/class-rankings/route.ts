import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: rankings, error } = await supabase
      .from("class_rankings")
      .select("*")
      .order("overall_rank", { ascending: true });

    if (error) {
      console.error("Class rankings query error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ rankings: rankings || [] });
  } catch (error) {
    console.error("Recruiting class rankings API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
