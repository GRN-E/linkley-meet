/* ============================================================
   LINKLEY — Expert search data layer
   ============================================================ */
import { supabase } from "./supabase";

export const EXPERT_SORTS = ["relevance", "rating", "sessions", "fast", "price_low", "price_high"];

export const PRICE_STEPS = [30000, 40000, 50000, 60000, 100000];
export const RATING_STEPS = [4.0, 4.5, 4.8];
export const RESPONSE_STEPS = [15, 30, 60];

export const EMPTY_FILTERS = {
  q: "",
  categories: [],
  skills: [],
  minRating: null,
  maxFee: null,
  maxResponse: null,
  studentOnly: false,
  sort: "relevance",
};

export async function searchExperts(f = {}, { limit = 24, offset = 0 } = {}) {
  const { data, error } = await supabase.rpc("search_experts", {
    p_q: f.q || "",
    p_categories: f.categories?.length ? f.categories : null,
    p_skills: f.skills?.length ? f.skills : null,
    p_min_rating: f.minRating ?? null,
    p_max_fee: f.maxFee ?? null,
    p_min_fee: null,
    p_max_response: f.maxResponse ?? null,
    p_student_only: f.studentOnly ? true : null,
    p_sort: f.sort || "relevance",
    p_limit: limit,
    p_offset: offset,
  });
  if (error) throw error;
  return {
    rows: data || [],
    total: data && data.length ? Number(data[0].total_count) : 0,
  };
}

export async function expertSuggestions(q, limit = 8) {
  if (!q || q.trim().length < 2) return [];
  const { data, error } = await supabase.rpc("expert_suggestions", { p_q: q, p_limit: limit });
  return error ? [] : data || [];
}

export async function popularSkills(limit = 14) {
  const { data, error } = await supabase.rpc("popular_expert_skills", { p_limit: limit });
  return error ? [] : data || [];
}

/** { category: {business: 3, ...}, skill: {React: 1, ...} } */
export async function expertFacets() {
  const { data, error } = await supabase.rpc("expert_facets");
  if (error) return { category: {}, skill: {} };
  const out = { category: {}, skill: {} };
  (data || []).forEach((r) => { out[r.kind] = out[r.kind] || {}; out[r.kind][r.key] = r.hits; });
  return out;
}

/* ---- URL <-> filters (shareable searches) ---- */
export function filtersFromParams(sp) {
  const csv = (k) => (sp.get(k) ? sp.get(k).split(",").filter(Boolean) : []);
  return {
    q: sp.get("q") || "",
    categories: csv("cat"),
    skills: csv("skill"),
    minRating: sp.get("rating") ? Number(sp.get("rating")) : null,
    maxFee: sp.get("fee") ? Number(sp.get("fee")) : null,
    maxResponse: sp.get("resp") ? Number(sp.get("resp")) : null,
    studentOnly: sp.get("student") === "1",
    sort: sp.get("sort") || "relevance",
  };
}

export function paramsFromFilters(f) {
  const o = {};
  if (f.q) o.q = f.q;
  if (f.categories?.length) o.cat = f.categories.join(",");
  if (f.skills?.length) o.skill = f.skills.join(",");
  if (f.minRating) o.rating = String(f.minRating);
  if (f.maxFee) o.fee = String(f.maxFee);
  if (f.maxResponse) o.resp = String(f.maxResponse);
  if (f.studentOnly) o.student = "1";
  if (f.sort && f.sort !== "relevance") o.sort = f.sort;
  return o;
}

export function countActive(f) {
  return (f.categories?.length || 0) + (f.skills?.length || 0) +
    (f.minRating ? 1 : 0) + (f.maxFee ? 1 : 0) +
    (f.maxResponse ? 1 : 0) + (f.studentOnly ? 1 : 0);
}

export const toggleIn = (arr, v) =>
  (arr || []).includes(v) ? arr.filter((x) => x !== v) : [...(arr || []), v];
