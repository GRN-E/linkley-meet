/* ============================================================
   LINKLEY — Expert first-run guide
   Shown once, right after an expert signs up.
   Motion: enters ease-out under 250ms, never scales from 0,
   collapses to a fade under prefers-reduced-motion.
   ============================================================ */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../lib/i18n.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { markOnboarded } from "../lib/expertProfile.js";
import { supabase } from "../lib/supabase.js";

const SKIP_KEY = "linkley_expert_guide_skipped";

export default function ExpertOnboarding() {
  const { t } = useLang();
  const { user, profile } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  // Decide whether to show it: experts who have never been onboarded.
  useEffect(() => {
    let alive = true;
    if (!user || profile?.role !== "expert") return;
    if (localStorage.getItem(SKIP_KEY) === "1") return;
    supabase.from("experts").select("onboarded_at").eq("id", user.id).maybeSingle()
      .then(({ data }) => {
        if (alive && data && !data.onboarded_at) setOpen(true);
      });
    return () => { alive = false; };
  }, [user, profile]);

  const finish = useCallback(async (goToProfile) => {
    setOpen(false);
    localStorage.setItem(SKIP_KEY, "1");
    if (user) markOnboarded(user.id).catch(() => {});
    if (goToProfile) nav("/expert/profile");
  }, [user, nav]);

  // Esc closes, arrows navigate
  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (e.key === "Escape") finish(false);
      if (e.key === "ArrowRight") setStep((s) => Math.min(3, s + 1));
      if (e.key === "ArrowLeft") setStep((s) => Math.max(0, s - 1));
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, finish]);

  if (!open) return null;

  const steps = [
    { icon: "◆", key: "w",  accent: "var(--primary)" },
    { icon: "★", key: "p",  accent: "var(--accent-dark)" },
    { icon: "⚡", key: "r", accent: "var(--primary)" },
    { icon: "🎓", key: "s", accent: "var(--success)" },
  ];
  const last = step === steps.length - 1;
  const cur = steps[step];

  return (
    <div className="ob-overlay" role="dialog" aria-modal="true" aria-label={t("ob_title_w")}>
      <div className="ob-modal">
        <button className="ob-skip" onClick={() => finish(false)}>{t("ob_skip")}</button>

        <div className="ob-body" key={step}>
          <div className="ob-icon" style={{ background: cur.accent }}>{cur.icon}</div>
          <h2>{t("ob_title_" + cur.key)}</h2>
          <p>{t("ob_text_" + cur.key)}</p>

          {step === 0 && (
            <div className="ob-stat">
              <b>70%</b><span>{t("ob_stat_bonus")}</span>
            </div>
          )}
          {step === 1 && (
            <ul className="ob-list">
              <li>{t("ob_p_1")}</li>
              <li>{t("ob_p_2")}</li>
              <li>{t("ob_p_3")}</li>
            </ul>
          )}
          {step === 2 && (
            <div className="ob-queue">
              <div className="ob-queue-row top"><span>1</span>Б. Тэмүүжин<b>◆ 45</b></div>
              <div className="ob-queue-row"><span>2</span>Г. Номин<b>◆ 20</b></div>
              <div className="ob-queue-row"><span>3</span>Д. Анар<b>◆ 10</b></div>
            </div>
          )}
          {step === 3 && (
            <ul className="ob-list">
              <li>{t("ob_s_1")}</li>
              <li>{t("ob_s_2")}</li>
            </ul>
          )}
        </div>

        <div className="ob-foot">
          <div className="ob-dots">
            {steps.map((_, i) => (
              <button key={i} className={"ob-dot" + (i === step ? " on" : "")}
                onClick={() => setStep(i)} aria-label={`${i + 1}`} />
            ))}
          </div>
          <div className="ob-actions">
            {step > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(step - 1)}>{t("back")}</button>
            )}
            {last ? (
              <button className="btn btn-primary" onClick={() => finish(true)}>{t("ob_cta")}</button>
            ) : (
              <button className="btn btn-primary" onClick={() => setStep(step + 1)}>{t("next")}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
