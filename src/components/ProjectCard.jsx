import { useNavigate } from "react-router-dom";
import { useLang } from "../lib/i18n.js";
import { AVATAR_COLORS, CATEGORIES } from "../lib/ui.jsx";
import Avatar from "./Avatar.jsx";

export function statusPill(status, t) {
  const map = {
    open: ["pill-green", "pj_status_open"],
    in_progress: ["pill-blue", "pj_status_progress"],
    completed: ["pill-gray", "pj_status_done"],
  };
  const [cls, key] = map[status] || map.open;
  return <span className={"pill " + cls}>{t(key)}</span>;
}

/**
 * The roles a project still needs are the headline, not a funding bar.
 * A person can see themselves in "we need a UX designer"; nobody sees
 * themselves in a progress bar.
 */
export default function ProjectCard({ p, onOpen }) {
  const { lang, t } = useLang();
  const nav = useNavigate();
  const cat = CATEGORIES.find((c) => c.id === p.category_id);
  const go = () => (onOpen ? onOpen(p) : nav("/projects/" + p.id));
  const roles = p.looking_for || [];
  const ownerRole = lang === "mn" ? p.owner_headline_mn : p.owner_headline_en;

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

        {roles.length > 0 ? (
          <div className="pcard-roles">
            <div className="pcard-roles-label">{t("pj_needs_people")}</div>
            <div className="tag-row">
              {roles.slice(0, 3).map((r) => <span className="pill pill-amber" key={r}>{r}</span>)}
              {roles.length > 3 && <span className="pill pill-gray">+{roles.length - 3}</span>}
            </div>
          </div>
        ) : (
          <div className="pcard-roles pcard-roles-none">{t("pj_team_complete")}</div>
        )}

        {p.tags?.length > 0 && (
          <div className="tag-row pcard-tags">
            {p.tags.slice(0, 3).map((tg) => <span className="pill pill-gray" key={tg}>#{tg}</span>)}
          </div>
        )}
      </div>

      <footer className="pcard-foot">
        <div className="pcard-owner">
          <Avatar url={p.owner_avatar_url} initials={p.owner_initials}
                  color={p.owner_color} size={26} />
          <div className="pcard-owner-txt">
            <span className="pcard-owner-name">{p.owner_name}</span>
            {ownerRole && <span className="pcard-owner-role">{ownerRole}</span>}
          </div>
        </div>
        <div className="pcard-stats">
          <span title={t("pj_team")}>◉ {p.members_count}</span>
          <span title={t("pj_requests")}>✉ {p.requests_count}</span>
        </div>
      </footer>
    </article>
  );
}
