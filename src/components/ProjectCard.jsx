import { useNavigate } from "react-router-dom";
import { useLang } from "../lib/i18n.js";
import { AVATAR_COLORS, CATEGORIES, fmt } from "../lib/ui.jsx";

export function statusPill(status, t) {
  const map = {
    open: ["pill-green", "pj_status_open"],
    in_progress: ["pill-blue", "pj_status_progress"],
    completed: ["pill-gray", "pj_status_done"],
  };
  const [cls, key] = map[status] || map.open;
  return <span className={"pill " + cls}>{t(key)}</span>;
}

export default function ProjectCard({ p, onOpen }) {
  const { lang, t } = useLang();
  const nav = useNavigate();
  const cat = CATEGORIES.find((c) => c.id === p.category_id);
  const pct = p.funding_goal_mnt > 0
    ? Math.min(100, Math.round((p.funded_mnt / p.funding_goal_mnt) * 100)) : 0;
  const go = () => (onOpen ? onOpen(p) : nav("/projects/" + p.id));

  return (
    <article className="card pcard" onClick={go}>
      <div className="pcard-cover" style={{ background: AVATAR_COLORS[(p.cover_color ?? 0) % 8] }}>
        <span className="pcard-cover-mark">{(p.title || "?").slice(0, 1)}</span>
        <div className="pcard-cover-top">
          {statusPill(p.status, t)}
          {cat && <span className="pill pill-glass">{cat.emoji} {lang === "mn" ? cat.mn : cat.en}</span>}
        </div>
      </div>

      <div className="pcard-body">
        <h3>{p.title}</h3>
        <p className="pcard-sum">{p.summary}</p>

        {p.tags?.length > 0 && (
          <div className="tag-row">
            {p.tags.slice(0, 3).map((tg) => <span className="pill pill-gray" key={tg}>#{tg}</span>)}
            {p.tags.length > 3 && <span className="pill pill-gray">+{p.tags.length - 3}</span>}
          </div>
        )}

        {p.looking_for?.length > 0 && (
          <div className="pcard-need">
            <span className="pcard-need-label">{t("pj_looking_for")}:</span>{" "}
            {p.looking_for.slice(0, 2).join(", ")}
            {p.looking_for.length > 2 ? "…" : ""}
          </div>
        )}

        {p.funding_goal_mnt > 0 && (
          <div className="pfund">
            <div className="pfund-bar"><div className="pfund-fill" style={{ width: pct + "%" }} /></div>
            <div className="pfund-meta">
              <b>₮{fmt(p.funded_mnt)}</b>
              <span>/ ₮{fmt(p.funding_goal_mnt)} · {pct}%</span>
            </div>
          </div>
        )}
      </div>

      <footer className="pcard-foot">
        <div className="pcard-owner">
          <div className="avatar avatar-xs" style={{ background: AVATAR_COLORS[(p.owner_color ?? 0) % 8] }}>
            {p.owner_initials}
          </div>
          <span>{p.owner_name}</span>
        </div>
        <div className="pcard-stats">
          <span title={t("pj_team")}>👥 {p.members_count}</span>
          <span title={t("pj_requests")}>✉ {p.requests_count}</span>
        </div>
      </footer>
    </article>
  );
}
