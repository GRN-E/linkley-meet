import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { useLang } from "../lib/i18n.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { AVATAR_COLORS, CATEGORIES, fmt } from "../lib/ui.jsx";
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
    supabase.from("reviews").select("stars,body,created_at").eq("expert_id", id).order("created_at", { ascending: false }).limit(8)
      .then(({ data }) => { if (alive) setReviews(data || []); });
    return () => { alive = false; };
  }, [id]);

  if (expert === null) return <div className="page-loading"><div className="spinner" /></div>;
  if (!expert) return <section className="section"><div className="container"><p className="muted">{t("no_results")}</p></div></section>;

  const catName = (c) => (lang === "mn" ? c.mn : c.en);
  const cats = (expert.categories || []).map((cid) => CATEGORIES.find((c) => c.id === cid)).filter(Boolean);
  const role = lang === "mn" ? expert.headline_mn : expert.headline_en;
  const bio = lang === "mn" ? expert.bio_mn : expert.bio_en;

  const startBooking = () => { if (!user) { nav("/auth"); return; } setBooking(true); };

  return (
    <section className="section fade-in">
      <div className="container">
        <button className="btn btn-ghost btn-sm" onClick={() => nav("/browse")}>← {t("nav_browse")}</button>
        <div className="card profile-head mt-m">
          <div className="avatar" style={{ background: AVATAR_COLORS[expert.avatar_color % 8] }}>{expert.avatar_initials}</div>
          <div>
            <h1>{expert.full_name}</h1>
            <div className="expert-role">{role}</div>
            <div className="rating mt-s"><span className="star">★</span>{Number(expert.rating).toFixed(1)} <span className="count">({expert.reviews_count} {t("reviews").toLowerCase()})</span></div>
            <div className="tag-row mt-s">{cats.map((c) => <span className="pill pill-gray" key={c.id}>{c.emoji} {catName(c)}</span>)}</div>
            <div className="stat-row">
              <div><b>{expert.sessions_count}</b><span>{t("completed")}</span></div>
              <div><b>{expert.exp_years} {t("yrs")}</b><span>{t("exp_years")}</span></div>
              <div><b>~{expert.response_mins} {t("mins")}</b><span>{t("response")}</span></div>
            </div>
          </div>
          <div className="profile-actions">
            <div className="card" style={{ padding: 14, textAlign: "center" }}>
              <div className="muted" style={{ fontSize: 12 }}>{t("from")}</div>
              <div style={{ fontSize: 22, fontWeight: 850 }}>₮{fmt(expert.fee_mnt)}</div>
              <div className="muted" style={{ fontSize: 12 }}>{lang === "mn" ? "эсвэл" : "or"} {expert.student_points} {t("points")} · {t("type_student")}</div>
            </div>
            <button className="btn btn-primary btn-block" onClick={startBooking}>{t("book_now")}</button>
            <button className="btn btn-ghost btn-block" onClick={() => { if (!user) { nav("/auth"); return; } setChatOpen(true); }}>{t("ch_msg_expert")} · ◆ 5</button>
            <button className="btn btn-ghost btn-block" onClick={startBooking}>{t("propose_collab")}</button>
          </div>
        </div>

        <div className="grid grid-2 mt-m" style={{ alignItems: "start" }}>
          <div className="card" style={{ padding: 26 }}>
            <h3 style={{ fontSize: 18, marginBottom: 10 }}>{t("about")}</h3>
            <p className="muted">{bio}</p>
            <h3 style={{ fontSize: 18, margin: "22px 0 10px" }}>{t("reviews")}</h3>
            {reviews.length === 0 ? (
              <p className="muted" style={{ fontSize: 14 }}>{t("no_reviews")}</p>
            ) : reviews.map((r, i) => (
              <div key={i} style={{ padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
                <div style={{ color: "var(--accent)", fontSize: 14 }}>{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</div>
                {r.body && <p style={{ fontSize: 14.5, margin: "6px 0 0" }}>{r.body}</p>}
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 26 }}>
            <h3 style={{ fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}>⚡ {lang === "mn" ? "Хурдан уулзалт" : "Faster session"}</h3>
            <p className="muted" style={{ fontSize: 14, marginTop: 8 }}>
              {lang === "mn"
                ? "Илүү олон point тавьж bid хийвэл энэ мэргэжилтний дараалалд түрүүлнэ. Мэргэжилтэн эхний хэдэн хүнтэй уулзаад зогсдог."
                : "Bid more points to move up this expert's queue. Experts stop after meeting the first few people."}
            </p>
            <div className="summary" style={{ marginTop: 16 }}>
              <div className="summary-row"><span>{t("limit_current")}</span><b>{expert.session_limit} {t("people")}</b></div>
              <div className="summary-row"><span>{t("response")}</span><span>~{expert.response_mins} {t("mins")}</span></div>
            </div>
            <button className="btn btn-accent btn-block" style={{ marginTop: 16 }} onClick={startBooking}>⚡ {t("book_now")}</button>
          </div>
        </div>
      </div>

      {booking && <BookingModal expert={expert} onClose={() => setBooking(false)} />}
      {chatOpen && <StartChatModal expert={expert} onClose={() => setChatOpen(false)} />}
    </section>
  );
}
