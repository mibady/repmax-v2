import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getZoneFromState, getZonePulse, getZoneEvents, getZoneName } from "@repmax/shared/zone";

function formatHeight(inches: number | null): string {
  if (!inches) return "--";
  const feet = Math.floor(inches / 12);
  const remaining = inches % 12;
  return `${feet}'${remaining}"`;
}

export default async function AthleteDashboardPage() {
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

  if (!profile || profile.role !== "athlete") {
    redirect("/dashboard");
  }

  // Get athlete data
  const { data: athlete } = await supabase
    .from("athletes")
    .select("*, offers(*)")
    .eq("profile_id", profile.id)
    .single();

  // Determine zone from athlete's state
  const athleteState = (athlete?.state as string) || "CA";
  const zoneCode = getZoneFromState(athleteState);
  const zoneName = getZoneName(zoneCode);

  // Get zone intelligence data
  const [zonePulse, zoneEvents] = await Promise.all([
    getZonePulse(zoneCode, athlete?.primary_position as string | undefined),
    getZoneEvents(zoneCode),
  ]);

  // Use zone pulse data for stats
  const profileViews = zonePulse.weeklyActivity.profileViews;
  const shortlistCount = zonePulse.weeklyActivity.shortlistAdds;

  return (
    <div className="min-h-screen bg-background-dark text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-background-dark/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/dashboard/athlete" className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">sports_football</span>
              <span className="text-xl font-bold">RepMax</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard/athlete" className="flex items-center gap-2 text-sm font-medium text-primary">
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                Dashboard
              </Link>
              <Link href="/dashboard/athlete/card" className="flex items-center gap-2 text-sm font-medium text-text-grey hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">badge</span>
                My Card
              </Link>
              <Link href="/dashboard/athlete/zone" className="flex items-center gap-2 text-sm font-medium text-text-grey hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">map</span>
                Zone Intel
              </Link>
              <Link href="/dashboard/athlete/offers" className="flex items-center gap-2 text-sm font-medium text-text-grey hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">trophy</span>
                Offers
              </Link>
              <Link href="/dashboard/athlete/messages" className="flex items-center gap-2 text-sm font-medium text-text-grey hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">mail</span>
                Messages
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/settings" className="text-text-grey hover:text-white transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </Link>
            <form action="/auth/logout" method="POST">
              <button type="submit" className="text-text-grey hover:text-white transition-colors">
                <span className="material-symbols-outlined">logout</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Section */}
            <section className="rounded-xl bg-surface-dark border border-white/5 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    Welcome back, {profile.full_name?.split(" ")[0] || "Athlete"}
                  </h1>
                  <p className="text-text-grey">
                    Here&apos;s what&apos;s happening in your recruitment journey today.
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/30 px-3 py-1">
                  <span className="material-symbols-outlined text-purple-400 text-[16px]">location_on</span>
                  <span className="text-sm font-medium text-purple-300">{zoneName} Zone</span>
                </div>
              </div>
            </section>

            {/* Zone Pulse */}
            <section className="rounded-xl bg-gradient-to-r from-purple-900/30 to-purple-800/10 border border-purple-500/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-purple-400">leak_add</span>
                <h2 className="text-lg font-bold text-white">Zone Pulse: {zoneName}</h2>
              </div>
              <div className="rounded-lg bg-black/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="font-semibold text-white">
                    Recruiting activity is {profileViews > 40 ? "High" : profileViews > 20 ? "Moderate" : "Low"}
                  </span>
                </div>
                <p className="text-text-grey text-sm mb-3">
                  {zonePulse.insightMessage}
                </p>
                <div className="flex items-center gap-4 mb-3 text-xs text-text-grey">
                  <span>Hot positions: {zonePulse.hotPositions.slice(0, 2).join(", ")}</span>
                </div>
                <Link href="/dashboard/athlete/zone" className="text-primary text-sm font-medium hover:underline">
                  View Intel Report →
                </Link>
              </div>
            </section>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Profile Views */}
              <div className="rounded-xl bg-surface-dark border border-white/5 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary">visibility</span>
                  <h3 className="font-medium text-text-grey">Profile Views</h3>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-4xl font-bold text-white font-mono">{profileViews}</span>
                    <p className="text-xs text-text-grey mt-1">Last 7 days</p>
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    zonePulse.weeklyActivity.profileViewsTrend === "up" ? "text-green-400" :
                    zonePulse.weeklyActivity.profileViewsTrend === "down" ? "text-red-400" : "text-text-grey"
                  }`}>
                    <span className="material-symbols-outlined text-[16px]">
                      {zonePulse.weeklyActivity.profileViewsTrend === "up" ? "trending_up" :
                       zonePulse.weeklyActivity.profileViewsTrend === "down" ? "trending_down" : "trending_flat"}
                    </span>
                    {zonePulse.weeklyActivity.profileViewsTrend === "up" ? "+12%" :
                     zonePulse.weeklyActivity.profileViewsTrend === "down" ? "-8%" : "0%"}
                  </div>
                </div>
              </div>

              {/* Shortlists */}
              <div className="rounded-xl bg-surface-dark border border-white/5 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary">bookmark</span>
                  <h3 className="font-medium text-text-grey">Shortlists</h3>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-4xl font-bold text-white font-mono">{shortlistCount}</span>
                    <p className="text-xs text-text-grey mt-1">Coaches watching</p>
                  </div>
                  <div className="flex -space-x-2">
                    {shortlistCount > 0 && (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-surface-dark"></div>
                    )}
                    {shortlistCount > 1 && (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 border-2 border-surface-dark"></div>
                    )}
                    {shortlistCount > 2 && (
                      <div className="h-8 w-8 rounded-full bg-surface-light border-2 border-surface-dark flex items-center justify-center text-xs font-medium">
                        +{shortlistCount - 2}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recruiting Calendar */}
            <section className="rounded-xl bg-surface-dark border border-white/5 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">calendar_month</span>
                  <h2 className="text-lg font-bold text-white">Recruiting Calendar</h2>
                </div>
                <Link href="/dashboard/athlete/calendar" className="text-primary text-sm font-medium hover:underline">
                  View Full Schedule
                </Link>
              </div>
              <div className="space-y-4">
                {zoneEvents.slice(0, 3).map((event, index) => {
                  const eventDate = new Date(event.date);
                  const month = eventDate.toLocaleString("en-US", { month: "short" });
                  const day = eventDate.getDate().toString().padStart(2, "0");

                  const badgeStyles: Record<string, { bg: string; text: string; border: string; label: string }> = {
                    camp: { bg: "bg-primary/20", text: "text-primary", border: "border-primary/30", label: "Camp" },
                    combine: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30", label: "Combine" },
                    deadline: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30", label: "Deadline" },
                    visit: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30", label: "Visit" },
                    signing: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30", label: "Signing" },
                  };
                  const badge = badgeStyles[event.type] || badgeStyles.camp;

                  return (
                    <div key={event.id || index} className="flex gap-4 p-4 rounded-lg bg-white/5 border border-white/5 hover:border-primary/30 transition-colors">
                      <div className="text-center min-w-[48px]">
                        <p className="text-xs uppercase text-text-grey">{month}</p>
                        <p className="text-2xl font-bold text-white font-mono">{day}</p>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{event.title}</h4>
                        <p className="text-sm text-text-grey">{event.location}</p>
                      </div>
                      <span className={`self-start px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text} ${badge.border}`}>
                        {badge.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Sidebar - Right column */}
          <div className="space-y-6">
            {/* Athlete Card Preview */}
            <section className="rounded-xl bg-surface-dark border border-white/5 overflow-hidden">
              <div className="relative h-32 bg-gradient-to-br from-primary/20 to-purple-900/20">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10"></div>
              </div>
              <div className="p-6 -mt-12 relative">
                <div className="flex items-end gap-4 mb-4">
                  <div className="h-20 w-20 rounded-full border-4 border-surface-dark bg-gradient-to-br from-primary to-yellow-600 flex items-center justify-center">
                    {profile.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt={profile.full_name || "Athlete"}
                        width={80}
                        height={80}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-black">
                        {profile.full_name?.charAt(0) || "A"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 pb-1">
                    <h3 className="text-xl font-bold text-white">{profile.full_name}</h3>
                    <p className="text-sm text-text-grey">{athlete?.primary_position || "Position"}</p>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`material-symbols-outlined text-[20px] ${
                        star <= (athlete?.star_rating || 0) ? "text-primary" : "text-white/20"
                      }`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>

                {/* Measurements */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="rounded-lg bg-white/5 p-3 text-center">
                    <p className="text-xs text-text-grey mb-1">Height</p>
                    <p className="text-lg font-bold text-white font-mono">
                      {formatHeight(athlete?.height_inches)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3 text-center">
                    <p className="text-xs text-text-grey mb-1">Weight</p>
                    <p className="text-lg font-bold text-white font-mono">
                      {athlete?.weight_lbs || "--"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3 text-center">
                    <p className="text-xs text-text-grey mb-1">40YD</p>
                    <p className="text-lg font-bold text-primary font-mono">
                      {athlete?.forty_yard_time || "--"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href="/dashboard/athlete/card/edit"
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-white/5 border border-white/10 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Edit
                  </Link>
                  <button className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-black hover:bg-primary-hover transition-colors">
                    <span className="material-symbols-outlined text-[18px]">share</span>
                    Share
                  </button>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="rounded-xl bg-surface-dark border border-white/5 p-6">
              <h3 className="font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/dashboard/athlete/photos"
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                >
                  <span className="material-symbols-outlined text-primary">add_a_photo</span>
                  <span className="flex-1 text-sm text-white">Update Photos</span>
                  <span className="material-symbols-outlined text-text-grey group-hover:text-white transition-colors">chevron_right</span>
                </Link>
                <Link
                  href="/dashboard/athlete/stats"
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                >
                  <span className="material-symbols-outlined text-primary">fitness_center</span>
                  <span className="flex-1 text-sm text-white">Log New Maxes</span>
                  <span className="material-symbols-outlined text-text-grey group-hover:text-white transition-colors">chevron_right</span>
                </Link>
                <Link
                  href="/dashboard/athlete/highlights"
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                >
                  <span className="material-symbols-outlined text-primary">videocam</span>
                  <span className="flex-1 text-sm text-white">Upload Tape</span>
                  <span className="material-symbols-outlined text-text-grey group-hover:text-white transition-colors">chevron_right</span>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
