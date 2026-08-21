import { useNavigate } from "react-router-dom";
import { useLang } from "../lib/i18n.js";

export default function Home() {
  const { t } = useLang();
  const nav = useNavigate();

  const doing = [
    ["◆", "d1"],   // зөвлөгөө
    ["◪", "d2"],   // хамтын ажиллагаа
    ["★", "d3"],   // оюутны дэмжлэг
  ];
  const steps = ["s1", "s2", "s3", "s4"];
  const principles = ["p1", "p2", "p3", "p4"];

  return (
    <div className="fade-in">
      {/* ─────────── HERO ─────────── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container">
          <span className="pill pill-blue">{t("hero_badge")}</span>

          <h1 className="mt-s hm-h1">
            {t("hero_l1")}<br />
            <em>{t("hero_l2")}</em>
          </h1>

          <p className="hm-lead">{t("hero_sub")}</p>

          <div className="hero-cta">
            <button className="btn btn-primary" onClick={() => nav("/browse")}>
              {t("hero_cta1")} →
            </button>
            <button className="btn btn-ghost" onClick={() => nav("/about")}>
              {t("hero_cta2")}
            </button>
          </div>

          <div className="hero-stats">
            <div className="hero-stat"><b>250+</b><span>{t("stat_experts")}</span></div>
            <div className="hero-stat"><b>12,400+</b><span>{t("stat_sessions")}</span></div>
            <div className="hero-stat"><b>₮86 сая</b><span>{t("stat_bonus")}</span></div>
            <div className="hero-stat"><b>4.9★</b><span>{t("stat_rating")}</span></div>
          </div>
        </div>
      </section>

      {/* ─────────── БИД ХЭН БЭ / АСУУДАЛ ─────────── */}
      <section className="section hm-dark">
        <div className="container">
          <div className="hm-who">
            <div className="hm-who-left">
              <span className="eyebrow hm-eyebrow">{t("who_eyebrow")}</span>
              <h2>{t("who_title")}</h2>
            </div>
            <div className="hm-who-right">
              <p>{t("who_p1")}</p>
              <p>{t("who_p2")}</p>
            </div>
          </div>

          <div className="grid grid-2 hm-pain">
            <div className="hm-paincard">
              <div className="hm-paincard-tag">{t("pain_a_tag")}</div>
              <h3>{t("pain_a_title")}</h3>
              <p>{t("pain_a_body")}</p>
            </div>
            <div className="hm-paincard">
              <div className="hm-paincard-tag">{t("pain_b_tag")}</div>
              <h3>{t("pain_b_title")}</h3>
              <p>{t("pain_b_body")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── ЮУ ХИЙЖ БОЛОХ ВЭ ─────────── */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{t("do_eyebrow")}</span>
            <h2>{t("do_title")}</h2>
            <p>{t("do_sub")}</p>
          </div>
          <div className="grid grid-3">
            {doing.map(([ico, k]) => (
              <div className="card hm-do" key={k}>
                <div className="hm-do-ico">{ico}</div>
                <h3>{t(k + "_t")}</h3>
                <p>{t(k + "_d")}</p>
                <span className="hm-do-note">{t(k + "_n")}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── ХЭРХЭН АЖИЛЛАДАГ ─────────── */}
      <section className="section hm-soft">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{t("how_eyebrow")}</span>
            <h2>{t("how_title")}</h2>
          </div>
          <div className="steps">
            {steps.map((s, i) => (
              <div className="card step" key={s}>
                <div className="step-num">{i + 1}</div>
                <h4>{t(s + "_t")}</h4>
                <p>{t(s + "_d")}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── БИДНИЙ ЗАРЧИМ ─────────── */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{t("pr_eyebrow")}</span>
            <h2>{t("pr_title")}</h2>
            <p>{t("pr_sub")}</p>
          </div>
          <div className="hm-prin">
            {principles.map((p) => (
              <div className="hm-prin-row" key={p}>
                <b>{t(p + "_t")}</b>
                <span>{t(p + "_d")}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── ТӨГСГӨЛ ─────────── */}
      <section className="section">
        <div className="container">
          <div className="hm-cta">
            <h2>{t("cta_title")}</h2>
            <p>{t("cta_sub")}</p>
            <div className="hm-cta-btns">
              <button className="btn btn-accent" onClick={() => nav("/auth")}>
                {t("cta_join")} →
              </button>
              <button className="btn hm-cta-ghost" onClick={() => nav("/projects")}>
                {t("cta_projects")}
              </button>
            </div>
            <p className="hm-cta-motto">{t("motto_1")}<br />{t("motto_2")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
