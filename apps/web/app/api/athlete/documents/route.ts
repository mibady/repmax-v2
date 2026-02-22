import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAthleteTier } from "@/lib/utils/subscription-server";

// GET /api/athlete/documents - Fetch athlete's documents
export async function GET() {
  try {
    const { authorized } = await requireAthleteTier("premium");
    if (!authorized) {
      return NextResponse.json({ error: "Premium subscription required" }, { status: 403 });
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get athlete
    const { data: athlete } = await supabase
      .from("athletes")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (!athlete) {
      return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
    }

    // Get documents
    const { data: documents, error } = await supabase
      .from("documents")
      .select("*")
      .eq("athlete_id", athlete.id)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Error fetching documents:", error);
      return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
    }

    // Format documents for frontend
    const formattedDocs = (documents || []).map((doc) => ({
      id: doc.id,
      name: doc.title,
      type: doc.document_type === "transcript" ? "pdf" :
            doc.document_type === "test_score" ? "image" : "doc",
      size: "N/A", // Would need to store file size in DB
      uploadDate: new Date(doc.uploaded_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      verified: doc.verified,
      url: doc.file_url,
    }));

    return NextResponse.json({ documents: formattedDocs });
  } catch (error) {
    console.error("Documents API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/athlete/documents - Upload a new document
export async function POST(request: NextRequest) {
  try {
    const { authorized } = await requireAthleteTier("premium");
    if (!authorized) {
      return NextResponse.json({ error: "Premium subscription required" }, { status: 403 });
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get profile and athlete
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data: athlete } = await supabase
      .from("athletes")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (!athlete) {
      return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
    }

    const body = await request.json();

    const documentSchema = z.object({
      title: z.string().min(1, "Title is required"),
      document_type: z.enum(["transcript", "test_score", "medical", "eligibility", "other"]).default("other"),
      file_url: z.string().url("Valid file URL is required"),
    });

    const parsed = documentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body", details: parsed.error.flatten() }, { status: 400 });
    }

    // Insert document record
    const { data: doc, error } = await supabase
      .from("documents")
      .insert({
        athlete_id: athlete.id,
        title: parsed.data.title,
        document_type: parsed.data.document_type,
        file_url: parsed.data.file_url,
        verified: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating document:", error);
      return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
    }

    return NextResponse.json({
      document: {
        id: doc.id,
        name: doc.title,
        type: doc.document_type === "transcript" ? "pdf" :
              doc.document_type === "test_score" ? "image" : "doc",
        size: "N/A",
        uploadDate: new Date(doc.uploaded_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        verified: doc.verified,
        url: doc.file_url,
      },
    });
  } catch (error) {
    console.error("Documents POST API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/athlete/documents - Delete a document
export async function DELETE(request: NextRequest) {
  try {
    const { authorized } = await requireAthleteTier("premium");
    if (!authorized) {
      return NextResponse.json({ error: "Premium subscription required" }, { status: 403 });
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    // Get profile and athlete to verify ownership
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data: athlete } = await supabase
      .from("athletes")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (!athlete) {
      return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
    }

    // Delete document (RLS will verify ownership)
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", id)
      .eq("athlete_id", athlete.id);

    if (error) {
      console.error("Error deleting document:", error);
      return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Documents DELETE API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
