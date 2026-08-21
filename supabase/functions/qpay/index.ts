// LINKLEY — QPay top-up Edge Function
// Sandbox mode (no QPay secrets set): credits points immediately so the whole
// flow is testable. Live mode (QPAY_USERNAME + QPAY_PASSWORD secrets set):
// creates a real QPay invoice and returns it for the client to pay; points are
// credited by the qpay-callback webhook after QPay confirms payment.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

// Only these packs may be purchased (prevents arbitrary crediting).
const PACKS: Record<number, number> = { 100: 5000, 300: 14000, 1000: 44000 };

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Identify the caller from their JWT.
    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "NOT_AUTHENTICATED" }, 401);

    const { points } = await req.json().catch(() => ({}));
    const amount = Number(points);
    if (!PACKS[amount]) return json({ error: "INVALID_PACK" }, 400);
    const priceMnt = PACKS[amount];

    const admin = createClient(SUPABASE_URL, SERVICE);
    const qpayUser = Deno.env.get("QPAY_USERNAME");
    const qpayPass = Deno.env.get("QPAY_PASSWORD");

    // ---------- LIVE MODE (real QPay) ----------
    if (qpayUser && qpayPass) {
      // 1) get access token
      const auth = await fetch("https://merchant.qpay.mn/v2/auth/token", {
        method: "POST",
        headers: { "Authorization": "Basic " + btoa(`${qpayUser}:${qpayPass}`), "Content-Type": "application/json" },
      }).then((r) => r.json());
      // 2) create invoice
      const invoice = await fetch("https://merchant.qpay.mn/v2/invoice", {
        method: "POST",
        headers: { "Authorization": `Bearer ${auth.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_code: Deno.env.get("QPAY_INVOICE_CODE"),
          sender_invoice_no: `LINKLEY-${user.id.slice(0, 8)}-${Date.now()}`,
          invoice_receiver_code: user.id,
          invoice_description: `LINKLEY ${amount} points`,
          amount: priceMnt,
          callback_url: `${SUPABASE_URL}/functions/v1/qpay-callback?uid=${user.id}&pts=${amount}`,
        }),
      }).then((r) => r.json());
      return json({ mode: "live", invoice });
    }

    // ---------- SANDBOX MODE (no secrets) ----------
    const { data: prof } = await admin.from("profiles").select("points").eq("id", user.id).single();
    const newPoints = (prof?.points ?? 0) + amount;
    await admin.from("profiles").update({ points: newPoints }).eq("id", user.id);
    await admin.from("points_ledger").insert({ user_id: user.id, delta: amount, reason: "topup_sandbox" });
    return json({ mode: "sandbox", points: newPoints, priceMnt });
  } catch (e) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
});
