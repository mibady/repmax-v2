import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAthleteForCoach } from "@/lib/actions/coach-roster-actions";

interface ImportError {
  row: number;
  name: string;
  email: string;
  error: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ROWS = 100;

function parseCSV(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  return lines.map((line) =>
    line.split(",").map((cell) => cell.trim().replace(/^["']|["']$/g, ""))
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (!profile || profile.role !== "coach") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: team } = await supabase
      .from("teams")
      .select("id, school_name, city, state")
      .eq("coach_profile_id", profile.id)
      .single();

    if (!team) {
      return NextResponse.json(
        { error: "No team found. Complete team setup first." },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "CSV file is required" },
        { status: 400 }
      );
    }

    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length < 2) {
      return NextResponse.json(
        { error: "CSV must have a header row and at least one data row" },
        { status: 400 }
      );
    }

    // Parse header to find column indices
    const header = rows[0].map((h) => h.toLowerCase().trim());
    const nameIdx = header.findIndex((h) =>
      ["name", "full_name", "fullname", "athlete"].includes(h)
    );
    const emailIdx = header.findIndex((h) =>
      ["email", "email_address", "emailaddress"].includes(h)
    );
    const posIdx = header.findIndex((h) =>
      ["position", "pos", "primary_position"].includes(h)
    );
    const classIdx = header.findIndex((h) =>
      ["class_year", "classyear", "class", "year", "grad_year", "graduation"].includes(h)
    );

    if (nameIdx === -1 || emailIdx === -1) {
      return NextResponse.json(
        { error: "CSV must have 'Name' and 'Email' columns" },
        { status: 400 }
      );
    }

    const dataRows = rows.slice(1);
    if (dataRows.length > MAX_ROWS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_ROWS} rows per upload` },
        { status: 400 }
      );
    }

    let created = 0;
    let linked = 0;
    const errors: ImportError[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const name = row[nameIdx]?.trim();
      const email = row[emailIdx]?.trim();
      const position = posIdx !== -1 ? row[posIdx]?.trim() || "ATH" : "ATH";
      const classYear =
        classIdx !== -1 ? parseInt(row[classIdx]?.trim()) : new Date().getFullYear() + 1;

      if (!name || !email) {
        errors.push({
          row: i + 2,
          name: name || "",
          email: email || "",
          error: "Name and email are required",
        });
        continue;
      }

      if (!EMAIL_REGEX.test(email)) {
        errors.push({ row: i + 2, name, email, error: "Invalid email" });
        continue;
      }

      if (classYear && (classYear < 2024 || classYear > 2032)) {
        errors.push({ row: i + 2, name, email, error: "Invalid class year" });
        continue;
      }

      const result = await createAthleteForCoach({
        fullName: name,
        email,
        position,
        classYear: classYear || new Date().getFullYear() + 1,
        schoolName: team.school_name,
        city: team.city,
        state: team.state,
        teamId: team.id,
        coachProfileId: profile.id,
      });

      if (result.error && !result.athleteId) {
        errors.push({ row: i + 2, name, email, error: result.error });
      } else if (result.result === "created") {
        created++;
      } else {
        linked++;
      }
    }

    return NextResponse.json({
      total: dataRows.length,
      created,
      linked,
      errors,
    });
  } catch (err) {
    console.error("Import roster error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
