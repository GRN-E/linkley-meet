import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { useLang } from "../lib/i18n.js";
import { useToast } from "../lib/ui.jsx";

/** Turn a Supabase auth error into something a human can act on. */
function friendly(err, t) {
  const m = (err?.message || "").toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered"))
    return t("auth_err_exists");
  if (m.includes("invalid login") || m.includes("invalid credentials"))
    return t("auth_err_bad");
  if (m.includes("email not confirmed"))
    return t("auth_err_unconfirmed");
  if (m.includes("password") && m.includes("6"))
    return t("auth_err_short");
  if (m.includes("sending") && m.includes("email"))
    return t("auth_err_smtp");
  if (m.includes("rate") || m.includes("too many"))
    return t("auth_err_rate");
  return err?.message || t("err_generic");
}

export default function Auth() {
  const { t } = useLang();
  const toast = useToast();
  const nav = useNavigate();
  const [mode, setMode] = useState("signup");   // signup | login
  const [role, setRole] = useState("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setInfo(""); setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: pass,
          options: { data: { full_name: name.trim() || email.split("@")[0], role } },
        });
        if (error) { console.error("[LINKLEY signUp]", error); throw error; }

        // Session present -> email confirmation is OFF, we're logged in.
        if (data?.session) {
          toast("🎁 +50 point", "good");
          nav("/dashboard");
          return;
        }

        // No session -> Supabase wants the email confirmed first.
        // Try an immediate password login in case confirmation is disabled
        // but the signUp response simply didn't carry a session.
        const { data: s2, error: e2 } =
          await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
        if (!e2 && s2?.session) {
          toast("🎁 +50 point", "good");
          nav("/dashboard");
          return;
        }
        setInfo(t("auth_check_email"));
        setMode("login");
        return;
      }

      // ---- login ----
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(), password: pass,
      });
      if (error) { console.error("[LINKLEY signIn]", error); throw error; }
      toast(t("signin"), "good");
      nav("/dashboard");
    } catch (e2) {
      setErr(friendly(e2, t));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap fade-in">
      <form className="card auth-card" onSubmit={submit}>
        <div className="logo" style={{ justifyContent: "center", marginBottom: 8 }}>
          <img src="/logo-192.png" className="logo-mark" alt="LINKLEY" width="34" height="34" />LINKLEY
        </div>
        <h2 className="center" style={{ fontSize: 24 }}>{t("auth_welcome")}</h2>
        <p className="center muted" style={{ margin: "8px 0 22px" }}>{t("auth_sub")}</p>

        {mode === "signup" && (
          <>
            <div className="role-pick">
              <div className={"role-opt " + (role === "client" ? "active" : "")} onClick={() => setRole("client")}>
                <div className="r-ico">🙋</div><b>{t("role_client")}</b>
              </div>
              <div className={"role-opt " + (role === "expert" ? "active" : "")} onClick={() => setRole("expert")}>
                <div className="r-ico">🧑‍🏫</div><b>{t("role_expert")}</b>
              </div>
              <div className={"role-opt " + (role === "company" ? "active" : "")} onClick={() => setRole("company")}>
                <div className="r-ico">🏢</div><b>{t("role_company")}</b>
              </div>
            </div>
            <div className="field">
              <label>{role === "company" ? t("company_name") : t("name_label")}</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder={role === "company" ? t("company_name") : t("name_label")} />
            </div>
          </>
        )}

        <div className="field">
          <label>{t("email_label")}</label>
          <input type="email" required autoComplete="email" value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>

        <div className="field">
          <label>{t("pass_label")}</label>
          <input type="password" required minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" />
          {mode === "signup" && <div className="pcounter">{t("auth_pass_hint")}</div>}
        </div>

        {err && <div className="err-text">{err}</div>}
        {info && <div className="info-text">{info}</div>}

        <button className="btn btn-primary btn-block mt-s" disabled={busy}>
          {busy ? "…" : mode === "signup" ? t("create_acc") : t("signin")}
        </button>

        <p className="center muted mt-s" style={{ fontSize: 13 }}>
          <span className="link" onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setErr(""); setInfo(""); }}>
            {mode === "signup" ? t("have_acc") : t("no_acc")}
          </span>
        </p>
      </form>
    </div>
  );
}
