import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLang } from "../lib/i18n.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { useToast, AVATAR_COLORS, CATEGORIES, fmt } from "../lib/ui.jsx";
import {
  getProject, getProjectRequests, getProjectFunding, setRequestStatus,
} from "../lib/projects.js";
import { statusPill } from "../components/ProjectCard.jsx";
import JoinProjectModal from "../components/JoinProjectModal.jsx";
import FundProjectModal from "../components/FundProjectModal.jsx";

export default function ProjectDetail() {
  const { id } = useParams();
  const { lang, t } = useLang();
  const { user, profile } = useAuth();
  const toast = useToast();
  const nav = useNavigate();

  const [p, setP] = useState(undefined);      // undefined = loading, null = missing
  const [requests, setRequests] = useState([]);
  const [funding, setFunding] = useState([]);
  const [joinOpen, setJoinOpen] = useState(false);
  const [fundOpen, setFundOpen] = useState(false);
  const [tab, setTab] = useState("about");

  const load = useCallback(async () => {
    const proj = await getProject(id);
    setP(proj);
    if (proj) {
      setRequests(await getProjectRequests(id));
      setFunding(await getProjectFunding(id));
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (p === undefined) return <div className="page-loading"><div className="spinner" /></div>;
  if (!p) return (
    <section className="section"><div className="container">
      <p className="muted">{t("pj_missing")}</p>
      <button className="btn btn-ghost btn-sm mt-s" onClick={() => nav("/projects")}>← {t("pj_title")}</button>
    </div></section>
  );

  const isOwner = user && user.id === p.owner_id;
  const isMember = p.team.some((m) => m.user_id === user?.id);
  const myPending = requests.some((r) => r.sender_id === user?.id && r.status === "pending");
  const cat = CATEGORIES.find((c) => c.id === p.category_id);
  const pct = p.funding_goal_mnt > 0
    ? Math.min(100, Math.round((p.funded_mnt / p.funding_goal_mnt) * 100)) : 0;
  const pendingReqs = requests.filter((r) => r.status === "pending");

  const act = async (rid, status) => {
    try {
      await setRequestStatus(rid, status);
      toast(status === "accepted" ? t("accept") : t("decline"), status === "accepted" ? "good" : "warn");
      load();
    } catch { toast(t("err_generic"), "warn"); }
  };

  const askJoin = () => { if (!user) { nav("/auth"); return; } setJoinOpen(true); };
  const askFund = () => { if (!user) { nav("/auth"); return; } setFundOpen(true); };

  return (
    <section className="section fade-in">
      <div className="container">
        <button className="btn btn-ghost btn-sm" onClick={() => nav("/projects")}>← {t("pj_title")}</button>

        {/* ── hero ─────────────────────────────── */}
        <div className="card pdetail-head mt-m">
          <div className="pdetail-cover" style={{ background: AVATAR_COLORS[(p.cover_color ?? 0) % 8] }}>
            <span>{(p.title || "?").slice(0, 1)}</span>
          </div>
          <div className="pdetail-main">
            <div className="pdetail-pills">
              {statusPill(p.status, t)}
              {cat && <span className="pill pill-gray">{cat.emoji} {lang === "mn" ? cat.mn : cat.en}</span>}
            </div>
            <h1>{p.title}</h1>
            <p className="muted">{p.summary}</p>
            <div className="pdetail-owner">
              <div className="avatar avatar-xs" style={{ background: AVATAR_COLORS[(p.owner?.avatar_color ?? 0) % 8] }}>
                {p.owner?.avatar_initials}
              </div>
              <span>{p.owner?.full_name}</span>
              <span className="muted">· {t("pj_owner")}</span>
            </div>
          </div>

          <div className="pdetail-actions">
            {p.funding_goal_mnt > 0 && (
              <div className="card pfund-box">
                <div className="pfund-bar"><div className="pfund-fill" style={{ width: pct + "%" }} /></div>
                <div className="pfund-nums">
                  <b>₮{fmt(p.funded_mnt)}</b>
                  <span className="muted">/ ₮{fmt(p.funding_goal_mnt)}</span>
                </div>
                <div className="muted" style={{ fontSize: 12 }}>{pct}% {t("pj_funded")}</div>
              </div>
            )}
            {isOwner ? (
              <span className="pill pill-blue center">{t("pj_you_own")}</span>
            ) : isMember ? (
              <span className="pill pill-green center">✓ {t("pj_you_member")}</span>
            ) : myPending ? (
              <span className="pill pill-amber center">{t("pj_pending")}</span>
            ) : (
              <button className="btn btn-primary btn-block" onClick={askJoin}>
                {t("pj_join_btn")} · ◆ 10
              </button>
            )}
            <button className="btn btn-accent btn-block" onClick={askFund}>{t("pj_fund_btn_short")}</button>
          </div>
        </div>

        {/* ── tabs ─────────────────────────────── */}
        <div className="dash-tabs mt-l">
          {["about", "team", "funding", ...(isOwner ? ["requests"] : [])].map((x) => (
            <button key={x} className={"dash-tab " + (tab === x ? "active" : "")} onClick={() => setTab(x)}>
              {t("pj_tab_" + x)}
              {x === "requests" && pendingReqs.length > 0 && <span className="tab-badge">{pendingReqs.length}</span>}
            </button>
          ))}
        </div>

        <div className="grid grid-2 pdetail-body" style={{ alignItems: "start" }}>
          <div className="card" style={{ padding: 26 }}>
            {tab === "about" && (
              <>
                <h3 className="psec-title">{t("pj_about")}</h3>
                <p className="pdesc">{p.description || p.summary}</p>
                {p.looking_for?.length > 0 && (
                  <>
                    <h3 className="psec-title mt-l">{t("pj_looking_for")}</h3>
                    <div className="tag-row">
                      {p.looking_for.map((r) => <span className="pill pill-blue" key={r}>{r}</span>)}
                    </div>
                  </>
                )}
                {p.tags?.length > 0 && (
                  <>
                    <h3 className="psec-title mt-l">{t("pj_tags")}</h3>
                    <div className="tag-row">
                      {p.tags.map((tg) => (
                        <button className="pill pill-gray" key={tg}
                          onClick={() => nav("/projects?tag=" + encodeURIComponent(tg))}>#{tg}</button>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {tab === "team" && (
              <>
                <h3 className="psec-title">{t("pj_team")} · {p.team.length}</h3>
                {p.team.map((m) => (
                  <div className="list-row" key={m.user_id}>
                    <div className="avatar" style={{ width: 42, height: 42, fontSize: 15, background: AVATAR_COLORS[(m.profile?.avatar_color ?? 0) % 8] }}>
                      {m.profile?.avatar_initials || "?"}
                    </div>
                    <div className="grow">
                      <h4>{m.profile?.full_name || "—"}</h4>
                      <p>{m.role === "owner" ? t("pj_owner") : t("pj_collaborator")}</p>
                    </div>
                    {m.role === "owner" && <span className="pill pill-blue">{t("pj_owner")}</span>}
                  </div>
                ))}
              </>
            )}

            {tab === "funding" && (
              <>
                <h3 className="psec-title">{t("pj_tab_funding")}</h3>
                {funding.length === 0 ? (
                  <p className="muted" style={{ fontSize: 14 }}>{t("pj_no_funding")}</p>
                ) : funding.map((f) => (
                  <div className="list-row" key={f.id}>
                    <div className="grow">
                      <h4>₮{fmt(f.amount_mnt)}</h4>
                      <p>{f.message || "—"} · {new Date(f.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={"pill " + (f.status === "paid" ? "pill-green" : "pill-amber")}>
                      {t(f.status === "paid" ? "pj_paid" : "pj_pending_pay")}
                    </span>
                  </div>
                ))}
              </>
            )}

            {tab === "requests" && isOwner && (
              <>
                <h3 className="psec-title">{t("pj_tab_requests")}</h3>
                {requests.length === 0 ? (
                  <p className="muted" style={{ fontSize: 14 }}>{t("pj_no_requests")}</p>
                ) : requests.map((r) => (
                  <div className="list-row" key={r.id}>
                    <div className="avatar" style={{ width: 42, height: 42, fontSize: 15, background: AVATAR_COLORS[(r.sender?.avatar_color ?? 0) % 8] }}>
                      {r.sender?.avatar_initials || "?"}
                    </div>
                    <div className="grow">
                      <h4>{r.sender?.full_name || "—"} <span className="queue-bid" style={{ display: "inline-flex" }}>◆ {r.points_spent}</span></h4>
                      <p>{r.message || "—"}</p>
                    </div>
                    {r.status === "pending" ? (
                      <>
                        <button className="btn btn-primary btn-sm" onClick={() => act(r.id, "accepted")}>{t("accept")}</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => act(r.id, "declined")}>{t("decline")}</button>
                      </>
                    ) : (
                      <span className={"pill " + (r.status === "accepted" ? "pill-green" : "pill-gray")}>
                        {t(r.status === "accepted" ? "pj_accepted" : "pj_declined")}
                      </span>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* side panel */}
          <div className="card" style={{ padding: 26 }}>
            <h3 className="psec-title">{t("pj_how_title")}</h3>
            <ol className="phow">
              <li><b>◆ 10 point</b> — {t("pj_how_1")}</li>
              <li>{t("pj_how_2")}</li>
              <li>{t("pj_how_3")}</li>
            </ol>
            <div className="summary">
              <div className="summary-row"><span>{t("pj_team")}</span><b>{p.members_count}</b></div>
              <div className="summary-row"><span>{t("pj_requests")}</span><b>{p.requests_count}</b></div>
              <div className="summary-row"><span>{t("pj_created")}</span>
                <span>{new Date(p.created_at).toLocaleDateString()}</span></div>
            </div>
          </div>
        </div>
      </div>

      {joinOpen && <JoinProjectModal project={p} onClose={() => setJoinOpen(false)} onSent={load} />}
      {fundOpen && <FundProjectModal project={p} onClose={() => setFundOpen(false)} onDone={load} />}
    </section>
  );
}
