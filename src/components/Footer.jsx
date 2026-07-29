import { Link } from "react-router-dom";
import { useLang } from "../lib/i18n.js";

// ⚠️ Change this to the address you actually read.
export const CONTACT_EMAIL = "hello@linkley.tech";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="logo"><img src="/logo-192.png" className="logo-mark" alt="LINKLEY" width="34" height="34" />LINKLEY</div>
          <p style={{ color: "#94A3B8", fontSize: 14, maxWidth: 260 }}>{t("foot_tag")}</p>
        </div>
        <div>
          <h5>{t("foot_product")}</h5>
          <Link to="/about">{t("nav_about")}</Link>
          <Link to="/browse">{t("nav_browse")}</Link>
          <Link to="/projects">{t("nav_projects")}</Link>
          <Link to="/points">{t("nav_points")}</Link>
        </div>
        <div>
          <h5>{t("foot_company")}</h5>
          <Link to="/about">{t("nav_about")}</Link>
          <a href={"mailto:" + CONTACT_EMAIL}>{t("foot_contact")}</a>
        </div>
        <div>
          <h5>{t("foot_support")}</h5>
          <span className="foot-plain">{t("foot_pay")}: QPay · SocialPay</span>
          <a href={"mailto:" + CONTACT_EMAIL}>{CONTACT_EMAIL}</a>
        </div>
      </div>
      <div className="footer-bottom">© 2026 LINKLEY. {t("foot_rights")} · 100 point = 5,000₮</div>
    </footer>
  );
}
