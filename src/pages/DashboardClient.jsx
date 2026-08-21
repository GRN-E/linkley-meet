import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { useLang } from "../lib/i18n.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { AVATAR_COLORS, fmt } from "../lib/ui.jsx";
import ReviewModal from "../components/ReviewModal.jsx";

function Metric({ label, value }) {
  return <div className="card metric"><div className="label">{label}</div><div className="value">{value}</div></div>;
}

export default function DashboardClient() {
  const { lang, t } = useLang();
  const { user, profile } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState("tab_upcoming");
  const [bookings, setBookings] = useState([]);
  const [expertMap, setExpertMap] = useState({});
  const [certs, setCerts] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [review, setReview] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data: bk } = await supabase.from("bookings").select("*").eq("client_id", user.id).order("created_at", { ascending: false });
    setBookings(bk || []);
    const ids = [...new Set((bk || []).map((b) => b.expert_id))];
    if (ids.length) {
      const { data: ex } = await supabase.from("expert_directory").select("id,full_name,avatar_initials,avatar_color").in("id", ids);
      const map = {}; (ex || []).forEach((e) => (map[e.id] = e)); setExpertMap(map);
    }
    const { data: c } = await supabase.from("certificates").select("*").eq("user_id", user.id).order("issued_at", { ascending: false });
    setCerts(c || []);
    const { data: l } = await supabase.from("points_ledger").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
    setLedger(l || []);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const tabs = ["tab_upcoming", "tab_history", "tab_certs", "tab_wallet"];
  const upcoming = bookings.filter((b) => b.status === "pending" || b.status === "accepted");
  const history = bookings.filter((b) => b.status === "completed" || b.status === "declined");
  const ex = (id) => expertMap[id] || { full_name: "…", avatar_initials: "?", avatar_color: 0 };

  return (
    <section className="section fade-in">
      <div className="container">
        <h2 style={{ fontSize: 28, letterSpacing: "-.6px" }}>{t("dash_client")}</h2>
        <div className="grid grid-4 mt-m">
          <Metric label={t("m_balance")} value={"◆ " + fmt(profile?.points ?? 0)} />
          <Metric label={t("m_sessions")} value={history.length} />
          <Metric label={t("m_certs")} value={certs.length} />
          <Metric label={t("m_spent")} value={"◆ " + fmt(ledger.filter((l) => l.delta < 0).reduce((a, b) => a - b.delta, 0))} />
        </div>

        <div className="dash-tabs mt-l">
          {tabs.map((x) => <button key={x} className={"dash-tab " + (tab === x ? "active" : "")} onClick={() => setTab(x)}>{t(x)}</button>)}
        </div>

        <div className="card fade-in" style={{ padding: "6px 0" }}>
          {tab === "tab_upcoming" && (upcoming.length === 0
            ? <div style={{ padding: 30, textAlign: "center" }} className="muted">{t("no_upcoming")}</div>
            : upcoming.map((b) => {
                const e = ex(b.expert_id);
                return (
                  <div className="list-row" key={b.id}>
                    <div className="avatar" style={{ width: 44, height: 44, fontSize: 16, background: AVATAR_COLORS[e.avatar_color % 8] }}>{e.avatar_initials}</div>
                    <div className="grow"><h4>{e.full_name}</h4><p>{b.message || (b.type === "student" ? t("type_student") : t("type_pro"))} · {b.slot_time || ""} · <span className={"pill " + (b.status === "accepted" ? "pill-green" : "pill-amber")} style={{ fontSize: 10 }}>{b.status}</span></p></div>
                    <button className="btn btn-primary btn-sm" onClick={() => nav("/call/" + b.id)}>{t("join_call")}</button>
                  </div>
                );
              }))}

          {tab === "tab_history" && (history.length === 0
            ? <div style={{ padding: 30, textAlign: "center" }} className="muted">{t("no_history")}</div>
            : history.map((b) => {
                const e = ex(b.expert_id);
                return (
                  <div className="list-row" key={b.id}>
                    <div className="avatar" style={{ width: 44, height: 44, fontSize: 16, background: AVATAR_COLORS[e.avatar_color % 8] }}>{e.avatar_initials}</div>
                    <div className="grow"><h4>{e.full_name}</h4><p>{b.message || ""} · {b.status}</p></div>
                    {b.status === "completed"
                      ? <span className="pill pill-green">★ {t("rated")}</span>
                      : <button className="btn btn-ghost btn-sm" onClick={() => setReview({ booking: b, name: e.full_name })}>{t("leave_review")}</button>}
                  </div>
                );
              }))}

          {tab === "tab_certs" && (certs.length === 0
            ? <div style={{ padding: 30, textAlign: "center" }} className="muted">{t("no_history")}</div>
            : <div style={{ padding: 22 }}>{certs.map((c) => (
                <div className="list-row" key={c.id} style={{ border: "1px solid var(--line)", borderRadius: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 24 }}>🎓</div>
                  <div className="grow"><h4>{t("cert_head")}</h4><p>{c.cert_code} · {new Date(c.issued_at).toLocaleDateString()}</p></div>
                  <button className="btn btn-primary btn-sm" onClick={() => nav("/certificate/" + c.id)}>{t("download_cert")}</button>
                </div>
              ))}</div>)}

          {tab === "tab_wallet" && (
            <div style={{ padding: 22 }}>
              <div className="card" style={{ padding: 24, textAlign: "center", marginBottom: 18 }}>
                <div className="muted" style={{ fontSize: 13 }}>{t("m_balance")}</div>
                <div style={{ fontSize: 40, fontWeight: 850, color: "var(--accent-dark)" }}>◆ {fmt(profile?.points ?? 0)}</div>
                <button className="btn btn-primary mt-s" onClick={() => nav("/points")}>{t("buy_title")}</button>
              </div>
              {ledger.length === 0 ? <div className="muted center">{t("no_history")}</div> : ledger.map((l) => (
                <div className="list-row" key={l.id}>
                  <div className="grow"><h4>{l.reason}</h4><p>{new Date(l.created_at).toLocaleString()}</p></div>
                  <b style={{ color: l.delta < 0 ? "var(--danger)" : "var(--success)" }}>{l.delta > 0 ? "+" : ""}{l.delta}</b>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {review && <ReviewModal booking={review.booking} expertName={review.name} onClose={() => setReview(null)} onDone={load} />}
    </section>
  );
}
