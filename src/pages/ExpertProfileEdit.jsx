/* ============================================================
   LINKLEY — Expert profile editor
   Live preview + completeness meter + per-field impact copy.
   ============================================================ */
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../lib/i18n.js";
import { useAuth } from "../lib/AuthContext.jsx";
import PhotoUpload from "../components/PhotoUpload.jsx";
import Avatar from "../components/Avatar.jsx";
import { useToast, CATEGORIES, fmt } from "../lib/ui.jsx";
import {
  getMyExpertProfile, saveExpertProfile, profileScore, nextBestAction,
} from "../lib/expertProfile.js";

/* Type-and-enter chip input */
function ChipInput({ value, onChange, placeholder, max = 10 }) {
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
      <input value={draft} placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
          if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={add} />
    </div>
  );
}

function Field({ label, hint, impact, done, children }) {
  return (
    <div className="epfield">
      <div className="epfield-head">
        <label>{label}</label>
        {done !== undefined && (
          <span className={"epcheck " + (done ? "on" : "")}>{done ? "✓" : ""}</span>
        )}
      </div>
      {children}
      {hint && <p className="epfield-hint">{hint}</p>}
      {impact && <p className="epfield-impact">↗ {impact}</p>}
    </div>
  );
}

export default function ExpertProfileEdit() {
  const { lang, t } = useLang();
  const { user, profile, refreshProfile } = useAuth();
  const toast = useToast();
  const nav = useNavigate();

  const [f, setF] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const set = (k, v) => { setF((p) => ({ ...p, [k]: v })); setSaved(false); };

  useEffect(() => {
    if (!user) return;
    getMyExpertProfile(user.id).then((d) => setF(d || null));
  }, [user]);

  const { score, missing } = useMemo(() => profileScore(f), [f]);
  const next = useMemo(() => nextBestAction(f), [f]);

  const save = useCallback(async (e) => {
    e?.preventDefault();
    setErr(""); setBusy(true);
    try {
      await saveExpertProfile(user.id, f);
      await refreshProfile();
      setSaved(true);
      toast(t("ep_saved"), "good");
    } catch (e2) {
      console.error("[LINKLEY saveProfile]", e2);
      setErr(e2.message || t("err_generic"));
    } finally { setBusy(false); }
  }, [user, f, refreshProfile, toast, t]);

  if (profile && profile.role !== "expert") {
    return (
      <section className="section"><div className="container" style={{ maxWidth: 620 }}>
        <div className="card pempty">
          <div className="pempty-ico">🔒</div>
          <h3>{t("ep_experts_only")}</h3>
          <button className="btn btn-ghost mt-s" onClick={() => nav("/")}>← {t("nav_browse")}</button>
        </div>
      </div></section>
    );
  }
  if (!f) return <div className="page-loading"><div className="spinner" /></div>;

  const catName = (c) => (lang === "mn" ? c.mn : c.en);
  const toggleCat = (id) => set("categories",
    f.categories.includes(id) ? f.categories.filter((x) => x !== id) : [...f.categories, id]);

  return (
    <section className="section fade-in">
      <div className="container">
        <div className="phead">
          <div>
            <h2 className="phead-title">{t("ep_title")}</h2>
            <p className="muted">{t("ep_sub")}</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => nav("/dashboard")}>← {t("nav_dashboard")}</button>
        </div>

        {/* completeness */}
        <div className="card epscore">
          <div className="epscore-top">
            <div>
              <div className="epscore-num">{score}<small>%</small></div>
              <div className="epscore-label">{t("ep_completeness")}</div>
            </div>
            <div className="epscore-msg">
              {score === 100
                ? <><b>{t("ep_done_title")}</b><span>{t("ep_done_sub")}</span></>
                : <><b>{t("ep_next_" + next)}</b><span>{t("ep_next_why_" + next)}</span></>}
            </div>
          </div>
          <div className="epscore-bar">
            <div className="epscore-fill" style={{ width: score + "%" }} />
          </div>
        </div>

        <form className="epgrid" onSubmit={save}>
          {/* ---------- left: the form ---------- */}
          <div className="epform">
            <div className="card epsection">
              <h3>{t("ep_s_basic")}</h3>

              <Field label={t("av_label")} hint={t("av_why")} impact={t("ep_i_photo")}>
                <PhotoUpload userId={user.id} url={f.avatar_url}
                  initials={(f.full_name || "?").trim().slice(0, 2).toUpperCase()}
                  color={f.avatar_color}
                  onChange={(url) => { set("avatar_url", url); refreshProfile(); }} />
              </Field>

              <Field label={t("name_label")} done={!missing.includes("full_name")}
                impact={t("ep_i_name")}>
                <input value={f.full_name} onChange={(e) => set("full_name", e.target.value)}
                  placeholder={t("ep_ph_name")} maxLength={60} />
              </Field>

              <Field label={t("ep_headline")} done={!missing.includes("headline")}
                hint={t("ep_h_headline")} impact={t("ep_i_headline")}>
                <input value={f.headline_mn || ""} onChange={(e) => set("headline_mn", e.target.value)}
                  placeholder={t("ep_ph_headline")} maxLength={80} />
                <div className="pcounter">{(f.headline_mn || "").length}/80</div>
              </Field>

              <Field label={t("ep_headline_en")}>
                <input value={f.headline_en || ""} onChange={(e) => set("headline_en", e.target.value)}
                  placeholder="Startup advisor · Ex-Google" maxLength={80} />
              </Field>

              <Field label={t("ep_pitch")} hint={t("ep_h_pitch")} impact={t("ep_i_pitch")}>
                <input value={f.pitch_mn || ""} onChange={(e) => set("pitch_mn", e.target.value)}
                  placeholder={t("ep_ph_pitch")} maxLength={120} />
                <div className="pcounter">{(f.pitch_mn || "").length}/120</div>
              </Field>

              <Field label={t("ep_ideal")} hint={t("ep_h_ideal")} impact={t("ep_i_ideal")}>
                {[0, 1, 2].map((i) => (
                  <input key={i} className="epideal-input"
                    value={(f.ideal_for_mn || [])[i] || ""}
                    onChange={(e) => {
                      const next = [...(f.ideal_for_mn || [])];
                      next[i] = e.target.value;
                      set("ideal_for_mn", next.filter((x, j) => x.trim() !== "" || j < next.length - 1));
                    }}
                    placeholder={t("ep_ph_ideal" + (i + 1))} maxLength={90} />
                ))}
              </Field>

              <Field label={t("ep_bio")} done={!missing.includes("bio")}
                hint={t("ep_h_bio")} impact={t("ep_i_bio")}>
                <textarea style={{ minHeight: 130 }} value={f.bio_mn || ""}
                  onChange={(e) => set("bio_mn", e.target.value)}
                  placeholder={t("ep_ph_bio")} maxLength={800} />
                <div className="pcounter">
                  <span className={(f.bio_mn || "").length < 80 ? "epwarn" : ""}>
                    {(f.bio_mn || "").length}
                  </span>/800 · {t("ep_bio_min")}
                </div>
              </Field>

              <Field label={t("ep_bio_en")}>
                <textarea value={f.bio_en || ""} onChange={(e) => set("bio_en", e.target.value)}
                  placeholder="English version (optional)" maxLength={800} />
              </Field>

              <Field label={t("ep_credentials")} done={!missing.includes("credentials")}
                hint={t("ep_h_cred")} impact={t("ep_i_cred")}>
                <textarea value={f.credentials_mn || ""} onChange={(e) => set("credentials_mn", e.target.value)}
                  placeholder={t("ep_ph_cred")} maxLength={400} />
              </Field>

              <Field label="LinkedIn">
                <input value={f.linkedin_url || ""} onChange={(e) => set("linkedin_url", e.target.value)}
                  placeholder="https://linkedin.com/in/..." />
              </Field>
            </div>

            <div className="card epsection">
              <h3>{t("ep_s_expertise")}</h3>

              <Field label={t("ex_skills")} done={!missing.includes("skills")}
                hint={t("ep_h_skills")} impact={t("ep_i_skills")}>
                <ChipInput value={f.skills || []} onChange={(v) => set("skills", v)}
                  placeholder={t("ep_ph_skills")} max={12} />
              </Field>

              <Field label={t("pj_f_category")} done={!missing.includes("categories")}
                impact={t("ep_i_cats")}>
                <div className="chips">
                  {CATEGORIES.map((c) => (
                    <button type="button" key={c.id}
                      className={"chip" + (f.categories.includes(c.id) ? " active" : "")}
                      onClick={() => toggleCat(c.id)}>
                      {c.emoji} {catName(c)}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label={t("ep_languages")}>
                <ChipInput value={f.languages || []} onChange={(v) => set("languages", v)}
                  placeholder={t("ep_ph_lang")} max={6} />
              </Field>

              <Field label={t("exp_years")}>
                <input type="number" min={0} max={60} value={f.exp_years}
                  onChange={(e) => set("exp_years", e.target.value)} style={{ maxWidth: 140 }} />
              </Field>
            </div>

            <div className="card epsection">
              <h3>{t("ep_s_pricing")}</h3>

              <Field label={t("ep_fee")} done={!missing.includes("fee")}
                hint={t("ep_h_fee")} impact={t("ep_i_fee")}>
                <input type="number" min={0} step={5000} value={f.fee_mnt}
                  onChange={(e) => set("fee_mnt", e.target.value)} style={{ maxWidth: 200 }} />
                <div className="epearn">
                  {t("ep_earn_hint", { n: fmt(Math.round((Number(f.fee_mnt) || 0) * 4)) })}
                </div>
              </Field>

              <Field label={t("ep_student")} hint={t("ep_h_student")}>
                <label className="pcheck">
                  <input type="checkbox" checked={!!f.accepts_student}
                    onChange={(e) => set("accepts_student", e.target.checked)} />
                  🎓 {t("ex_student_only")}
                </label>
              </Field>

              <Field label={t("response")} hint={t("ep_h_response")} impact={t("ep_i_response")}>
                <select value={f.response_mins} onChange={(e) => set("response_mins", e.target.value)}
                  className="pselect" style={{ maxWidth: 200 }}>
                  <option value={15}>≤ 15 {t("mins")}</option>
                  <option value={30}>≤ 30 {t("mins")}</option>
                  <option value={60}>≤ 60 {t("mins")}</option>
                  <option value={180}>≤ 3 {lang === "mn" ? "цаг" : "hours"}</option>
                </select>
              </Field>

              <Field label={t("limit_title")} hint={t("limit_note")}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <input className="bid-slider" type="range" min={1} max={20} value={f.session_limit}
                    style={{ flex: 1 }} onChange={(e) => set("session_limit", e.target.value)} />
                  <b style={{ minWidth: 90, textAlign: "right" }}>{f.session_limit} {t("people")}</b>
                </div>
              </Field>

              <Field label={t("ep_availability")} hint={t("ep_h_active")}>
                <label className="pcheck">
                  <input type="checkbox" checked={!!f.is_active}
                    onChange={(e) => set("is_active", e.target.checked)} />
                  {f.is_active ? t("ep_active_on") : t("ep_active_off")}
                </label>
              </Field>
            </div>

            {err && <div className="err-text">{err}</div>}
          </div>

          {/* ---------- right: live preview + save ---------- */}
          <aside className="eppreview">
            <div className="eppreview-inner">
              <div className="eppreview-label">{t("ep_preview")}</div>

              <article className="card expert-card excard eppreview-card">
                <div className="expert-top">
                  <Avatar url={f.avatar_url} color={f.avatar_color} size={52}
                    initials={(f.full_name || "?").trim().slice(0, 2).toUpperCase()} />
                  <div style={{ minWidth: 0 }}>
                    <h3>{f.full_name || t("ep_ph_name")}</h3>
                    <div className="expert-role">{f.headline_mn || t("ep_ph_headline")}</div>
                    <div className="rating">
                      <span className="star">★</span>{Number(f.rating).toFixed(1)}
                      <span className="count">({f.reviews_count})</span>
                    </div>
                  </div>
                </div>
                <p className="expert-bio">{f.pitch_mn || f.bio_mn || t("ep_ph_bio")}</p>
                {(f.ideal_for_mn || []).filter((x) => x && x.trim()).length > 0 && (
                  <div className="excard2-ideal">
                    <span className="excard2-ideal-label">{t("ex_ideal_for")}</span>
                    <ul>
                      {(f.ideal_for_mn || []).filter((x) => x && x.trim()).slice(0, 2)
                        .map((line, i) => <li key={i}>{line}</li>)}
                    </ul>
                  </div>
                )}
                {f.skills?.length > 0 && (
                  <div className="tag-row">
                    {f.skills.slice(0, 4).map((s) => <span className="pill pill-gray" key={s}>{s}</span>)}
                    {f.skills.length > 4 && <span className="pill pill-gray">+{f.skills.length - 4}</span>}
                  </div>
                )}
                <div className="excard-meta">
                  {f.categories.slice(0, 2).map((id) => {
                    const c = CATEGORIES.find((x) => x.id === id);
                    return c ? <span key={id}>{c.emoji} {catName(c)}</span> : null;
                  })}
                  <span>⏱ ~{f.response_mins} {t("mins")}</span>
                </div>
                <div className="expert-foot">
                  <div className="expert-price">
                    <b>₮{fmt(f.fee_mnt)}</b>
                    <span>{t("per_session")}{f.accepts_student ? ` · ${f.student_points} ${t("points")}` : ""}</span>
                  </div>
                  <span className="btn btn-primary btn-sm">{t("view_profile")}</span>
                </div>
              </article>

              <div className="epsave">
                <button className="btn btn-primary btn-block" disabled={busy}>
                  {busy ? "…" : saved ? "✓ " + t("ep_saved") : t("save")}
                </button>
                {score < 60 && <p className="epsave-note">{t("ep_publish_warn")}</p>}
              </div>
            </div>
          </aside>
        </form>
      </div>
    </section>
  );
}
