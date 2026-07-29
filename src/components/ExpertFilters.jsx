/* ============================================================
   LINKLEY — Expert facet panel
   Sidebar on desktop, slide-over sheet on mobile.
   ============================================================ */
import { useEffect, useState } from "react";
import { useLang } from "../lib/i18n.js";
import { CATEGORIES, fmt } from "../lib/ui.jsx";
import {
  expertFacets, popularSkills, toggleIn, countActive,
  PRICE_STEPS, RATING_STEPS, RESPONSE_STEPS, EMPTY_FILTERS,
} from "../lib/experts.js";

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

export default function ExpertFilters({ filters, onChange, open, onClose }) {
  const { lang, t } = useLang();
  const [facets, setFacets] = useState({ category: {}, skill: {} });
  const [skills, setSkills] = useState([]);
  const [skillQuery, setSkillQuery] = useState("");

  useEffect(() => { expertFacets().then(setFacets); popularSkills(40).then(setSkills); }, []);

  const set = (p) => onChange({ ...filters, ...p });
  const catName = (c) => (lang === "mn" ? c.mn : c.en);
  const nActive = countActive(filters);

  const shownSkills = skills.filter((s) =>
    !skillQuery.trim() || s.skill.toLowerCase().includes(skillQuery.trim().toLowerCase()));

  const body = (
    <>
      <div className="facet-top">
        <h3>{t("ex_filters")}</h3>
        {nActive > 0 && (
          <button className="psearch-mini" onClick={() => onChange({ ...EMPTY_FILTERS, q: filters.q, sort: filters.sort })}>
            {t("ex_clear_all")}
          </button>
        )}
        <button className="modal-close facet-x" onClick={onClose} aria-label={t("pj_clear")}>✕</button>
      </div>

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

      <Section title={t("ex_skills")}>
        <input className="facet-search" placeholder={t("ex_skill_filter_ph")}
          value={skillQuery} onChange={(e) => setSkillQuery(e.target.value)} />
        <div className="facet-skills">
          {shownSkills.length === 0 && <div className="muted" style={{ fontSize: 12.5 }}>{t("pj_no_sug")}</div>}
          {shownSkills.map((s) => {
            const on = (filters.skills || []).includes(s.skill);
            return (
              <button key={s.skill} className={"chip" + (on ? " active" : "")}
                onClick={() => set({ skills: toggleIn(filters.skills, s.skill) })}>
                {s.skill} <span className="muted">{s.hits}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title={t("ex_price")}>
        <div className="facet-opts">
          <button className={"facet-opt" + (!filters.maxFee ? " active" : "")}
            onClick={() => set({ maxFee: null })}>{t("cat_all")}</button>
          {PRICE_STEPS.map((v) => (
            <button key={v} className={"facet-opt" + (filters.maxFee === v ? " active" : "")}
              onClick={() => set({ maxFee: filters.maxFee === v ? null : v })}>
              ≤ ₮{fmt(v)}
            </button>
          ))}
        </div>
      </Section>

      <Section title={t("ex_rating")}>
        <div className="facet-opts">
          <button className={"facet-opt" + (!filters.minRating ? " active" : "")}
            onClick={() => set({ minRating: null })}>{t("cat_all")}</button>
          {RATING_STEPS.map((v) => (
            <button key={v} className={"facet-opt" + (filters.minRating === v ? " active" : "")}
              onClick={() => set({ minRating: filters.minRating === v ? null : v })}>
              ★ {v.toFixed(1)}+
            </button>
          ))}
        </div>
      </Section>

      <Section title={t("ex_response")}>
        <div className="facet-opts">
          <button className={"facet-opt" + (!filters.maxResponse ? " active" : "")}
            onClick={() => set({ maxResponse: null })}>{t("cat_all")}</button>
          {RESPONSE_STEPS.map((v) => (
            <button key={v} className={"facet-opt" + (filters.maxResponse === v ? " active" : "")}
              onClick={() => set({ maxResponse: filters.maxResponse === v ? null : v })}>
              ≤ {v} {t("mins")}
            </button>
          ))}
        </div>
      </Section>

      <Section title={t("ex_session_type")}>
        <label className="facet-row">
          <input type="checkbox" checked={!!filters.studentOnly}
            onChange={(e) => set({ studentOnly: e.target.checked })} />
          <span className="facet-label">🎓 {t("ex_student_only")}</span>
        </label>
        <p className="facet-note">{t("ex_student_note")}</p>
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
