/* Join / collaborate request — costs 10 points, deducted on the server.
   Open to BOTH experts and clients. */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../lib/i18n.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { useToast, fmt } from "../lib/ui.jsx";
import { sendProjectRequest, projectErrorKey, JOIN_COST } from "../lib/projects.js";

export default function JoinProjectModal({ project, onClose, onSent }) {
  const { t } = useLang();
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const balance = profile?.points ?? 0;
  const enough = balance >= JOIN_COST;

  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      await sendProjectRequest(project.id, msg);
      await refreshProfile();
      toast(t("pj_sent_ok"), "good");
      onSent && onSent();
      onClose();
    } catch (e) {
      const key = projectErrorKey(e);
      if (key === "insufficient") { toast(t("insufficient"), "warn"); onClose(); nav("/points"); return; }
      setErr(t(key));
    } finally { setBusy(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-head">
          <h3>{t("pj_join_title")}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p className="muted" style={{ fontSize: 14 }}>{t("pj_join_sub", { title: project.title })}</p>

          <div className="field mt-m">
            <label>{t("pj_join_msg")}</label>
            <textarea
              placeholder={t("pj_join_ph")}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              maxLength={600}
            />
            <div className="pcounter">{msg.length}/600</div>
          </div>

          <div className="summary">
            <div className="summary-row">
              <span>{t("pj_cost")}</span><b>◆ {JOIN_COST} {t("points")}</b>
            </div>
            <div className="summary-row">
              <span>{t("balance")}</span>
              <span style={{ color: enough ? "var(--muted)" : "var(--danger)" }}>
                ◆ {fmt(balance)} {t("points")}
              </span>
            </div>
            <div className="summary-row total">
              <span>{t("pj_after")}</span>
              <span>◆ {fmt(Math.max(0, balance - JOIN_COST))}</span>
            </div>
          </div>

          {err && <div className="err-text">{err}</div>}

          {!enough ? (
            <button className="btn btn-accent btn-block mt-s" onClick={() => { onClose(); nav("/points"); }}>
              {t("buy_title")}
            </button>
          ) : (
            <button className="btn btn-primary btn-block mt-s" disabled={busy} onClick={submit}>
              {busy ? "…" : t("pj_send_request")}
            </button>
          )}
          <p className="center muted mt-s" style={{ fontSize: 12 }}>{t("pj_join_note")}</p>
        </div>
      </div>
    </div>
  );
}
