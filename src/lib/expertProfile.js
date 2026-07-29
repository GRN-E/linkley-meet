/* ============================================================
   LINKLEY — Expert profile data layer
   ============================================================ */
import { supabase } from "./supabase";

/** Load the signed-in expert's full editable profile. */
export async function getMyExpertProfile(userId) {
  if (!userId) return null;
  const [{ data: expert }, { data: profile }, { data: cats }] = await Promise.all([
    supabase.from("experts").select("*").eq("id", userId).maybeSingle(),
    supabase.from("profiles").select("id, full_name, avatar_initials, avatar_color, role").eq("id", userId).maybeSingle(),
    supabase.from("expert_categories").select("category_id").eq("expert_id", userId),
  ]);
  if (!expert || !profile) return null;
  return {
    ...expert,
    full_name: profile.full_name || "",
    avatar_initials: profile.avatar_initials,
    avatar_color: profile.avatar_color,
    categories: (cats || []).map((c) => c.category_id),
  };
}

/** Save everything. Rating / sessions_count are NOT sent — the database
 *  revokes UPDATE on those columns so experts cannot inflate their own stats. */
export async function saveExpertProfile(userId, f) {
  // 1. name lives on profiles
  const initials = (f.full_name || "").trim().slice(0, 2).toUpperCase();
  const { error: pErr } = await supabase
    .from("profiles")
    .update({ full_name: (f.full_name || "").trim(), avatar_initials: initials || "??" })
    .eq("id", userId);
  if (pErr) throw pErr;

  // 2. the expert record
  const { error: eErr } = await supabase.from("experts").update({
    headline_mn: f.headline_mn || "",
    headline_en: f.headline_en || "",
    bio_mn: f.bio_mn || "",
    bio_en: f.bio_en || "",
    credentials_mn: f.credentials_mn || "",
    linkedin_url: f.linkedin_url || "",
    fee_mnt: Math.max(0, Number(f.fee_mnt) || 0),
    student_points: Math.max(0, Number(f.student_points) || 10),
    accepts_student: !!f.accepts_student,
    exp_years: Math.max(0, Number(f.exp_years) || 0),
    response_mins: Math.max(5, Number(f.response_mins) || 30),
    session_limit: Math.max(1, Number(f.session_limit) || 5),
    skills: f.skills || [],
    languages: f.languages || [],
    is_active: !!f.is_active,
    profile_published: !!f.profile_published,
  }).eq("id", userId);
  if (eErr) throw eErr;

  // 3. categories: replace the set
  const { error: dErr } = await supabase.from("expert_categories").delete().eq("expert_id", userId);
  if (dErr) throw dErr;
  if (f.categories?.length) {
    const rows = f.categories.map((c) => ({ expert_id: userId, category_id: c }));
    const { error: cErr } = await supabase.from("expert_categories").insert(rows);
    if (cErr) throw cErr;
  }
  return true;
}

export async function markOnboarded(userId) {
  await supabase.from("experts").update({ onboarded_at: new Date().toISOString() }).eq("id", userId);
}

/* ---------------- profile completeness ----------------
   Mirrors expert_profile_score() in the database. Kept client-side too
   so the meter updates live as the expert types. */
export const PROFILE_STEPS = [
  { key: "full_name",   points: 10, test: (f) => (f.full_name || "").trim().length > 1 },
  { key: "headline",    points: 20, test: (f) => (f.headline_mn || "").trim().length > 5
                                                 && !(f.headline_mn || "").includes("шинэ мэргэжилтэн") },
  { key: "bio",         points: 20, test: (f) => (f.bio_mn || "").trim().length >= 80 },
  { key: "skills",      points: 20, test: (f) => (f.skills || []).length >= 3 },
  { key: "categories",  points: 10, test: (f) => (f.categories || []).length >= 1 },
  { key: "fee",         points: 10, test: (f) => Number(f.fee_mnt) > 0 },
  { key: "credentials", points: 10, test: (f) => (f.credentials_mn || "").trim().length > 5 },
];

export function profileScore(f) {
  if (!f) return { score: 0, missing: PROFILE_STEPS.map((s) => s.key) };
  let score = 0;
  const missing = [];
  PROFILE_STEPS.forEach((s) => { if (s.test(f)) score += s.points; else missing.push(s.key); });
  return { score: Math.min(100, score), missing };
}

/** What to nudge next — the highest-value missing item. */
export function nextBestAction(f) {
  const { missing } = profileScore(f);
  if (!missing.length) return null;
  const order = ["headline", "bio", "skills", "categories", "fee", "credentials", "full_name"];
  return order.find((k) => missing.includes(k)) || missing[0];
}
