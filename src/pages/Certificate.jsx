import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { useLang } from "../lib/i18n.js";
import { useAuth } from "../lib/AuthContext.jsx";

export default function Certificate() {
  const { id } = useParams();
  const { t } = useLang();
  const { profile } = useAuth();
  const nav = useNavigate();
  const [cert, setCert] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    supabase.from("certificates").select("*").eq("id", id).maybeSingle()
      .then(({ data }) => { data ? setCert(data) : setMissing(true); });
  }, [id]);

  if (missing) return <section className="section"><div className="container"><p className="muted">{t("no_results")}</p></div></section>;
  if (!cert) return <div className="page-loading"><div className="spinner" /></div>;

  const name = profile?.full_name || "LINKLEY user";
  return (
    <section className="section fade-in">
      <div className="container" style={{ maxWidth: 760 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => nav("/dashboard")}>←</button>
        <div className="cert mt-m">
          <div className="cert-seal">★</div>
          <h2>{t("cert_head")}</h2>
          <div className="name">{name}</div>
          <p>{t("cert_body", { name })}</p>
          <div className="cert-foot">
            <div><b>{t("cert_issued")}</b><br />{new Date(cert.issued_at).toLocaleDateString()}</div>
            <div style={{ fontWeight: 800, color: "var(--primary)" }}>LINKLEY</div>
            <div style={{ textAlign: "right" }}><b>{t("cert_id")}</b><br />{cert.cert_code}</div>
          </div>
        </div>
        <div className="center mt-m">
          <button className="btn btn-primary" onClick={() => window.print()}>⬇ {t("download_cert")}</button>
        </div>
      </div>
    </section>
  );
}
