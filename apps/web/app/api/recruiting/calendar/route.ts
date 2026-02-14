import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// NCAA key dates for football recruiting
function getNcaaPeriod(now: Date) {
  const month = now.getMonth(); // 0-indexed
  const day = now.getDate();

  // Simplified NCAA calendar periods
  if (month === 11 && day >= 18 && day <= 20) {
    return { name: "Early Signing Period", isOpen: true };
  }
  if (month === 0 && day >= 1 && day <= 16) {
    return { name: "Transfer Portal Window", isOpen: true };
  }
  if (month === 1 && day >= 1 && day <= 7) {
    return { name: "National Signing Day Window", isOpen: true };
  }
  if (month >= 3 && month <= 4) {
    return { name: "Spring Evaluation Period", isOpen: false };
  }
  if (month === 5) {
    return { name: "June Official Visit Period", isOpen: false };
  }
  if (month >= 8 && month <= 10) {
    return { name: "Fall Contact Period", isOpen: false };
  }
  return { name: "Recruiting Period", isOpen: false };
}

function getNextNSD(now: Date): Date {
  const year = now.getFullYear();
  // NSD is first Wednesday of February — approximate as Feb 5
  const nsd = new Date(year, 1, 5);
  if (now > nsd) {
    return new Date(year + 1, 1, 5);
  }
  return nsd;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get profile & coach
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    let upcomingVisits = 0;

    if (profile) {
      const { data: coach } = await supabase
        .from("coaches")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

      if (coach) {
        // Count upcoming campus visits
        const today = new Date().toISOString().split("T")[0];
        const { count } = await supabase
          .from("campus_visits")
          .select("id", { count: "exact", head: true })
          .eq("recruiter_id", coach.id)
          .gte("visit_date", today)
          .neq("status", "cancelled");

        upcomingVisits = count || 0;
      }
    }

    const now = new Date();
    const year = now.getFullYear();
    const period = getNcaaPeriod(now);
    const nextNSD = getNextNSD(now);
    const daysUntilSigning = Math.max(
      0,
      Math.ceil((nextNSD.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );

    // Generate key dates dynamically for current/next academic year
    const keyDates = [
      {
        date: `${year}-12-18`,
        event: "Early Signing Period Opens",
      },
      {
        date: `${year}-12-20`,
        event: "Early Signing Period Closes",
      },
      {
        date: `${year + 1}-02-05`,
        event: "National Signing Day",
      },
      {
        date: `${year + 1}-04-15`,
        event: "Spring Evaluation Period Opens",
      },
      {
        date: `${year + 1}-06-01`,
        event: "June Official Visit Period Opens",
      },
    ].filter((d) => d.date >= now.toISOString().split("T")[0]);

    const calendar = {
      currentPeriod: period.name,
      portalWindowOpen: period.isOpen,
      nextSigningDate: nextNSD.toISOString().split("T")[0],
      daysUntilSigning,
      upcomingVisits,
      keyDates,
    };

    return NextResponse.json(calendar);
  } catch (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
