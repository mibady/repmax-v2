"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function sendMessage(
  recipientId: string,
  body: string,
  subject?: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get sender's profile
  const { data: senderProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!senderProfile) {
    return { error: "Profile not found" };
  }

  const { error } = await supabase.from("messages").insert({
    sender_id: senderProfile.id,
    recipient_id: recipientId,
    body,
    subject,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/messages");
  return { success: true };
}

export async function markMessageAsRead(messageId: string) {
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
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found" };
  }

  // Only mark as read if user is the recipient
  const { error } = await supabase
    .from("messages")
    .update({ read: true })
    .eq("id", messageId)
    .eq("recipient_id", profile.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/messages");
  return { success: true };
}

export async function getMessages() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { messages: [], unreadCount: 0 };
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { messages: [], unreadCount: 0 };
  }

  // Get messages where user is sender or recipient
  const { data: messages } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:profiles!sender_id(id, full_name, avatar_url),
      recipient:profiles!recipient_id(id, full_name, avatar_url)
    `
    )
    .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
    .order("created_at", { ascending: false });

  // Count unread messages
  const unreadCount =
    messages?.filter((m) => m.recipient_id === profile.id && !m.read).length ||
    0;

  return { messages: messages || [], unreadCount };
}
