/* ============================================================
   LINKLEY — Project search field
   Type-ahead over project titles + tags, keyboard driven,
   with removable "active filter" pills underneath.
   Reuses the .exsearch-* / .exbar-* classes from expert-search.css
   ============================================================ */
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../lib/i18n.js";
import { CATEGORIES } from "../lib/ui.jsx";
import {
  projectSuggestions, popularTags, toggleIn,
  countProjectFilters, EMPTY_PROJECT_FILTERS,
} from "../lib/projects.js";

const RECENT_KEY = "linkley_recent_project_searches";
const MAX_RECENT = 6;
const readRecent = () => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; } };
function pushRecent(term) {
  const t = (term || "").trim();
  if (t.length < 2) return;
  const list = [t, ...readRecent().filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
}

export default function ProjectSearchBar({ filters, onChange, total, onOpenFilters }) {
  const { lang, t } = useLang();
  const nav = useNavigate();
  const [text, setText] = useState(filters.q || "");
  const [open, setOpen] = useState(false);
  const [sugs, setSugs] = useState([]);
  const [recent, setRecent] = useState(readRecent());
  const [tags, setTags] = useState([]);
  const [cursor, setCursor] = useState(-1);
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => { popularTags(12).then(setTags); }, []);
  useEffect(() => { setText(filters.q || ""); }, [filters.q]);

  useEffect(() => {
    const h = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    clearTimeout(timer.current);
    if (!text || text.trim().length < 2) { setSugs([]); return; }
    timer.current = setTimeout(() => {
      projectSuggestions(text, 8).then((r) => { setSugs(r); setCursor(-1); });
    }, 220);
    return () => clearTimeout(timer.current);
  }, [text]);

  const commit = useCallback((value, extra = {}) => {
    const q = value ?? text;
    pushRecent(q); setRecent(readRecent()); setOpen(false);
    onChange({ ...filters, q, ...extra });
  }, [text, filters, onChange]);

  const emptyState = !text || text.trim().length < 2;
  const items = emptyState
    ? [...recent.map((r) => ({ kind: "recent", label: r })),
       ...tags.map((x) => ({ kind: "tag", label: x.tag, hits: x.hits }))]
    : sugs.map((s) => ({ kind: s.kind, label: s.label, hits: s.hits, project_id: s.project_id }));

  const pick = (it) => {
    if (!it) return commit();
    if (it.kind === "tag") { setText(""); commit("", { tags: toggleIn(filters.tags, it.label) }); }
    else if (it.kind === "project" && it.project_id) { setOpen(false); nav("/projects/" + it.project_id); }
    else { setText(it.label); commit(it.label); }
  };

  const onKey = (e) => {
    if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); return; }
    if (e.key === "Enter") {
      e.preventDefault();
      if (open && cursor >= 0 && items[cursor]) pick(items[cursor]); else commit();
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!open) { setOpen(true); return; }
      e.preventDefault();
      const d = e.key === "ArrowDown" ? 1 : -1;
      setCursor((c) => { const n = c + d; return n < -1 ? items.length - 1 : n >= items.length ? -1 : n; });
    }
  };

  const set = (p) => onChange({ ...filters, ...p });
  const catName = (id) => { const c = CATEGORIES.find((x) => x.id === id); return c ? (lang === "mn" ? c.mn : c.en) : id; };
  const statusName = (s) => t({ open: "pj_status_open", in_progress: "pj_status_progress", completed: "pj_status_done" }[s] || s);
  const nActive = countProjectFilters(filters);

  const pills = [
    ...(filters.statuses || []).map((s) => ({ label: statusName(s), clear: () => set({ statuses: toggleIn(filters.statuses, s) }) })),
    ...(filters.categories || []).map((c) => ({ label: catName(c), clear: () => set({ categories: toggleIn(filters.categories, c) }) })),
    ...(filters.tags || []).map((x) => ({ label: "#" + x, clear: () => set({ tags: toggleIn(filters.tags, x) }) })),
    ...(filters.lookingFor || []).map((r) => ({ label: r, clear: () => set({ lookingFor: toggleIn(filters.lookingFor, r) }) })),
    ...(filters.openRoles ? [{ label: t("pj_open_roles"), clear: () => set({ openRoles: false }) }] : []),
    ...(filters.smallTeam ? [{ label: t("pj_small_team"), clear: () => set({ smallTeam: false }) }] : []),
  ];

  return (
    <div className="exsearch-wrap">
      <div className="exsearch" ref={boxRef}>
        <div className={"exsearch-field" + (open ? " open" : "")}>
          <span className="exsearch-ico" aria-hidden>⌕</span>
          <input
            ref={inputRef} value={text} autoComplete="off"
            placeholder={t("pj_search_ph")}
            onChange={(e) => { setText(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKey}
            aria-label={t("pj_search_ph")}
          />
          {text && (
            <button className="exsearch-clear" aria-label={t("pj_clear")}
              onClick={() => { setText(""); commit(""); inputRef.current?.focus(); }}>✕</button>
          )}
          <button className="btn btn-primary exsearch-go" onClick={() => commit()}>{t("pj_search_btn")}</button>
        </div>

        {open && (
          <div className="exsearch-drop">
            {emptyState ? (
              <>
                {recent.length > 0 && (
                  <>
                    <div className="psearch-head">
                      <span>{t("pj_recent")}</span>
                      <button className="psearch-mini" onClick={() => { localStorage.removeItem(RECENT_KEY); setRecent([]); }}>
                        {t("pj_clear_recent")}
                      </button>
                    </div>
                    {recent.map((r, i) => (
                      <div key={r} className={"psearch-row" + (cursor === i ? " on" : "")}
                        onMouseEnter={() => setCursor(i)}
                        onMouseDown={(e) => { e.preventDefault(); pick({ kind: "recent", label: r }); }}>
                        <span className="psearch-row-ico">↺</span>{r}
                      </div>
                    ))}
                  </>
                )}
                <div className="psearch-head"><span>{t("pj_popular_tags")}</span></div>
                <div className="psearch-tags">
                  {tags.map((x) => (
                    <button key={x.tag}
                      className={"chip" + ((filters.tags || []).includes(x.tag) ? " active" : "")}
                      onMouseDown={(e) => { e.preventDefault(); pick({ kind: "tag", label: x.tag }); }}>
                      #{x.tag} <span className="muted">{x.hits}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : items.length === 0 ? (
              <div className="psearch-empty">{t("pj_no_sug")}</div>
            ) : (
              items.map((s, i) => (
                <div key={s.kind + s.label + i}
                  className={"psearch-row" + (cursor === i ? " on" : "")}
                  onMouseEnter={() => setCursor(i)}
                  onMouseDown={(e) => { e.preventDefault(); pick(s); }}>
                  <span className="psearch-row-ico">{s.kind === "tag" ? "#" : "◪"}</span>
                  <span className="psearch-row-label">{s.label}</span>
                  <span className="psearch-row-kind">
                    {s.kind === "tag" ? `${s.hits} ${t("pj_projects_short")}` : t("pj_open_project")}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="exbar">
        <button className="btn btn-ghost btn-sm exbar-filter" onClick={onOpenFilters}>
          ☰ {t("ex_filters")}{nActive > 0 && <span className="exbar-badge">{nActive}</span>}
        </button>

        <div className="exbar-pills">
          {pills.map((p, i) => (
            <span className="pill pill-blue" key={i}>
              {p.label}<button className="ptag-x" onClick={p.clear} aria-label={t("pj_clear")}>✕</button>
            </span>
          ))}
          {(pills.length > 0 || filters.q) && (
            <button className="exbar-reset" onClick={() => { setText(""); onChange({ ...EMPTY_PROJECT_FILTERS }); }}>
              {t("pj_reset")}
            </button>
          )}
        </div>

        <div className="exbar-right">
          <span className="pcount">{t("pj_results", { n: total ?? 0 })}</span>
          <select className="pselect" value={filters.sort || "relevance"} onChange={(e) => set({ sort: e.target.value })}>
            <option value="relevance">{t("pj_sort_rel")}</option>
            <option value="new">{t("pj_sort_new")}</option>
            <option value="needs">{t("pj_sort_needs")}</option>
            <option value="team">{t("pj_sort_team")}</option>
            <option value="popular">{t("pj_sort_popular")}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
