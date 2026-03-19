import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (adminProfile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { school_id, rows, column_mapping } = body;

    if (!school_id || !rows || !column_mapping) {
      return NextResponse.json(
        { error: "Missing required fields: school_id, rows, column_mapping" },
        { status: 400 }
      );
    }

    // Get school info to populate athlete records
    const { data: school } = await supabase
      .from("schools")
      .select("name, city, state")
      .eq("id", school_id)
      .single();

    if (!school) {
      return NextResponse.json(
        { error: "School not found" },
        { status: 404 }
      );
    }

    // Use service client to bypass RLS for bulk admin insert
    const serviceClient = createServiceClient();

    let imported = 0;
    let warnings = 0;
    let errors = 0;

    // Create roster import tracking record
    const { data: importRecord, error: importError } = await serviceClient
      .from("roster_imports")
      .insert({
        school_id,
        file_name: body.file_name || "import.csv",
        total_rows: rows.length,
        status: "importing",
        column_mapping,
        created_by: adminProfile.id,
      })
      .select()
      .single();

    if (importError) {
      return NextResponse.json(
        { error: importError.message },
        { status: 500 }
      );
    }

    // Process each row
    for (const row of rows) {
      try {
        const firstName = row[column_mapping.first_name]?.trim();
        const lastName = row[column_mapping.last_name]?.trim();

        if (!firstName || !lastName) {
          warnings++;
          continue;
        }

        const fullName = `${firstName} ${lastName}`;
        const position = column_mapping.position !== undefined
          ? row[column_mapping.position]?.trim() || "ATH"
          : "ATH";
        const classYear = column_mapping.class_year !== undefined
          ? parseInt(row[column_mapping.class_year]) || new Date().getFullYear() + 1
          : new Date().getFullYear() + 1;
        const email = column_mapping.email !== undefined
          ? row[column_mapping.email]?.trim()
          : null;

        // Create auth user via admin API (service role)
        const generatedEmail = email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Date.now()}@roster.repmax.io`;
        const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
          email: generatedEmail,
          password: `RepMax-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          email_confirm: true,
          user_metadata: { full_name: fullName, role: "athlete" },
        });

        if (authError || !authData.user) {
          errors++;
          continue;
        }

        // Create profile
        const { data: profile, error: profileError } = await serviceClient
          .from("profiles")
          .insert({
            user_id: authData.user.id,
            role: "athlete",
            full_name: fullName,
          })
          .select("id")
          .single();

        if (profileError || !profile) {
          errors++;
          continue;
        }

        // Create athlete record with proper schema columns
        const athleteData: Record<string, string | number | boolean | null> = {
          profile_id: profile.id,
          high_school: school.name,
          city: school.city || "",
          state: school.state || "",
          class_year: classYear,
          primary_position: position,
          verified: false,
        };

        // Optional fields
        if (column_mapping.height !== undefined && row[column_mapping.height]) {
          const heightStr = row[column_mapping.height].trim();
          const inches = parseHeightToInches(heightStr);
          if (inches) athleteData.height_inches = inches;
        }
        if (column_mapping.weight !== undefined && row[column_mapping.weight]) {
          const w = parseInt(row[column_mapping.weight]);
          if (w > 0) athleteData.weight_lbs = w;
        }
        if (column_mapping.gpa !== undefined && row[column_mapping.gpa]) {
          const g = parseFloat(row[column_mapping.gpa]);
          if (g > 0 && g <= 5.0) athleteData.gpa = g;
        }
        if (column_mapping.phone !== undefined && row[column_mapping.phone]) {
          athleteData.phone = row[column_mapping.phone].trim();
        }

        const { error: athleteError } = await serviceClient
          .from("athletes")
          .insert(athleteData);

        if (athleteError) {
          errors++;
          continue;
        }

        // Link athlete to school via school_members
        await serviceClient.from("school_members").insert({
          school_id,
          profile_id: profile.id,
          role: "staff", // roster athletes linked as staff (lowest org role)
        });

        imported++;
      } catch {
        errors++;
      }
    }

    // Update import record with results
    await serviceClient
      .from("roster_imports")
      .update({
        imported,
        warnings,
        errors,
        status: errors === rows.length ? "failed" : "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", importRecord.id);

    return NextResponse.json({
      import_id: importRecord.id,
      imported,
      warnings,
      errors,
      total: rows.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/** Parse height string like "5'11", "5-11", "71", "5'11\"" to inches */
function parseHeightToInches(str: string): number | null {
  // Already inches (just a number)
  const plain = parseInt(str);
  if (/^\d+$/.test(str.trim()) && plain >= 48 && plain <= 96) return plain;

  // Feet-inches pattern (5'11, 5-11, 5'11")
  const match = str.match(/(\d+)['\-](\d+)/);
  if (match) {
    const feet = parseInt(match[1]);
    const inches = parseInt(match[2]);
    if (feet >= 4 && feet <= 7 && inches >= 0 && inches <= 11) {
      return feet * 12 + inches;
    }
  }

  return null;
}
