/* Company funding — real ₮ (not points).
   Creates a 'pending' pledge; the QPay webhook calls confirm_funding()
   to mark it paid and add it to the project total. */
import { useState } from "react";
import { useLang } from "../lib/i18n.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { useToast, fmt } from "../lib/ui.jsx";
import { pledgeFunding } from "../lib/projects.js";

const PRESETS = [500000, 1000000, 5000000, 10000000];

export default function FundProjectModal({ project, onClose, onDone }) {
  const { t } = useLang();
  const { profile } = useAuth();
  const toast = useToast();
  const [amount, setAmount] = useState(1000000);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const remaining = Math.max(0, (project.funding_goal_mnt || 0) - (project.funded_mnt || 0));

  const submit = async () => {
    setErr("");
    if (!amount || amount < 10000) { setErr(t("pj_fund_min")); return; }
    setBusy(true);
    try {
      await pledgeFunding(project.id, amount, msg);
      toast(t("pj_fund_ok"), "good");
      onDone && onDone();
      onClose();
    } catch (e) {
      setErr(t("err_generic"));
    } finally { setBusy(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 540 }}>
        <div className="modal-head">
          <h3>{t("pj_fund_title")}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p className="muted" style={{ fontSize: 14 }}>{t("pj_fund_sub", { title: project.title })}</p>

          {project.funding_goal_mnt > 0 && (
            <div className="summary">
              <div className="summary-row"><span>{t("pj_goal")}</span><b>₮{fmt(project.funding_goal_mnt)}</b></div>
              <div className="summary-row"><span>{t("pj_raised")}</span><span>₮{fmt(project.funded_mnt)}</span></div>
              <div className="summary-row total"><span>{t("pj_remaining")}</span><span>₮{fmt(remaining)}</span></div>
            </div>
          )}

          <div className="field">
            <label>{t("pj_amount")}</label>
            <div className="pamounts">
              {PRESETS.map((v) => (
                <button key={v} type="button"
                  className={"pamount" + (amount === v ? " active" : "")}
                  onClick={() => setAmount(v)}>₮{fmt(v)}</button>
              ))}
            </div>
            <input type="number" min={10000} step={10000} value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value || "0", 10))}
              style={{ marginTop: 10 }} />
          </div>

          <div className="field">
            <label>{t("pj_fund_msg")}</label>
            <textarea placeholder={t("pj_fund_ph")} value={msg}
              onChange={(e) => setMsg(e.target.value)} maxLength={400} />
          </div>

          {err && <div className="err-text">{err}</div>}

          <button className="btn btn-accent btn-block" disabled={busy} onClick={submit}>
            {busy ? "…" : t("pj_fund_btn", { amount: fmt(amount) })}
          </button>
          <p className="center muted mt-s" style={{ fontSize: 12 }}>
            ⓘ {t("pj_fund_note")}
          </p>
          {profile?.role !== "company" && (
            <p className="center muted" style={{ fontSize: 11.5 }}>{t("pj_fund_anyone")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
