import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { useLang } from "../lib/i18n.js";
import { useAuth } from "../lib/AuthContext.jsx";

export default function Call() {
  const { bookingId } = useParams();
  const { t } = useLang();
  const { profile } = useAuth();
  const nav = useNavigate();
  const [room, setRoom] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    supabase.from("bookings").select("jitsi_room,status").eq("id", bookingId).maybeSingle()
      .then(({ data }) => { if (data?.jitsi_room) setRoom(data.jitsi_room); else setNotFound(true); });
  }, [bookingId]);

  if (notFound) return <section className="section"><div className="container"><p className="muted">—</p></div></section>;
  if (!room) return <div className="page-loading"><div className="spinner" /></div>;

  const name = encodeURIComponent(profile?.full_name || "LINKLEY user");
  const src = `https://meet.jit.si/${room}#userInfo.displayName="${name}"&config.prejoinPageEnabled=false`;

  return (
    <section className="section fade-in">
      <div className="container" style={{ maxWidth: 960 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 22 }}>{t("call_title")}</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => nav("/dashboard")}>← {t("nav_dashboard")}</button>
        </div>
        <iframe
          className="call-frame"
          title="LINKLEY video call"
          src={src}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
        />
        <div className="center mt-m">
          <button className="btn btn-accent" onClick={() => nav("/dashboard")}>📞 {t("call_end")}</button>
        </div>
        <p className="center muted mt-s" style={{ fontSize: 13 }}>
          {t("call_with")} · Jitsi Meet · {room}
        </p>
      </div>
    </section>
  );
}
