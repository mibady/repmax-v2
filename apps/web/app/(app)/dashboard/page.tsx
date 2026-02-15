import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // Redirect to role-specific dashboard
  if (profile.role === "athlete") {
    redirect("/athlete");
  } else if (profile.role === "recruiter" || profile.role === "coach") {
    redirect("/recruiter/pipeline");
  } else if (profile.role === "admin") {
    redirect("/admin/analytics");
  }

  // Cast profile to expected type for build
  const typedProfile = profile as {
    id: string;
    role: "athlete" | "coach" | "recruiter" | "admin";
    full_name: string;
    avatar_url?: string;
  };

  // Define types for role-specific data
  type AthleteData = {
    repmax_score?: number;
    offers_count?: number;
    star_rating?: number;
    offers?: unknown[];
  } | null;

  type CoachData = {
    id: string;
  } | null;

  // Get role-specific data
  let athleteData: AthleteData = null;
  let coachData: CoachData = null;

  if (typedProfile.role === "athlete") {
    const { data } = await supabase
      .from("athletes")
      .select("*, offers(*)")
      .eq("profile_id", typedProfile.id)
      .single();
    athleteData = data as AthleteData;
  } else if (typedProfile.role === "coach" || typedProfile.role === "recruiter") {
    const { data } = await supabase
      .from("coaches")
      .select("*")
      .eq("profile_id", typedProfile.id)
      .single();
    coachData = data as CoachData;
  }

  // Use coachData for future features (e.g., shortlist count, messages)
  void coachData;

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <header className="border-b border-white/5 bg-surface-dark">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-primary text-xl">⚽</span>
              <span className="text-lg font-black text-white">REPMAX</span>
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-white"
            >
              Dashboard
            </Link>
            {(typedProfile.role === "coach" || typedProfile.role === "recruiter") && (
              <>
                <Link
                  href="/athletes"
                  className="text-sm font-medium text-text-grey hover:text-white transition-colors"
                >
                  Athletes
                </Link>
                <Link
                  href="/shortlist"
                  className="text-sm font-medium text-text-grey hover:text-white transition-colors"
                >
                  Shortlist
                </Link>
              </>
            )}
            <form action="/auth/logout" method="POST">
              <button
                type="submit"
                className="text-sm font-medium text-text-grey hover:text-white transition-colors"
              >
                Logout
              </button>
            </form>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {typedProfile.full_name}
          </h1>
          <p className="text-text-grey mt-1">
            {typedProfile.role === "athlete"
              ? "Manage your recruiting profile and track your offers."
              : "Discover and recruit top talent."}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {typedProfile.role === "athlete" && athleteData && (
            <>
              <div className="rounded-xl bg-surface-dark border border-white/10 p-6">
                <p className="text-sm text-text-grey mb-2">RepMax Score</p>
                <p className="text-4xl font-bold text-primary stats-font">
                  {athleteData.repmax_score || "--"}
                </p>
              </div>
              <div className="rounded-xl bg-surface-dark border border-white/10 p-6">
                <p className="text-sm text-text-grey mb-2">Total Offers</p>
                <p className="text-4xl font-bold text-white stats-font">
                  {athleteData.offers_count || 0}
                </p>
              </div>
              <div className="rounded-xl bg-surface-dark border border-white/10 p-6">
                <p className="text-sm text-text-grey mb-2">Star Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={
                        star <= (athleteData.star_rating || 0)
                          ? "text-primary"
                          : "text-white/20"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {(typedProfile.role === "coach" || typedProfile.role === "recruiter") && (
            <>
              <div className="rounded-xl bg-surface-dark border border-white/10 p-6">
                <p className="text-sm text-text-grey mb-2">Athletes in Database</p>
                <p className="text-4xl font-bold text-primary stats-font">10,000+</p>
              </div>
              <div className="rounded-xl bg-surface-dark border border-white/10 p-6">
                <p className="text-sm text-text-grey mb-2">Your Shortlist</p>
                <p className="text-4xl font-bold text-white stats-font">0</p>
              </div>
              <div className="rounded-xl bg-surface-dark border border-white/10 p-6">
                <p className="text-sm text-text-grey mb-2">Messages</p>
                <p className="text-4xl font-bold text-white stats-font">0</p>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            {typedProfile.role === "athlete" && !athleteData && (
              <Link
                href="/profile/setup"
                className="px-6 py-3 rounded-lg bg-primary text-black font-bold hover:bg-primary-hover transition-colors"
              >
                Complete Your Profile
              </Link>
            )}
            {(typedProfile.role === "coach" || typedProfile.role === "recruiter") && (
              <>
                <Link
                  href="/athletes"
                  className="px-6 py-3 rounded-lg bg-primary text-black font-bold hover:bg-primary-hover transition-colors"
                >
                  Search Athletes
                </Link>
                <Link
                  href="/shortlist"
                  className="px-6 py-3 rounded-lg bg-surface-dark border border-white/10 text-white font-medium hover:bg-surface-light transition-colors"
                >
                  View Shortlist
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
