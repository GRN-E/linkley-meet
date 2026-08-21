import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { useLang } from "../lib/i18n.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { CATEGORIES, fmt } from "../lib/ui.jsx";
import Avatar from "../components/Avatar.jsx";
import BookingModal from "../components/BookingModal.jsx";
import StartChatModal from "../components/StartChatModal.jsx";

export default function Profile() {
  const { id } = useParams();
  const { lang, t } = useLang();
  const { user } = useAuth();
  const nav = useNavigate();
  const [expert, setExpert] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [booking, setBooking] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase.from("expert_directory").select("*").eq("id", id).maybeSingle()
      .then(({ data }) => { if (alive) setExpert(data); });
    supabase.from("reviews").select("stars,body,created_at").eq("expert_id", id)
      .order("created_at", { ascending: false }).limit(8)
      .then(({ data }) => { if (alive) setReviews(data || []); });
    return () => { alive = false; };
  }, [id]);

  if (expert === null) return <div className="page-loading"><div className="spinner" /></div>;
  if (!expert) {
    return <section className="section"><div className="container"><p className="muted">{t("no_results")}</p></div></section>;
  }

  const need = (fn) => () => { if (!user) { nav("/auth"); return; } fn(); };
  const startBooking = need(() => setBooking(true));
  const startChat    = need(() => setChatOpen(true));

  const headline = lang === "mn" ? expert.headline_mn : expert.headline_en;
  const pitch    = (lang === "mn" ? expert.pitch_mn : expert.pitch_en) || "";
  const cred     = (lang === "mn" ? expert.credentials_mn : expert.credentials_en) || "";
  const idealFor = (lang === "mn" ? expert.ideal_for_mn : expert.ideal_for_en) || [];
  const bio      = lang === "mn" ? expert.bio_mn : expert.bio_en;
  const cats     = (expert.categories || []).map((cid) => CATEGORIES.find((c) => c.id === cid)).filter(Boolean);
  const credLines = cred.split("\n").map((s) => s.replace(/^[·•\s]+/, "").trim()).filter(Boolean);

  const seatsLeft = Math.max(0, (expert.session_limit ?? 0) - (expert.sessions_count ?? 0));
  const scarce = expert.session_limit > 0 && seatsLeft <= 5;

  return (
    <section className="section fade-in">
      <div className="container">
        <button className="btn btn-ghost btn-sm" onClick={() => nav("/browse")}>← {t("nav_browse")}</button>

        {/* ── hero: who they are, then what you get ── */}
        <div className="card exp-hero mt-m">
          <div className="exp-hero-main">
            <Avatar url={expert.avatar_url} initials={expert.avatar_initials}
                    color={expert.avatar_color} size={104} />
            <div className="exp-hero-id">
              <h1>
                {expert.full_name}
                {credLines.length > 0 && <i className="exp-check" title={t("ex_verified")} aria-hidden="true">✓</i>}
              </h1>
              <p className="exp-headline">{headline}</p>
              {pitch && <p className="exp-pitch">{pitch}</p>}

              <div className="exp-facts">
                <div><b>{Number(expert.rating).toFixed(1)}★</b><span>{expert.reviews_count} {t("reviews").toLowerCase()}</span></div>
                <div><b>{expert.exp_years} {t("yrs")}</b><span>{t("exp_years")}</span></div>
                <div><b>~{expert.response_mins} {t("mins")}</b><span>{t("response")}</span></div>
                <div><b>{expert.sessions_count}</b><span>{t("completed")}</span></div>
              </div>

              <div className="tag-row mt-s">
                {cats.map((c) => (
                  <span className="pill pill-gray" key={c.id}>{c.emoji} {lang === "mn" ? c.mn : c.en}</span>
                ))}
                {expert.accepts_student && <span className="pill pill-green">✎ {t("ex_student_ok")}</span>}
              </div>
            </div>
          </div>

          {/* ── booking rail ── */}
          <aside className="exp-rail">
            {scarce && (
              <div className="exp-seats">
                {seatsLeft === 0 ? t("ex_full") : t("ex_seats_left", { n: seatsLeft })}
              </div>
            )}
            <div className="exp-price">
              <span className="exp-price-lbl">{t("from")}</span>
              <b>₮{fmt(expert.fee_mnt)}</b>
              <span className="exp-price-sub">{t("or_pts", { n: expert.student_points })}</span>
            </div>
            <button className="btn btn-primary btn-block" onClick={startBooking}>{t("book_now")}</button>
            <button className="btn btn-ghost btn-block" onClick={startChat}>{t("ch_msg_expert")} · ◆ 5</button>
            <p className="exp-rail-note">{t("ex_rail_note")}</p>
            {expert.linkedin_url && (
              <a className="exp-linkedin" href={expert.linkedin_url} target="_blank" rel="noopener noreferrer">
                {t("ep_linkedin")} ↗
              </a>
            )}
          </aside>
        </div>

        {/* ── who this is for ── */}
        {idealFor.length > 0 && (
          <div className="card exp-ideal mt-m">
            <h3>{t("ex_ideal_title")}</h3>
            <ul>
              {idealFor.map((line, i) => <li key={i}>{line}</li>)}
            </ul>
          </div>
        )}

        <div className="grid grid-2 mt-m" style={{ alignItems: "start" }}>
          <div className="card exp-block">
            <h3>{t("about")}</h3>
            <p className="muted exp-bio">{bio}</p>

            {expert.skills?.length > 0 && (
              <>
                <h3 className="mt-l">{t("ep_skills")}</h3>
                <div className="tag-row">
                  {expert.skills.map((s) => <span className="pill pill-blue" key={s}>{s}</span>)}
                </div>
              </>
            )}

            <h3 className="mt-l">{t("reviews")}</h3>
            {reviews.length === 0 ? (
              <p className="muted exp-noreviews">{t("no_reviews")}</p>
            ) : reviews.map((r, i) => (
              <div className="exp-review" key={i}>
                <div className="exp-review-stars">{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</div>
                {r.body && <p>{r.body}</p>}
              </div>
            ))}
          </div>

          <div className="exp-side">
            {credLines.length > 0 && (
              <div className="card exp-block exp-cred">
                <h3>{t("ex_credentials")}</h3>
                <ul>
                  {credLines.map((line, i) => <li key={i}>{line}</li>)}
                </ul>
              </div>
            )}

            <div className="card exp-block mt-m">
              <h3>{t("ex_queue_title")}</h3>
              <p className="muted exp-queue-note">{t("ex_queue_note")}</p>
              <div className="summary mt-s">
                <div className="summary-row"><span>{t("limit_current")}</span><b>{expert.session_limit} {t("people")}</b></div>
                <div className="summary-row"><span>{t("response")}</span><span>~{expert.response_mins} {t("mins")}</span></div>
              </div>
              <button className="btn btn-accent btn-block mt-m" onClick={startBooking}>⚡ {t("book_now")}</button>
            </div>
          </div>
        </div>
      </div>

      {booking && <BookingModal expert={expert} onClose={() => setBooking(false)} />}
      {chatOpen && <StartChatModal expert={expert} onClose={() => setChatOpen(false)} />}
    </section>
  );
}
