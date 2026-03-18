import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

// Get conversation thread with a specific contact
export async function GET(
  request: Request,
  { params }: { params: Promise<{ contactId: string }> }
) {
  try {
    const supabase = await createClient();
    const { contactId } = await params;

    // Validate contactId is a valid UUID
    const uuidSchema = z.string().uuid();
    const parsedContactId = uuidSchema.safeParse(contactId);
    if (!parsedContactId.success) {
      return NextResponse.json({ error: "Invalid contact ID" }, { status: 400 });
    }

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // For parents, also include linked athlete's profile IDs
    const myProfileIds = [profile.id];
    if (profile.role === "parent") {
      const { data: links } = await supabase
        .from("parent_links")
        .select("athlete_profile_id")
        .eq("parent_profile_id", profile.id);
      if (links) {
        for (const link of links) {
          myProfileIds.push(link.athlete_profile_id);
        }
      }
    }

    // Get contact's profile
    const { data: contact } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role")
      .eq("id", contactId)
      .single();

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Get contact's organization info if they're a coach/recruiter
    let contactOrg = null;
    if (contact.role === "coach" || contact.role === "recruiter") {
      const { data: coach } = await supabase
        .from("coaches")
        .select("school_name, title, division")
        .eq("profile_id", contactId)
        .single();
      contactOrg = coach;
    }

    // Fetch all messages between current user (or linked athlete) and contact
    const orClauses = myProfileIds
      .map((pid) => `and(sender_id.eq.${pid},recipient_id.eq.${contactId}),and(sender_id.eq.${contactId},recipient_id.eq.${pid})`)
      .join(",");

    const { data: messages, error } = await supabase
      .from("messages")
      .select(`
        id,
        sender_id,
        recipient_id,
        subject,
        body,
        read,
        created_at
      `)
      .or(orClauses)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Messages query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mark received messages as read (for parent or linked athlete)
    const unreadMessageIds = messages
      ?.filter((m) => myProfileIds.includes(m.recipient_id) && !m.read)
      .map((m) => m.id);

    if (unreadMessageIds && unreadMessageIds.length > 0) {
      await supabase
        .from("messages")
        .update({ read: true })
        .in("id", unreadMessageIds);
    }

    // Transform messages to include sender info
    const myIdSet = new Set(myProfileIds);
    const transformedMessages = messages?.map((msg) => ({
      id: msg.id,
      senderId: myIdSet.has(msg.sender_id) ? "me" : "other",
      senderName:
        myIdSet.has(msg.sender_id) ? profile.full_name : contact.full_name,
      content: msg.body,
      timestamp: new Date(msg.created_at).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
      status: msg.read ? ("read" as const) : ("delivered" as const),
      createdAt: msg.created_at,
    }));

    return NextResponse.json({
      messages: transformedMessages || [],
      contact: {
        id: contact.id,
        name: contact.full_name,
        avatar: contact.avatar_url,
        role: contact.role,
        organization: contactOrg?.school_name,
        title: contactOrg?.title,
        division: contactOrg?.division,
      },
      currentUser: {
        id: profile.id,
        name: profile.full_name,
        avatar: profile.avatar_url,
      },
    });
  } catch (error) {
    console.error("Conversation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Send a message to a specific contact
export async function POST(
  request: Request,
  { params }: { params: Promise<{ contactId: string }> }
) {
  try {
    const supabase = await createClient();
    const { contactId } = await params;

    // Validate contactId
    const uuidSchema = z.string().uuid();
    if (!uuidSchema.safeParse(contactId).success) {
      return NextResponse.json({ error: "Invalid contact ID" }, { status: 400 });
    }

    // Get current user
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

    // Parse request body
    const body = await request.json();
    const messageSchema = z.object({
      body: z.string().min(1).max(5000),
      subject: z.string().optional(),
    });

    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid message", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Create message
    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        sender_id: profile.id,
        recipient_id: contactId,
        body: parsed.data.body,
        subject: parsed.data.subject,
      })
      .select()
      .single();

    if (error) {
      console.error("Message create error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      id: message.id,
      senderId: "me",
      content: message.body,
      timestamp: new Date(message.created_at).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
      status: "sent" as const,
      createdAt: message.created_at,
    });
  } catch (error) {
    console.error("Send message API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
