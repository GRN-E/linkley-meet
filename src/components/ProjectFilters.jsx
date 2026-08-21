/* ============================================================
   LINKLEY — Project facet panel
   Sidebar on desktop, slide-over sheet on mobile.
   Reuses the .facet-* / .exfilters classes from expert-search.css
   ============================================================ */
import { useEffect, useState } from "react";
import { useLang } from "../lib/i18n.js";
import { CATEGORIES } from "../lib/ui.jsx";
import {
  projectFacets, popularTags, popularRoles, toggleIn,
  countProjectFilters, EMPTY_PROJECT_FILTERS,
} from "../lib/projects.js";

const STATUSES = ["open", "in_progress", "completed"];

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="facet">
      <button className="facet-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{title}</span><span className="facet-caret">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="facet-body">{children}</div>}
    </div>
  );
}

export default function ProjectFilters({ filters, onChange, open, onClose }) {
  const { lang, t } = useLang();
  const [facets, setFacets] = useState({ category: {}, status: {}, tag: {}, role: {} });
  const [tags, setTags] = useState([]);
  const [roles, setRoles] = useState([]);
  const [tagQuery, setTagQuery] = useState("");

  useEffect(() => {
    projectFacets().then(setFacets);
    popularTags(40).then(setTags);
    popularRoles(20).then(setRoles);
  }, []);

  const set = (p) => onChange({ ...filters, ...p });
  const catName = (c) => (lang === "mn" ? c.mn : c.en);
  const nActive = countProjectFilters(filters);

  const shownTags = tags.filter((x) =>
    !tagQuery.trim() || x.tag.toLowerCase().includes(tagQuery.trim().toLowerCase()));

  const body = (
    <>
      <div className="facet-top">
        <h3>{t("ex_filters")}</h3>
        {nActive > 0 && (
          <button className="psearch-mini"
            onClick={() => onChange({ ...EMPTY_PROJECT_FILTERS, q: filters.q, sort: filters.sort })}>
            {t("ex_clear_all")}
          </button>
        )}
        <button className="modal-close facet-x" onClick={onClose} aria-label={t("pj_clear")}>✕</button>
      </div>

      <Section title={t("pj_f_status")}>
        {STATUSES.map((s) => {
          const n = facets.status?.[s] || 0;
          const on = (filters.statuses || []).includes(s);
          const label = { open: "pj_status_open", in_progress: "pj_status_progress", completed: "pj_status_done" }[s];
          return (
            <label key={s} className={"facet-row" + (n === 0 ? " dim" : "")}>
              <input type="checkbox" checked={on} disabled={n === 0}
                onChange={() => set({ statuses: toggleIn(filters.statuses, s) })} />
              <span className="facet-label">{t(label)}</span>
              <span className="facet-count">{n}</span>
            </label>
          );
        })}
      </Section>

      <Section title={t("pj_f_category")}>
        {CATEGORIES.map((c) => {
          const n = facets.category?.[c.id] || 0;
          const on = (filters.categories || []).includes(c.id);
          return (
            <label key={c.id} className={"facet-row" + (n === 0 ? " dim" : "")}>
              <input type="checkbox" checked={on} disabled={n === 0}
                onChange={() => set({ categories: toggleIn(filters.categories, c.id) })} />
              <span className="facet-label">{c.emoji} {catName(c)}</span>
              <span className="facet-count">{n}</span>
            </label>
          );
        })}
      </Section>

      <Section title={t("pj_tags")}>
        <input className="facet-search" placeholder={t("pj_tag_filter_ph")}
          value={tagQuery} onChange={(e) => setTagQuery(e.target.value)} />
        <div className="facet-skills">
          {shownTags.length === 0 && <div className="muted" style={{ fontSize: 12.5 }}>{t("pj_no_sug")}</div>}
          {shownTags.map((x) => {
            const on = (filters.tags || []).includes(x.tag);
            return (
              <button key={x.tag} className={"chip" + (on ? " active" : "")}
                onClick={() => set({ tags: toggleIn(filters.tags, x.tag) })}>
                #{x.tag} <span className="muted">{x.hits}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title={t("pj_looking_for")}>
        <div className="facet-skills">
          {roles.map((r) => {
            const on = (filters.lookingFor || []).includes(r.role);
            return (
              <button key={r.role} className={"chip" + (on ? " active" : "")}
                onClick={() => set({ lookingFor: toggleIn(filters.lookingFor, r.role) })}>
                {r.role} <span className="muted">{r.hits}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title={t("pj_connect")}>
        <label className="facet">
          <input type="checkbox" checked={!!filters.openRoles}
            onChange={(e) => set({ openRoles: e.target.checked })} />
          <span className="facet-label">◉ {t("pj_open_roles")}</span>
        </label>
        <label className="facet">
          <input type="checkbox" checked={!!filters.smallTeam}
            onChange={(e) => set({ smallTeam: e.target.checked })} />
          <span className="facet-label">✦ {t("pj_small_team")}</span>
        </label>
        <p className="facet-note">{t("pj_connect_note")}</p>
      </Section>

      <button className="btn btn-primary btn-block facet-apply" onClick={onClose}>
        {t("ex_show_results")}
      </button>
    </>
  );

  return (
    <>
      <aside className="exfilters">{body}</aside>
      {open && (
        <div className="exsheet-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
          <aside className="exsheet">{body}</aside>
        </div>
      )}
    </>
  );
}
