import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { useLang } from "../lib/i18n.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { useToast, SLOTS, fmt } from "../lib/ui.jsx";

export default function BookingModal({ expert, onClose }) {
  const { lang, t } = useLang();
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();
  const nav = useNavigate();

  const [step, setStep] = useState(0);
  const [type, setType] = useState("pro");
  const [slot, setSlot] = useState(null);
  const [bid, setBid] = useState(10);
  const [msg, setMsg] = useState("");
  const [method, setMethod] = useState("qpay");
  const [busy, setBusy] = useState(false);

  const nameOf = expert.full_name;
  const base = 10;
  const extra = Math.max(0, bid - base);
  const fee = type === "pro" ? expert.fee_mnt : 0;
  const steps = ["step_type", "step_time", "step_bid", "step_pay"];
  const canNext = step === 1 ? !!slot : true;
  const isLast = step === steps.length - 1;

  const confirm = async () => {
    if ((profile?.points ?? 0) < bid) { toast(t("insufficient"), "warn"); onClose(); nav("/points"); return; }
    setBusy(true);
    const { error } = await supabase.rpc("book_session", {
      p_expert_id: expert.id, p_type: type, p_slot: slot, p_bid: bid, p_message: msg,
    });
    setBusy(false);
    if (error) {
      if (String(error.message).includes("INSUFFICIENT")) { toast(t("insufficient"), "warn"); onClose(); nav("/points"); return; }
      toast(t("err_generic"), "warn"); return;
    }
    await refreshProfile();
    onClose();
    toast(t("booked_ok"), "good");
    nav("/dashboard");
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-head">
          <h3>{t("book_title")} · {nameOf}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="stepper">{steps.map((_, i) => <div key={i} className={"dot " + (i <= step ? "done" : "")} />)}</div>
          <div className="fade-in" key={step}>
            {step === 0 && (
              <>
                <div className="field"><label>{t("step_type")}</label></div>
                <div className={"slot type " + (type === "student" ? "active" : "")} onClick={() => setType("student")} style={{ marginBottom: 10 }}>
                  <div className="t-ico">🎓</div><div><b>{t("type_student")}</b><div className="muted" style={{ fontSize: 13 }}>{t("type_student_d")}</div></div>
                </div>
                <div className={"slot type " + (type === "pro" ? "active" : "")} onClick={() => setType("pro")}>
                  <div className="t-ico">🧑‍💼</div><div><b>{t("type_pro")}</b><div className="muted" style={{ fontSize: 13 }}>{t("type_pro_d")}</div></div>
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <div className="field"><label>{t("pick_slot")}</label></div>
                <div className="slot-grid">
                  {SLOTS.map((s) => <div key={s} className={"slot " + (slot === s ? "active" : "")} onClick={() => setSlot(s)}>{s}</div>)}
                </div>
                <div className="field mt-m"><label>{t("msg_label")}</label>
                  <textarea placeholder={t("msg_ph")} value={msg} onChange={(e) => setMsg(e.target.value)} /></div>
              </>
            )}
            {step === 2 && (
              <>
                <div className="field">
                  <label>{t("bid_label")}: <span style={{ color: "var(--accent-dark)" }}>◆ {bid}</span></label>
                  <input className="bid-slider" type="range" min={10} max={60} step={5} value={bid} onChange={(e) => setBid(parseInt(e.target.value))} />
                  <p className="muted" style={{ fontSize: 13 }}>{t("bid_hint")}</p>
                </div>
                <div className="summary">
                  <div className="summary-row"><span>{t("sum_base")}</span><span>◆ {base}</span></div>
                  <div className="summary-row"><span>{t("sum_bid")}</span><span>◆ {extra}</span></div>
                  <div className="summary-row total"><span>{t("sum_total")}</span><span>◆ {bid}</span></div>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <div className="field"><label>{t("step_pay")}</label>
                  <div className="pay-method">
                    <button type="button" className={method === "qpay" ? "active" : ""} onClick={() => setMethod("qpay")}>QPay</button>
                    <button type="button" className={method === "social" ? "active" : ""} onClick={() => setMethod("social")}>SocialPay</button>
                    <button type="button" className={method === "points" ? "active" : ""} onClick={() => setMethod("points")}>◆ {t("points")}</button>
                  </div>
                </div>
                <div className="summary">
                  <div className="summary-row"><span>{t("sum_type")}</span><span>{type === "pro" ? t("type_pro") : t("type_student")}</span></div>
                  <div className="summary-row"><span>{t("sum_expert")}</span><span>{nameOf}</span></div>
                  <div className="summary-row"><span>{t("sum_slot")}</span><span>{slot || t("pick_slot")}</span></div>
                  <div className="summary-row"><span>{t("sum_base")} + {t("sum_bid")}</span><span>◆ {bid}</span></div>
                  {fee > 0 && <div className="summary-row"><span>{t("sum_fee")}</span><span>₮{fmt(fee)}</span></div>}
                  <div className="summary-row total"><span>{t("sum_total")}</span><span>◆ {bid}{fee > 0 ? ` + ₮${fmt(fee)}` : ""}</span></div>
                </div>
                <p className="muted" style={{ fontSize: 12.5 }}>{t("balance")}: ◆ {fmt(profile?.points ?? 0)} {t("points")}</p>
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            {step > 0 && <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>{t("back")}</button>}
            <button className="btn btn-primary" style={{ flex: 1 }} disabled={!canNext || busy}
              onClick={() => (isLast ? confirm() : setStep(step + 1))}>
              {busy ? "…" : isLast ? t("confirm") : t("next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
