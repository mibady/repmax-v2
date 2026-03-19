import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
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
      size: "N/A",
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

// Infer document type from file MIME type
function inferDocumentType(mimeType: string): string {
  if (mimeType === "application/pdf") return "transcript";
  if (mimeType.startsWith("image/")) return "test_score";
  return "other";
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

    // Handle FormData upload
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB" }, { status: 400 });
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split(".").pop() || "bin";
    const fileName = `${athlete.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("athlete-documents")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("athlete-documents")
      .getPublicUrl(fileName);

    const fileUrl = urlData.publicUrl;
    const documentType = inferDocumentType(file.type);
    const title = file.name.replace(/\.[^.]+$/, ""); // Strip extension for title

    // Insert document record
    const { data: doc, error: insertError } = await supabase
      .from("documents")
      .insert({
        athlete_id: athlete.id,
        title,
        document_type: documentType,
        file_url: fileUrl,
        verified: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating document:", insertError);
      return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
    }

    return NextResponse.json({
      document: {
        id: doc.id,
        name: doc.title,
        type: doc.document_type === "transcript" ? "pdf" :
              doc.document_type === "test_score" ? "image" : "doc",
        size: `${(file.size / 1024).toFixed(0)} KB`,
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

    // Support both query param and body for ID
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");
    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {
        // No body
      }
    }

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
