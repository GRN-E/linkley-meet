/* Create a project — experts only (also enforced in the database). */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../lib/i18n.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { useToast, CATEGORIES } from "../lib/ui.jsx";
import { createProject, projectErrorKey } from "../lib/projects.js";

/** Small reusable "type and press Enter" chip input. */
function ChipInput({ value, onChange, placeholder, max = 8 }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim().replace(/^#/, "");
    if (!v || value.includes(v) || value.length >= max) { setDraft(""); return; }
    onChange([...value, v]); setDraft("");
  };
  return (
    <div className="chipinput">
      <div className="chipinput-list">
        {value.map((v) => (
          <span className="pill pill-blue" key={v}>
            {v}<button type="button" className="ptag-x" onClick={() => onChange(value.filter((x) => x !== v))}>✕</button>
          </span>
        ))}
      </div>
      <input
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
          if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={add}
      />
    </div>
  );
}

export default function ProjectNew() {
  const { lang, t } = useLang();
  const { profile } = useAuth();
  const toast = useToast();
  const nav = useNavigate();

  const [form, setForm] = useState({
    title: "", summary: "", description: "", category: "",
    tags: [], lookingFor: [],
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  if (profile && profile.role !== "expert") {
    return (
      <section className="section fade-in"><div className="container" style={{ maxWidth: 640 }}>
        <div className="card pempty">
          <div className="pempty-ico">🔒</div>
          <h3>{t("pj_err_expert_only")}</h3>
          <p className="muted">{t("pj_expert_only_hint")}</p>
          <button className="btn btn-ghost mt-s" onClick={() => nav("/projects")}>← {t("pj_title")}</button>
        </div>
      </div></section>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.title.trim()) { setErr(t("pj_err_title")); return; }
    setBusy(true);
    try {
      const p = await createProject(form);
      toast(t("pj_created_ok"), "good");
      nav("/projects/" + p.id);
    } catch (e2) {
      setErr(t(projectErrorKey(e2)));
    } finally { setBusy(false); }
  };

  return (
    <section className="section fade-in">
      <div className="container" style={{ maxWidth: 820 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => nav("/projects")}>← {t("pj_title")}</button>
        <h2 className="phead-title mt-m">{t("pj_create")}</h2>
        <p className="muted">{t("pj_create_sub")}</p>

        <form className="card mt-m" style={{ padding: 28 }} onSubmit={submit}>
          <div className="field">
            <label>{t("pj_f_title")} *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)}
              placeholder={t("pj_f_title_ph")} maxLength={120} required />
          </div>

          <div className="field">
            <label>{t("pj_f_summary")}</label>
            <input value={form.summary} onChange={(e) => set("summary", e.target.value)}
              placeholder={t("pj_f_summary_ph")} maxLength={200} />
            <div className="pcounter">{form.summary.length}/200</div>
          </div>

          <div className="field">
            <label>{t("pj_f_desc")}</label>
            <textarea style={{ minHeight: 140 }} value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder={t("pj_f_desc_ph")} maxLength={4000} />
          </div>

          <div className="grid grid-2" style={{ gap: 18 }}>
            <div className="field">
              <label>{t("pj_f_category")}</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)}>
                <option value="">{t("pj_pick_category")}</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.emoji} {lang === "mn" ? c.mn : c.en}</option>
                ))}
              </select>
            </div>
            
          </div>

          <div className="field">
            <label>{t("pj_f_tags")}</label>
            <ChipInput value={form.tags} onChange={(v) => set("tags", v)} placeholder={t("pj_f_tags_ph")} />
            <div className="pcounter">{t("pj_f_tags_hint")}</div>
          </div>

          <div className="field">
            <label>{t("pj_f_looking")}</label>
            <ChipInput value={form.lookingFor} onChange={(v) => set("lookingFor", v)}
              placeholder={t("pj_f_looking_ph")} max={6} />
          </div>

          {err && <div className="err-text">{err}</div>}

          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button type="button" className="btn btn-ghost" onClick={() => nav("/projects")}>{t("back")}</button>
            <button className="btn btn-primary" style={{ flex: 1 }} disabled={busy}>
              {busy ? "…" : t("pj_publish")}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
