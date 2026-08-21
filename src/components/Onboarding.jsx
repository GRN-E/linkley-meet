/* ============================================================
   LINKLEY — first-run guide, one component for every role.

   Three steps, never four: the fourth is where people quit.
   Motion stays under 240ms and collapses to a plain fade under
   prefers-reduced-motion. Focus is trapped while it is open and
   returned to whatever opened it on close.
   ============================================================ */
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../lib/i18n.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { markOnboarded } from "../lib/expertProfile.js";
import { supabase } from "../lib/supabase.js";
import { POINT_COSTS } from "../lib/ui.jsx";

const SEEN_KEY = "linkley_guide_seen_v3";

/* Which three steps each role gets. Keys resolve to i18n strings
   as g_<role>_<step>_t / _d, so copy lives entirely in i18n. */
const FLOWS = {
  client:  { steps: ["welcome", "how", "points"], cta: "g_cta_browse",  to: "/browse" },
  expert:  { steps: ["welcome", "profile", "queue"], cta: "g_cta_profile", to: "/expert/profile" },
  company: { steps: ["welcome", "what", "start"],  cta: "g_cta_projects", to: "/projects" },
};

export default function Onboarding({ force = false, onClose }) {
  const { t } = useLang();
  const { user, profile } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(force);
  const [step, setStep] = useState(0);
  const modal = useRef(null);
  const opener = useRef(null);

  const role = profile?.role === "expert" ? "expert"
             : profile?.role === "company" ? "company"
             : "client";
  const flow = FLOWS[role];

  /* --- when to show it ------------------------------------ */
  useEffect(() => {
    if (force) return;
    if (!user || !profile) return;
    if (localStorage.getItem(SEEN_KEY) === "1") return;

    // Experts have a server-side flag so the guide follows them across devices.
    if (profile.role === "expert") {
      let alive = true;
      supabase.from("experts").select("onboarded_at").eq("id", user.id).maybeSingle()
        .then(({ data }) => { if (alive && data && !data.onboarded_at) setOpen(true); });
      return () => { alive = false; };
    }
    setOpen(true);
  }, [force, user, profile]);

  const close = useCallback((goNext) => {
    setOpen(false);
    localStorage.setItem(SEEN_KEY, "1");
    if (user && profile?.role === "expert") markOnboarded(user.id).catch(() => {});
    opener.current?.focus?.();
    onClose?.();
    if (goNext) nav(flow.to);
  }, [user, profile, nav, flow, onClose]);

  /* --- keyboard: Esc closes, arrows move, Tab stays inside -- */
  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    const focusables = () =>
      modal.current?.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])') || [];
    focusables()[0]?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") { close(false); return; }
      if (e.key === "ArrowRight") setStep((s) => Math.min(2, s + 1));
      if (e.key === "ArrowLeft")  setStep((s) => Math.max(0, s - 1));
      if (e.key === "Tab") {
        const list = [...focusables()];
        if (!list.length) return;
        const first = list[0], last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  if (!open) return null;

  const key   = flow.steps[step];
  const last  = step === 2;
  const base  = `g_${role}_${key}`;

  return (
    <div className="gd-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) close(false); }}>
      <div className="gd-modal" ref={modal} role="dialog" aria-modal="true"
           aria-labelledby="gd-title">
        <button className="gd-skip" onClick={() => close(false)}>{t("g_skip")}</button>

        <div className="gd-body" key={key}>
          <span className="gd-step-of">{step + 1} / 3</span>
          <h2 id="gd-title">{t(base + "_t")}</h2>
          <p className="gd-lead">{t(base + "_d")}</p>

          {/* step-specific visual, one per step, never decorative */}
          {key === "welcome" && role === "client" && (
            <div className="gd-gift">
              <span className="gd-gift-num">◆ 50</span>
              <span className="gd-gift-lbl">{t("g_gift")}</span>
            </div>
          )}

          {key === "welcome" && role === "expert" && (
            <div className="gd-gift gd-gift-accent">
              <span className="gd-gift-num">70%</span>
              <span className="gd-gift-lbl">{t("g_bonus")}</span>
            </div>
          )}

          {(key === "how" || key === "profile" || key === "what" || key === "start") && (
            <ol className="gd-steps">
              {[1, 2, 3].map((n) => (
                <li key={n}><b>{n}</b><span>{t(`${base}_${n}`)}</span></li>
              ))}
            </ol>
          )}

          {key === "points" && (
            <ul className="gd-costs">
              {POINT_COSTS.map((c) => (
                <li key={c.key}>
                  <span>{t(c.key)}</span>
                  <b>◆ {c.cost}</b>
                </li>
              ))}
              <li className="gd-costs-rate">
                <span>{t("g_rate_label")}</span><b>{t("g_rate")}</b>
              </li>
            </ul>
          )}

          {key === "queue" && (
            <div className="gd-queue" aria-hidden="true">
              <div className="gd-queue-row is-top"><span>1</span>Б. Тэмүүжин<b>◆ 45</b></div>
              <div className="gd-queue-row"><span>2</span>Г. Номин<b>◆ 20</b></div>
              <div className="gd-queue-row"><span>3</span>Д. Анар<b>◆ 10</b></div>
            </div>
          )}
        </div>

        <div className="gd-foot">
          <div className="gd-dots">
            {[0, 1, 2].map((i) => (
              <button key={i} className={"gd-dot" + (i === step ? " on" : "")}
                      onClick={() => setStep(i)} aria-label={t("g_step_n", { n: i + 1 })}
                      aria-current={i === step ? "step" : undefined} />
            ))}
          </div>
          <div className="gd-actions">
            {step > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(step - 1)}>{t("back")}</button>
            )}
            <button className="btn btn-primary" onClick={() => (last ? close(true) : setStep(step + 1))}>
              {last ? t(flow.cta) : t("next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
