import { useState } from "react";
import { supabase } from "../lib/supabase.js";
import { useLang } from "../lib/i18n.js";
import { useToast } from "../lib/ui.jsx";

export default function ReviewModal({ booking, expertName, onClose, onDone }) {
  const { t } = useLang();
  const toast = useToast();
  const [stars, setStars] = useState(5);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("submit_review", {
      p_booking_id: booking.id, p_stars: stars, p_body: body,
    });
    setBusy(false);
    if (error) { toast(t("err_generic"), "warn"); return; }
    toast(t("review_ok"), "good");
    onDone && onDone();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-head"><h3>{t("review_title")}</h3><button className="modal-close" onClick={onClose}>✕</button></div>
        <div className="modal-body center">
          <p className="muted">{t("review_sub", { name: expertName })}</p>
          <div style={{ fontSize: 40, letterSpacing: 6, margin: "16px 0" }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} style={{ cursor: "pointer", color: n <= stars ? "var(--accent)" : "var(--line)" }} onClick={() => setStars(n)}>★</span>
            ))}
          </div>
          <div className="field"><textarea placeholder={t("review_ph")} value={body} onChange={(e) => setBody(e.target.value)} /></div>
          <button className="btn btn-primary btn-block" disabled={busy} onClick={submit}>{busy ? "…" : t("submit_review")}</button>
        </div>
      </div>
    </div>
  );
}
