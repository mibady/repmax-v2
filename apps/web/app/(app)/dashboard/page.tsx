import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // Redirect to role-specific dashboard
  if (profile.role === "athlete") {
    redirect("/athlete");
  } else if (profile.role === "parent") {
    redirect("/parent");
  } else if (profile.role === "coach") {
    redirect("/coach");
  } else if (profile.role === "recruiter") {
    redirect("/recruiter/pipeline");
  } else if (profile.role === "club") {
    redirect("/club");
  } else if (profile.role === "admin") {
    redirect("/admin/analytics");
  } else {
    redirect("/athlete");
  }
}
