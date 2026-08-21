import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { useLang } from "../lib/i18n.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { useToast, fmt } from "../lib/ui.jsx";
import ProfileNudge from "../components/ProfileNudge.jsx";

function Metric({ label, value }) {
  return <div className="card metric"><div className="label">{label}</div><div className="value">{value}</div></div>;
}
const PT_TO_MNT = 50; // 100 pts = 5,000₮

export default function DashboardExpert() {
  const { lang, t } = useLang();
  const { user, profile } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [tab, setTab] = useState("tab_requests");
  const [bookings, setBookings] = useState([]);
  const [me, setMe] = useState(null);
  const [limit, setLimit] = useState(5);

  const load = useCallback(async () => {
    if (!user) return;
    const { data: bk } = await supabase.from("bookings").select("*").eq("expert_id", user.id).order("bid_points", { ascending: false });
    setBookings(bk || []);
    const { data: e } = await supabase.from("experts").select("*").eq("id", user.id).maybeSingle();
    setMe(e); if (e) setLimit(e.session_limit);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const pending = bookings.filter((b) => b.status === "pending");
  const totalPoints = bookings.filter((b) => b.status !== "declined").reduce((a, b) => a + b.bid_points, 0);
  const revenueMnt = totalPoints * PT_TO_MNT;
  const bonusMnt = Math.round(revenueMnt * 0.7);

  const act = async (id, status) => {
    const { error } = await supabase.rpc("set_booking_status", { p_booking_id: id, p_status: status });
    if (error) { toast(t("err_generic"), "warn"); return; }
    toast(status === "accepted" ? t("accept") : t("decline"), status === "accepted" ? "good" : "warn");
    load();
  };

  const saveLimit = async () => {
    const { error } = await supabase.from("experts").update({ session_limit: limit }).eq("id", user.id);
    toast(error ? t("err_generic") : t("saved"), error ? "warn" : "good");
  };

  const tabs = ["tab_requests", "tab_earnings", "tab_settings"];

  return (
    <section className="section fade-in">
      <div className="container">
        <h2 style={{ fontSize: 28, letterSpacing: "-.6px" }}>{t("dash_expert")}</h2>
        <ProfileNudge />
        <div className="grid grid-4 mt-m">
          <Metric label={t("m_pending")} value={pending.length} />
          <Metric label={t("m_income")} value={"₮" + fmt(revenueMnt)} />
          <Metric label={t("m_rating2")} value={(me ? Number(me.rating).toFixed(1) : "5.0") + " ★"} />
          <Metric label={t("completed")} value={me?.sessions_count ?? 0} />
        </div>

        <div className="grid grid-2 mt-l" style={{ alignItems: "start" }}>
          <div>
            <div className="dash-tabs">
              {tabs.map((x) => <button key={x} className={"dash-tab " + (tab === x ? "active" : "")} onClick={() => setTab(x)}>{t(x)}</button>)}
            </div>
            <div className="card fade-in" style={{ padding: "6px 0" }}>
              {tab === "tab_requests" && (pending.length === 0
                ? <div style={{ padding: 30, textAlign: "center" }} className="muted">{t("no_requests")}</div>
                : pending.map((b, i) => (
                    <div className="list-row" key={b.id}>
                      <div className={"queue-rank " + (i === 0 ? "top" : "")}>{i + 1}</div>
                      <div className="grow">
                        <h4>{lang === "mn" ? "Клиент" : "Client"} <span className="queue-bid" style={{ display: "inline-flex" }}>◆ {b.bid_points}</span></h4>
                        <p>{b.message || (b.type === "student" ? t("type_student") : t("type_pro"))} · <span className={"pill " + (b.type === "student" ? "pill-green" : "pill-blue")} style={{ fontSize: 10 }}>{b.type === "student" ? t("type_student") : t("type_pro")}</span></p>
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => act(b.id, "accepted")}>{t("accept")}</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => act(b.id, "declined")}>{t("decline")}</button>
                    </div>
                  )))}

              {tab === "tab_earnings" && (
                <div style={{ padding: "8px 0" }}>
                  <div className="list-row"><div className="grow"><h4>{t("bonus_title")}</h4><p>{t("bonus_note")}</p></div><b style={{ color: "var(--success)" }}>+₮{fmt(bonusMnt)}</b></div>
                  <div className="list-row"><div className="grow"><h4>{lang === "mn" ? "Point орлого" : "Point revenue"}</h4><p>{fmt(totalPoints)} {t("points")} × ₮{PT_TO_MNT}</p></div><b>₮{fmt(revenueMnt)}</b></div>
                  <div className="list-row"><div className="grow"><h4>{lang === "mn" ? "Платформын хураамж (30%)" : "Platform fee (30%)"}</h4><p>{t("fee_note")}</p></div><b className="muted">₮{fmt(revenueMnt - bonusMnt)}</b></div>
                </div>
              )}

              {tab === "tab_settings" && (
                <div style={{ padding: 22 }}>
                  <h4 style={{ fontSize: 16 }}>{t("limit_title")}</h4>
                  <p className="muted" style={{ fontSize: 14, margin: "6px 0 16px" }}>{t("limit_note")}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <input className="bid-slider" type="range" min={1} max={20} value={limit} style={{ flex: 1 }} onChange={(e) => setLimit(parseInt(e.target.value))} />
                    <b style={{ fontSize: 22, minWidth: 90, textAlign: "right" }}>{limit} {t("people")}</b>
                  </div>
                  <button className="btn btn-primary mt-s" onClick={saveLimit}>{t("save")}</button>
                </div>
              )}
            </div>
          </div>

          <div className="card bonus-card">
            <div className="label">{t("bonus_title")}</div>
            <div className="value">₮{fmt(bonusMnt)}</div>
            <p>{t("bonus_note")}</p>
            <div style={{ marginTop: 16, background: "rgba(255,255,255,.15)", borderRadius: 10, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>{lang === "mn" ? "Point орлого" : "Point revenue"}</span><span>₮{fmt(revenueMnt)}</span></div>
              <div style={{ height: 8, background: "rgba(255,255,255,.2)", borderRadius: 5, margin: "8px 0", overflow: "hidden" }}><div style={{ width: "70%", height: "100%", background: "#FDE68A" }} /></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: .9 }}><span>70% {lang === "mn" ? "таны бонус" : "your bonus"}</span><span>30% {lang === "mn" ? "платформ" : "platform"}</span></div>
            </div>
            <button className="btn btn-accent btn-block" style={{ marginTop: 16 }} onClick={() => toast(lang === "mn" ? "Татан авах хүсэлт илгээгдлээ" : "Withdrawal requested", "good")}>{t("withdraw")}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
