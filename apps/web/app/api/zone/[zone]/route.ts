import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const zoneSchema = z.enum(["West", "Southwest", "Midwest", "Southeast", "Northeast", "Mid-Atlantic"]);

// GET /api/zone/[zone]
// Returns detailed information for a specific zone
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ zone: string }> }
) {
  try {
    const supabase = await createClient();
    const { zone } = await params;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate zone
    const validZone = zoneSchema.safeParse(zone);
    if (!validZone.success) {
      return NextResponse.json({ error: "Invalid zone" }, { status: 400 });
    }

    // Get latest zone activity
    const { data: activity } = await supabase
      .from("zone_activity")
      .select("*")
      .eq("zone", validZone.data)
      .order("date", { ascending: false })
      .limit(1)
      .single();

    // Get top athletes in zone
    const { data: topAthletes } = await supabase
      .from("athletes")
      .select(`
        id,
        primary_position,
        class_year,
        star_rating,
        repmax_score,
        state,
        profiles!inner(full_name, avatar_url)
      `)
      .eq("zone", validZone.data)
      .eq("verified", true)
      .order("star_rating", { ascending: false })
      .order("repmax_score", { ascending: false })
      .limit(10);

    // Get recent offers in zone
    const { data: recentOffers } = await supabase
      .from("offers")
      .select(`
        id,
        school_name,
        division,
        offer_date,
        athletes!inner(
          id,
          primary_position,
          zone,
          profiles!inner(full_name)
        )
      `)
      .eq("athletes.zone", validZone.data)
      .order("offer_date", { ascending: false })
      .limit(10);

    // Zone metadata
    const zoneMetadata: Record<string, { states: string[]; description: string }> = {
      West: {
        states: ["CA", "OR", "WA", "NV", "AZ", "UT", "CO", "NM"],
        description: "West Coast and Mountain West region",
      },
      Southwest: {
        states: ["TX", "OK", "AR", "LA"],
        description: "Texas and surrounding states",
      },
      Midwest: {
        states: ["OH", "MI", "IN", "IL", "WI", "MN", "IA", "MO", "KS", "NE", "SD", "ND"],
        description: "Great Lakes and Plains region",
      },
      Southeast: {
        states: ["FL", "GA", "AL", "MS", "TN", "SC", "NC", "KY"],
        description: "SEC and ACC territory",
      },
      Northeast: {
        states: ["NY", "PA", "NJ", "CT", "MA", "RI", "NH", "VT", "ME"],
        description: "Northeast corridor and New England",
      },
      "Mid-Atlantic": {
        states: ["VA", "WV", "MD", "DE", "DC"],
        description: "Mid-Atlantic and DMV region",
      },
    };

    return NextResponse.json({
      zone: validZone.data,
      metadata: zoneMetadata[validZone.data],
      activity: activity || {
        total_views: 0,
        unique_athletes_viewed: 0,
        unique_coaches_active: 0,
        new_offers: 0,
        new_commits: 0,
        hot_positions: [],
        activity_level: "moderate",
      },
      top_athletes: topAthletes?.map(a => ({
        id: a.id,
        name: (a.profiles as any)?.full_name,
        avatar: (a.profiles as any)?.avatar_url,
        position: a.primary_position,
        class_year: a.class_year,
        star_rating: a.star_rating,
        state: a.state,
      })) || [],
      recent_offers: recentOffers?.map(o => ({
        id: o.id,
        school: o.school_name,
        division: o.division,
        date: o.offer_date,
        athlete: {
          id: (o.athletes as any)?.id,
          name: (o.athletes as any)?.profiles?.full_name,
          position: (o.athletes as any)?.primary_position,
        },
      })) || [],
    });
  } catch (error) {
    console.error("Zone detail API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
