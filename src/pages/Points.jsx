import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { useLang } from "../lib/i18n.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { useToast, PACKS, fmt } from "../lib/ui.jsx";

export default function Points() {
  const { t } = useLang();
  const { user, refreshProfile } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [busy, setBusy] = useState(0);

  const buy = async (pack) => {
    if (!user) { nav("/auth"); return; }
    setBusy(pack.pts);
    const { data, error } = await supabase.functions.invoke("qpay", {
      body: { points: pack.pts, price: pack.price },
    });
    setBusy(0);
    if (error) { toast(t("err_generic"), "warn"); return; }
    if (data?.mode === "sandbox") {
      await refreshProfile();
      toast(t("buy_ok", { n: fmt(pack.pts) }), "good");
    } else {
      toast(t("qpay_created"), "good");
    }
  };

  return (
    <section className="section fade-in">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">{t("price_eyebrow")}</span>
          <h2>{t("price_title")}</h2>
          <p>{t("price_sub")}</p>
        </div>
        <div className="price-grid">
          {PACKS.map((p) => (
            <div className={"card price " + (p.pop ? "pop" : "")} key={p.pts}>
              {p.pop && <span className="pill pill-blue price-tag">{t("pop")}</span>}
              <div className="pts">{fmt(p.pts)}<small> {t("points")}</small></div>
              <div className="cost">{p.price}</div>
              <div className="per">{t("per_req", { n: p.pts / 10 })}</div>
              <button className={"btn btn-block " + (p.pop ? "btn-primary" : "btn-ghost")} disabled={busy === p.pts} onClick={() => buy(p)}>
                {busy === p.pts ? "…" : t("price_buy")}
              </button>
            </div>
          ))}
        </div>
        <p className="center muted mt-l" style={{ fontSize: 13 }}>ⓘ {t("sandbox_note")}</p>
      </div>
    </section>
  );
}
