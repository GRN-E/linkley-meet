import { useNavigate } from "react-router-dom";
import { useLang } from "../lib/i18n.js";

export default function About() {
  const { t } = useLang();
  const nav = useNavigate();

  const solutions = ["ab_s1", "ab_s2", "ab_s3", "ab_s4"];
  const promises = ["ab_pr1", "ab_pr2", "ab_pr3", "ab_pr4"];

  return (
    <div className="ab fade-in">
      {/* ── hero ── */}
      <section className="ab-hero">
        <div className="container">
          <span className="pill pill-blue">{t("ab_eyebrow")}</span>
          <h1>{t("ab_title")}</h1>
          <p className="ab-lead">{t("ab_lead")}</p>

          <blockquote className="ab-motto">
            {t("motto_1")}<br />{t("motto_2")}
          </blockquote>
        </div>
      </section>

      <div className="container ab-body">
        {/* ── асуудал ── */}
        <section className="ab-sec">
          <h2>{t("ab_problem_t")}</h2>
          <p className="ab-big">{t("ab_problem_lead")}</p>
          <p>{t("ab_problem_1")}</p>
          <p>{t("ab_problem_2")}</p>
        </section>

        {/* ── шийдэл ── */}
        <section className="ab-sec">
          <h2>{t("ab_solution_t")}</h2>
          <p>{t("ab_solution_lead")}</p>
          <ol className="ab-list">
            {solutions.map((k) => (
              <li key={k}>
                <b>{t(k + "_t")}</b>
                <span>{t(k + "_d")}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* ── оюутнууд ── */}
        <section className="ab-sec ab-highlight">
          <h2>{t("ab_students_t")}</h2>
          <p className="ab-big">{t("ab_students_lead")}</p>
          <p>{t("ab_students_1")}</p>
          <p>{t("ab_students_2")}</p>
        </section>

        {/* ── алсын хараа ── */}
        <section className="ab-sec">
          <h2>{t("ab_vision_t")}</h2>
          <p>{t("ab_vision_1")}</p>
          <p>{t("ab_vision_2")}</p>
          <p className="ab-big">{t("ab_vision_3")}</p>
        </section>

        {/* ── амлалт ── */}
        <section className="ab-sec">
          <h2>{t("ab_trust_t")}</h2>
          <p>{t("ab_trust_lead")}</p>
          <div className="ab-promises">
            {promises.map((k) => (
              <div className="ab-promise" key={k}>
                <b>{t(k + "_t")}</b>
                <span>{t(k + "_d")}</span>
              </div>
            ))}
          </div>
          <p className="ab-close">{t("ab_trust_close")}</p>
        </section>

        {/* ── cta ── */}
        <section className="ab-cta">
          <h3>{t("ab_cta_t")}</h3>
          <div className="ab-cta-btns">
            <button className="btn btn-primary" onClick={() => nav("/auth")}>
              {t("cta_join")}
            </button>
            <button className="btn btn-ghost" onClick={() => nav("/browse")}>
              {t("nav_browse")}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
