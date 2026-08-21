import { useLang } from "../lib/i18n.js";
import { CATEGORIES, fmt } from "../lib/ui.jsx";
import Avatar from "./Avatar.jsx";

/**
 * Proof first, outcome second, price last.
 *
 * The old card led with ₮45,000, which framed an expert as a thing you compare
 * on cost. This one leads with who they are and what you walk away with; the
 * fee is a quiet line at the bottom.
 */
export default function ExpertCard({ e, onOpen, onMessage }) {
  const { lang, t } = useLang();

  const headline = lang === "mn" ? e.headline_mn : e.headline_en;
  const pitch    = (lang === "mn" ? e.pitch_mn : e.pitch_en) || "";
  const cred     = (lang === "mn" ? e.credentials_mn : e.credentials_en) || "";
  const idealFor = (lang === "mn" ? e.ideal_for_mn : e.ideal_for_en) || [];
  const bio      = lang === "mn" ? e.bio_mn : e.bio_en;
  const cats     = (e.categories || []).map((id) => CATEGORIES.find((c) => c.id === id)).filter(Boolean);

  // Credentials can be a multi-line list on the profile; the card takes one line.
  const credLine = cred.split("\n")[0].replace(/^[·•\s]+/, "").trim();

  const seatsLeft = Math.max(0, (e.session_limit ?? 0) - (e.sessions_count ?? 0));
  const scarce = e.session_limit > 0 && seatsLeft <= 5;

  return (
    <article className="card excard2" onClick={onOpen}>
      <div className="excard2-head">
        <Avatar url={e.avatar_url} initials={e.avatar_initials} color={e.avatar_color} size={56} />
        <div className="excard2-id">
          <h3>
            {e.full_name}
            {credLine && <i className="excard2-check" title={t("ex_verified")} aria-hidden="true">✓</i>}
          </h3>
          {credLine
            ? <p className="excard2-cred">{credLine}</p>
            : <p className="excard2-cred excard2-cred-soft">{headline}</p>}
          <div className="excard2-rating">
            <span className="star">★</span>{Number(e.rating).toFixed(1)}
            <span className="count">({e.reviews_count})</span>
            <span className="excard2-dot">·</span>
            <span className="count">{e.exp_years} {t("yrs")}</span>
          </div>
        </div>
      </div>

      <p className="excard2-pitch">{pitch || bio}</p>

      {idealFor.length > 0 && (
        <div className="excard2-ideal">
          <span className="excard2-ideal-label">{t("ex_ideal_for")}</span>
          <ul>
            {idealFor.slice(0, 2).map((line, i) => <li key={i}>{line}</li>)}
          </ul>
        </div>
      )}

      {e.skills?.length > 0 && (
        <div className="tag-row excard2-skills">
          {e.skills.slice(0, 3).map((s) => <span className="pill pill-blue" key={s}>{s}</span>)}
          {e.skills.length > 3 && <span className="pill pill-gray">+{e.skills.length - 3}</span>}
        </div>
      )}

      <div className="excard2-meta">
        {cats[0] && <span>{cats[0].emoji} {lang === "mn" ? cats[0].mn : cats[0].en}</span>}
        <span>◷ ~{e.response_mins} {t("mins")}</span>
        {e.accepts_student && <span className="excard2-student">✎ {t("ex_student_ok")}</span>}
      </div>

      <footer className="excard2-foot">
        <div className="excard2-price">
          <b>₮{fmt(e.fee_mnt)}</b>
          <span>{t("from").toLowerCase()} · {t("or_pts", { n: e.student_points })}</span>
        </div>
        <div className="excard2-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={(ev) => { ev.stopPropagation(); onMessage ? onMessage(e) : onOpen(); }}
          >
            {t("ex_msg_short")}
          </button>
          <button className="btn btn-primary btn-sm" onClick={(ev) => { ev.stopPropagation(); onOpen(); }}>
            {t("view_profile")}
          </button>
        </div>
      </footer>

      {scarce && (
        <div className="excard2-scarce">
          {seatsLeft === 0 ? t("ex_full") : t("ex_seats_left", { n: seatsLeft })}
        </div>
      )}
    </article>
  );
}
