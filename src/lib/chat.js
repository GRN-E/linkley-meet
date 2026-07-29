/* ============================================================
   LINKLEY — Chat data layer
   Points are only charged when a NEW direct chat is opened.
   Everything inside a conversation is free.
   ============================================================ */
import { supabase } from "./supabase";

export const CHAT_OPEN_COST = 5;

export async function myConversations() {
  const { data, error } = await supabase.rpc("my_conversations");
  if (error) throw error;
  return data || [];
}

export async function conversationMessages(conversationId, limit = 200) {
  const { data, error } = await supabase.rpc("conversation_messages", {
    p_conversation_id: conversationId, p_limit: limit,
  });
  if (error) throw error;
  return data || [];
}

export async function sendMessage(conversationId, body) {
  const { data, error } = await supabase.rpc("send_message", {
    p_conversation_id: conversationId, p_body: body,
  });
  if (error) throw error;
  return data;
}

/** Opens (or reuses) a direct chat with an expert. Costs 5 points the first time. */
export async function startExpertChat(expertId, message) {
  const { data, error } = await supabase.rpc("start_expert_chat", {
    p_expert_id: expertId, p_message: message,
  });
  if (error) throw error;
  return data;
}

export async function markRead(conversationId) {
  try { await supabase.rpc("mark_conversation_read", { p_conversation_id: conversationId }); }
  catch { /* not fatal */ }
}

export async function unreadTotal() {
  const { data, error } = await supabase.rpc("unread_total");
  return error ? 0 : (data || 0);
}

/* ------------------------------------------------------------
   Realtime

   Every subscriber gets its OWN channel name. supabase-js hands
   back the same channel object when a name is reused, and adding
   a postgres_changes listener to an already-subscribed channel
   throws "cannot add postgres_changes callbacks ... after
   subscribe()". Unique names avoid that entirely, and it also
   survives React StrictMode's double-mount in development.

   Realtime is an enhancement, never load-bearing: if anything
   here fails the page keeps working, just without live updates.
   ------------------------------------------------------------ */
let channelSeq = 0;
const uniqueName = (prefix) =>
  `${prefix}:${Date.now().toString(36)}:${(channelSeq += 1)}:${Math.random().toString(36).slice(2, 8)}`;

function safeChannel(name, filter, onInsert) {
  let channel;
  try {
    channel = supabase
      .channel(name)
      .on("postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", ...filter },
          (payload) => { try { onInsert(payload.new); } catch (e) { console.error("[LINKLEY realtime handler]", e); } })
      .subscribe((status, err) => {
        if (err) console.warn("[LINKLEY realtime]", name, status, err);
      });
  } catch (e) {
    console.warn("[LINKLEY realtime setup failed]", e);
    return () => {};
  }
  return () => {
    try { supabase.removeChannel(channel); } catch { /* already gone */ }
  };
}

/** Live updates for one conversation. Returns an unsubscribe function. */
export function subscribeToConversation(conversationId, onInsert) {
  if (!conversationId) return () => {};
  return safeChannel(
    uniqueName("conv:" + conversationId),
    { filter: `conversation_id=eq.${conversationId}` },
    onInsert
  );
}

/** Live updates for the badge and the sidebar. */
export function subscribeToAllMessages(onInsert) {
  return safeChannel(uniqueName("msgs:all"), {}, onInsert);
}

export function chatErrorKey(err) {
  const m = String(err?.message || "");
  if (m.includes("INSUFFICIENT_POINTS")) return "insufficient";
  if (m.includes("SELF_CHAT")) return "ch_err_self";
  if (m.includes("NOT_A_MEMBER")) return "ch_err_member";
  if (m.includes("EMPTY_MESSAGE")) return "ch_err_empty";
  return "err_generic";
}

export function shortTime(iso, lang = "mn") {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString(lang === "mn" ? "mn-MN" : "en-GB",
      { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString(lang === "mn" ? "mn-MN" : "en-GB",
    { month: "short", day: "numeric" });
}
