import { Link, NavLink, useNavigate } from "react-router-dom";
import { useLang } from "../lib/i18n.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { fmt } from "../lib/ui.jsx";
import MessagesLink from "./MessagesLink.jsx";

export default function Header() {
  const { lang, setLang, t } = useLang();
  const { user, profile, signOut } = useAuth();
  const nav = useNavigate();

  const onLogout = async () => { await signOut(); nav("/"); };

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo"><img src="/logo-192.png" className="logo-mark" alt="LINKLEY" width="34" height="34" />LINKLEY</Link>
        <nav className="nav">
          <NavLink to="/about" className={({isActive}) => isActive ? "active" : ""}>{t("nav_about")}</NavLink>
          <NavLink to="/browse" className={({isActive}) => isActive ? "active" : ""}>{t("nav_browse")}</NavLink>
          <NavLink to="/projects" className={({isActive}) => isActive ? "active" : ""}>{t("nav_projects")}</NavLink>
          <NavLink to="/points" className={({isActive}) => isActive ? "active" : ""}>{t("nav_points")}</NavLink>
          <MessagesLink />
          {user && <NavLink to="/dashboard" className={({isActive}) => isActive ? "active" : ""}>{t("nav_dashboard")}</NavLink>}
        </nav>
        <div className="header-right">
          <div className="lang-toggle">
            <button className={lang === "mn" ? "active" : ""} onClick={() => setLang("mn")}>МН</button>
            <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
          </div>
          {user ? (
            <>
              <Link to="/points" className="points-chip" title={t("buy_title")}>◆ {fmt(profile?.points ?? 0)} {t("points")}</Link>
              <button className="btn btn-ghost btn-sm" onClick={onLogout}>{t("logout")}</button>
            </>
          ) : (
            <>
              <Link to="/auth" className="btn btn-ghost btn-sm">{t("login")}</Link>
              <Link to="/auth" className="btn btn-primary btn-sm">{t("signup")}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
