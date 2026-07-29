/* ============================================================
   LINKLEY — "Message this expert"
   Costs 5 points the first time only. If a thread already exists
   the server reuses it and charges nothing.
   ============================================================ */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../lib/i18n.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { useToast, fmt } from "../lib/ui.jsx";
import { startExpertChat, chatErrorKey, CHAT_OPEN_COST } from "../lib/chat.js";

export default function StartChatModal({ expert, onClose }) {
  const { t } = useLang();
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const balance = profile?.points ?? 0;
  const enough = balance >= CHAT_OPEN_COST;

  const submit = async (e) => {
    e?.preventDefault();
    if (!msg.trim()) return;
    setErr(""); setBusy(true);
    try {
      const convId = await startExpertChat(expert.id, msg.trim());
      await refreshProfile();
      toast(t("ch_started"), "good");
      onClose();
      nav("/messages/" + convId);
    } catch (e2) {
      const key = chatErrorKey(e2);
      if (key === "insufficient") { toast(t("insufficient"), "warn"); onClose(); nav("/points"); return; }
      setErr(t(key));
    } finally { setBusy(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="modal" style={{ maxWidth: 520 }} onSubmit={submit}>
        <div className="modal-head">
          <h3>{t("ch_start_title")}</h3>
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p className="muted" style={{ fontSize: 14 }}>
            {t("ch_start_sub", { name: expert.full_name })}
          </p>

          <div className="field mt-m">
            <label>{t("ch_first_message")}</label>
            <textarea autoFocus value={msg} onChange={(e) => setMsg(e.target.value)}
              placeholder={t("ch_start_ph")} maxLength={1000} style={{ minHeight: 110 }} />
            <div className="pcounter">{msg.length}/1000</div>
          </div>

          <div className="summary">
            <div className="summary-row">
              <span>{t("ch_open_cost")}</span><b>◆ {CHAT_OPEN_COST} {t("points")}</b>
            </div>
            <div className="summary-row">
              <span>{t("balance")}</span>
              <span style={{ color: enough ? "var(--muted)" : "var(--danger)" }}>
                ◆ {fmt(balance)}
              </span>
            </div>
            <div className="summary-row total">
              <span>{t("pj_after")}</span>
              <span>◆ {fmt(Math.max(0, balance - CHAT_OPEN_COST))}</span>
            </div>
          </div>

          {err && <div className="err-text">{err}</div>}

          {!enough ? (
            <button type="button" className="btn btn-accent btn-block"
              onClick={() => { onClose(); nav("/points"); }}>{t("buy_title")}</button>
          ) : (
            <button className="btn btn-primary btn-block" disabled={busy || !msg.trim()}>
              {busy ? "…" : t("ch_send_first")}
            </button>
          )}
          <p className="center muted mt-s" style={{ fontSize: 12 }}>{t("ch_open_note")}</p>
        </div>
      </form>
    </div>
  );
}
