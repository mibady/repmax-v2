import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createSchoolSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  division: z.enum(["D1", "D2", "D3", "NAIA", "JUCO"]).nullable().optional(),
  conference: z.string().max(200).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  state: z.string().max(50).nullable().optional(),
});

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Find the school(s) this user belongs to via school_members
    const { data: membership, error: memberError } = await supabase
      .from("school_members")
      .select("school_id, role")
      .eq("profile_id", profile.id)
      .limit(1)
      .single();

    if (memberError || !membership) {
      return NextResponse.json({
        school: null,
        members: [],
        credits: [],
      });
    }

    // Get the school data
    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .select("*")
      .eq("id", membership.school_id)
      .single();

    if (schoolError || !school) {
      return NextResponse.json({
        school: null,
        members: [],
        credits: [],
      });
    }

    // Get all members for this school with profile info
    const { data: membersRaw, error: membersError } = await supabase
      .from("school_members")
      .select("id, profile_id, role, created_at, profiles(full_name, email)")
      .eq("school_id", school.id)
      .order("created_at", { ascending: true });

    if (membersError) {
      console.error("Members fetch error:", membersError);
    }

    // Flatten members with profile data
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

    // Get credits
    const { data: credits } = await supabase
      .from("school_credits")
      .select("id, credit_type, balance")
      .eq("school_id", school.id);

    return NextResponse.json({
      school,
      members,
      credits: credits || [],
    });
  } catch (error) {
    console.error("Schools GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Role verification
    if (profile.role !== 'school' && profile.role !== 'admin') {
      return NextResponse.json(
        { error: "Only users with the 'school' or 'admin' role can create schools" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createSchoolSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Create the school with admin member atomically
    const { data: school, error: createError } = await supabase
      .rpc('create_school_with_admin', {
        school_name: parsed.data.name,
        school_slug: parsed.data.slug,
        school_division: parsed.data.division || null,
        school_conference: parsed.data.conference || null,
        school_city: parsed.data.city || null,
        school_state: parsed.data.state || null,
        admin_id: profile.id,
      });

    if (createError) {
      console.error("School create error:", createError);
      if (createError.code === "23505") {
        return NextResponse.json(
          { error: "A school with this slug already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json(school, { status: 201 });
  } catch (error) {
    console.error("Schools POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const updateSchoolSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  division: z.enum(["D1", "D2", "D3", "NAIA", "JUCO"]).nullable().optional(),
  conference: z.string().max(200).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  state: z.string().max(50).nullable().optional(),
});

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
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

    // Find the school this user belongs to
    const { data: membership } = await supabase
      .from("school_members")
      .select("school_id, role")
      .eq("profile_id", profile.id)
      .eq("role", "admin")
      .limit(1)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: "Only school admins can update school settings" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = updateSchoolSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.division !== undefined) updateData.division = parsed.data.division;
    if (parsed.data.conference !== undefined) updateData.conference = parsed.data.conference;
    if (parsed.data.city !== undefined) updateData.city = parsed.data.city;
    if (parsed.data.state !== undefined) updateData.state = parsed.data.state;

    const { data: school, error: updateError } = await supabase
      .from("schools")
      .update(updateData)
      .eq("id", membership.school_id)
      .select()
      .single();

    if (updateError) {
      console.error("School update error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(school);
  } catch (error) {
    console.error("Schools PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
