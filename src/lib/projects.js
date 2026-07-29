/* ============================================================
   LINKLEY — Projects data layer
   All writes go through Supabase RPCs so points and permissions
   are enforced on the server, never in the browser.
   ============================================================ */
import { supabase } from "./supabase";

export const JOIN_COST = 10;
export const PROJECT_SORTS = ["relevance", "new", "funded", "progress", "team", "popular"];

export const EMPTY_PROJECT_FILTERS = {
  q: "",
  categories: [],
  tags: [],
  statuses: [],
  lookingFor: [],
  needsFunding: false,
  hasGoal: false,
  sort: "relevance",
};

/* ---------------- search ---------------- */
export async function searchProjects(f = {}, { limit = 24, offset = 0 } = {}) {
  const { data, error } = await supabase.rpc("search_projects", {
    p_q: f.q || "",
    p_categories: f.categories?.length ? f.categories : null,
    p_tags: f.tags?.length ? f.tags : null,
    p_statuses: f.statuses?.length ? f.statuses : null,
    p_looking_for: f.lookingFor?.length ? f.lookingFor : null,
    p_needs_funding: f.needsFunding ? true : null,
    p_has_goal: f.hasGoal ? true : null,
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

export async function projectSuggestions(q, limit = 8) {
  if (!q || q.trim().length < 2) return [];
  const { data, error } = await supabase.rpc("project_suggestions", { p_q: q, p_limit: limit });
  return error ? [] : data || [];
}

export async function popularTags(limit = 40) {
  const { data, error } = await supabase.rpc("popular_project_tags", { p_limit: limit });
  return error ? [] : data || [];
}

export async function popularRoles(limit = 20) {
  const { data, error } = await supabase.rpc("popular_project_roles", { p_limit: limit });
  return error ? [] : data || [];
}

/** { category:{business:3}, status:{open:7}, tag:{апп:2}, role:{Дизайнер:2} } */
export async function projectFacets() {
  const { data, error } = await supabase.rpc("project_facets");
  const out = { category: {}, status: {}, tag: {}, role: {} };
  if (error) return out;
  (data || []).forEach((r) => { out[r.kind] = out[r.kind] || {}; out[r.kind][r.key] = r.hits; });
  return out;
}

/* ---------------- URL <-> filters ---------------- */
export function projectFiltersFromParams(sp) {
  const csv = (k) => (sp.get(k) ? sp.get(k).split(",").filter(Boolean) : []);
  return {
    q: sp.get("q") || "",
    categories: csv("cat"),
    tags: csv("tag"),
    statuses: csv("status"),
    lookingFor: csv("role"),
    needsFunding: sp.get("fund") === "1",
    hasGoal: sp.get("goal") === "1",
    sort: sp.get("sort") || "relevance",
  };
}

export function projectParamsFromFilters(f) {
  const o = {};
  if (f.q) o.q = f.q;
  if (f.categories?.length) o.cat = f.categories.join(",");
  if (f.tags?.length) o.tag = f.tags.join(",");
  if (f.statuses?.length) o.status = f.statuses.join(",");
  if (f.lookingFor?.length) o.role = f.lookingFor.join(",");
  if (f.needsFunding) o.fund = "1";
  if (f.hasGoal) o.goal = "1";
  if (f.sort && f.sort !== "relevance") o.sort = f.sort;
  return o;
}

export function countProjectFilters(f) {
  return (f.categories?.length || 0) + (f.tags?.length || 0) +
    (f.statuses?.length || 0) + (f.lookingFor?.length || 0) +
    (f.needsFunding ? 1 : 0) + (f.hasGoal ? 1 : 0);
}

export const toggleIn = (arr, v) =>
  (arr || []).includes(v) ? arr.filter((x) => x !== v) : [...(arr || []), v];

/* ---------------- detail / write ---------------- */
export async function getProject(id) {
  const { data: project, error } = await supabase
    .from("projects").select("*").eq("id", id).maybeSingle();
  if (error || !project) return null;

  const [{ data: members }, { data: owner }] = await Promise.all([
    supabase.from("project_members").select("user_id, role, joined_at").eq("project_id", id),
    supabase.from("profiles").select("id, full_name, avatar_initials, avatar_color")
      .eq("id", project.owner_id).maybeSingle(),
  ]);

  const ids = (members || []).map((m) => m.user_id);
  let people = [];
  if (ids.length) {
    const { data } = await supabase
      .from("profiles").select("id, full_name, avatar_initials, avatar_color, role").in("id", ids);
    people = data || [];
  }
  const team = (members || []).map((m) => ({
    ...m, profile: people.find((p) => p.id === m.user_id) || null,
  }));
  return { ...project, owner: owner || null, team };
}

export async function getProjectRequests(projectId) {
  const { data } = await supabase
    .from("project_requests").select("*")
    .eq("project_id", projectId).order("created_at", { ascending: false });
  const ids = [...new Set((data || []).map((r) => r.sender_id))];
  let people = [];
  if (ids.length) {
    const { data: p } = await supabase
      .from("profiles").select("id, full_name, avatar_initials, avatar_color, role").in("id", ids);
    people = p || [];
  }
  return (data || []).map((r) => ({ ...r, sender: people.find((p) => p.id === r.sender_id) || null }));
}

export async function getProjectFunding(projectId) {
  const { data } = await supabase
    .from("project_funding").select("*")
    .eq("project_id", projectId).order("created_at", { ascending: false });
  return data || [];
}

export async function createProject(p) {
  const { data, error } = await supabase.rpc("create_project", {
    p_title: p.title,
    p_summary: p.summary || "",
    p_description: p.description || "",
    p_category: p.category || "",
    p_tags: p.tags || [],
    p_looking_for: p.lookingFor || [],
    p_funding_goal: Number(p.fundingGoal) || 0,
  });
  if (error) throw error;
  return data;
}

export async function sendProjectRequest(projectId, message) {
  const { data, error } = await supabase.rpc("send_project_request", {
    p_project_id: projectId, p_message: message || "",
  });
  if (error) throw error;
  return data;
}

export async function setRequestStatus(requestId, status) {
  const { error } = await supabase.rpc("set_project_request_status", {
    p_request_id: requestId, p_status: status,
  });
  if (error) throw error;
}

export async function pledgeFunding(projectId, amountMnt, message) {
  const { data, error } = await supabase.rpc("pledge_funding", {
    p_project_id: projectId, p_amount: Number(amountMnt), p_message: message || "",
  });
  if (error) throw error;
  return data;
}

export async function myProjects(userId) {
  if (!userId) return [];
  const { data: mem } = await supabase
    .from("project_members").select("project_id, role").eq("user_id", userId);
  const ids = (mem || []).map((m) => m.project_id);
  if (!ids.length) return [];
  const { data } = await supabase
    .from("projects").select("*").in("id", ids).order("created_at", { ascending: false });
  return (data || []).map((p) => ({
    ...p, myRole: (mem.find((m) => m.project_id === p.id) || {}).role,
  }));
}

export function projectErrorKey(err) {
  const m = String(err?.message || "");
  if (m.includes("INSUFFICIENT_POINTS")) return "insufficient";
  if (m.includes("ALREADY_MEMBER")) return "pj_err_member";
  if (m.includes("ALREADY_REQUESTED")) return "pj_err_requested";
  if (m.includes("OWN_PROJECT")) return "pj_err_own";
  if (m.includes("ONLY_EXPERTS_CAN_CREATE")) return "pj_err_expert_only";
  if (m.includes("TITLE_REQUIRED")) return "pj_err_title";
  return "err_generic";
}
