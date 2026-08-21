/* ============================================================
   LINKLEY — "finish your profile" banner for the expert dashboard.
   Hides itself once the profile is 100% complete.
   ============================================================ */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../lib/i18n.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { getMyExpertProfile, profileScore, nextBestAction } from "../lib/expertProfile.js";

export default function ProfileNudge() {
  const { t } = useLang();
  const { user, profile } = useAuth();
  const nav = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    if (!user || profile?.role !== "expert") return;
    getMyExpertProfile(user.id).then((d) => { if (alive) setData(d); });
    return () => { alive = false; };
  }, [user, profile]);

  if (!data) return null;
  const { score } = profileScore(data);
  const next = nextBestAction(data);

  // Complete profile: show a quiet edit link instead of a nag.
  if (score >= 100) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => nav("/expert/profile")}>
          {t("ep_edit_profile")}
        </button>
      </div>
    );
  }

  return (
    <div className="epnudge">
      <div className="epnudge-ring">{score}%</div>
      <div className="epnudge-txt">
        <b>{t("ep_nudge_title")}</b>
        <span>{next ? t("ep_next_" + next) : t("ep_nudge_sub")}</span>
      </div>
      <button className="btn btn-primary btn-sm" onClick={() => nav("/expert/profile")}>
        {t("ep_nudge_cta")}
      </button>
    </div>
  );
}
