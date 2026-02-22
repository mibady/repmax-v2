import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "coach", "staff"]),
});

const removeMemberSchema = z.object({
  member_id: z.string().uuid(),
});

async function getUserSchoolAsAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Unauthorized", status: 401 };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found", status: 404 };
  }

  // Find the school where user is admin
  const { data: membership } = await supabase
    .from("school_members")
    .select("school_id, role")
    .eq("profile_id", profile.id)
    .limit(1)
    .single();

  if (!membership) {
    return { error: "Not a member of any school", status: 403 };
  }

  return { profileId: profile.id, schoolId: membership.school_id, role: membership.role };
}

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const result = await getUserSchoolAsAdmin(supabase);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { data: membersRaw } = await supabase
      .from("school_members")
      .select("id, profile_id, role, created_at, profiles(full_name, email)")
      .eq("school_id", result.schoolId)
      .order("created_at", { ascending: true });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const members = (membersRaw || []).map((member: any) => {
      const profile = member.profiles;
      return {
        id: member.id,
        profile_id: member.profile_id,
        role: member.role,
        created_at: member.created_at,
        full_name: profile?.full_name || null,
        email: profile?.email || null,
      };
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("School members GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const result = await getUserSchoolAsAdmin(supabase);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    if (result.role !== "admin") {
      return NextResponse.json(
        { error: "Only school admins can add members" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = addMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Find the profile by email
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", parsed.data.email)
      .single();

    if (!targetProfile) {
      return NextResponse.json(
        { error: "No user found with that email address" },
        { status: 404 }
      );
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from("school_members")
      .select("id")
      .eq("school_id", result.schoolId)
      .eq("profile_id", targetProfile.id)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: "This user is already a member of the school" },
        { status: 409 }
      );
    }

    // Add member
    const { data: newMember, error: insertError } = await supabase
      .from("school_members")
      .insert({
        school_id: result.schoolId,
        profile_id: targetProfile.id,
        role: parsed.data.role,
      })
      .select()
      .single();

    if (insertError) {
      console.error("School member insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error("School members POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const result = await getUserSchoolAsAdmin(supabase);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    if (result.role !== "admin") {
      return NextResponse.json(
        { error: "Only school admins can remove members" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = removeMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Get the member to be removed
    const { data: targetMember } = await supabase
      .from("school_members")
      .select("id, profile_id, role")
      .eq("id", parsed.data.member_id)
      .eq("school_id", result.schoolId)
      .single();

    if (!targetMember) {
      return NextResponse.json(
        { error: "Member not found in this school" },
        { status: 404 }
      );
    }

    // Prevent removing self if last admin
    if (targetMember.profile_id === result.profileId) {
      const { data: adminMembers } = await supabase
        .from("school_members")
        .select("id")
        .eq("school_id", result.schoolId)
        .eq("role", "admin");

      if ((adminMembers || []).length <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the last admin from the school" },
          { status: 400 }
        );
      }
    }

    const { error: deleteError } = await supabase
      .from("school_members")
      .delete()
      .eq("id", parsed.data.member_id)
      .eq("school_id", result.schoolId);

    if (deleteError) {
      console.error("School member delete error:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("School members DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
