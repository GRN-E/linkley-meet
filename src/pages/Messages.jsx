/* ============================================================
   LINKLEY — Messages
   Self-contained: every class is prefixed "ch-" and defined in
   chat.css. Nothing here depends on another stylesheet, and an
   error boundary guarantees the page is never blank.
   ============================================================ */
import { useEffect, useState, useRef, useCallback, Component } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLang } from "../lib/i18n.js";
import { useAuth } from "../lib/AuthContext.jsx";
import {
  myConversations, conversationMessages, sendMessage, markRead,
  subscribeToConversation, subscribeToAllMessages,
} from "../lib/chat.js";

const AV = ["#2563EB","#7C3AED","#DB2777","#059669","#D97706","#0891B2","#DC2626","#4F46E5"];

/* ---------- never show a blank page ---------- */
class Boundary extends Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err, info) { console.error("[LINKLEY Messages]", err, info); }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div className="ch-fallback">
        <div className="ch-fallback-ico">!</div>
        <h3>{this.props.t("ch_crash_title")}</h3>
        <p>{this.props.t("ch_crash_sub")}</p>
        <code>{String(this.state.err?.message || this.state.err)}</code>
        <button className="ch-btn ch-btn-primary" onClick={() => window.location.reload()}>
          {this.props.t("ch_reload")}
        </button>
      </div>
    );
  }
}

/* ---------- helpers ---------- */
function Avatar({ initials, color, size = 42 }) {
  return (
    <div className="ch-av" style={{
      width: size, height: size, fontSize: Math.round(size * 0.36),
      borderRadius: Math.round(size * 0.3), background: AV[(color ?? 0) % 8],
    }}>{initials || "?"}</div>
  );
}

function timeOf(iso, lang) {
  const d = new Date(iso);
  return d.toLocaleTimeString(lang === "mn" ? "mn-MN" : "en-GB",
    { hour: "2-digit", minute: "2-digit" });
}

function dayLabel(iso, t, lang) {
  const d = new Date(iso), now = new Date();
  const dd = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const diff = Math.round((dd(now) - dd(d)) / 86400000);
  if (diff === 0) return t("ch_today");
  if (diff === 1) return t("ch_yesterday");
  return d.toLocaleDateString(lang === "mn" ? "mn-MN" : "en-GB",
    { month: "long", day: "numeric" });
}

function listStamp(iso, t, lang) {
  const d = new Date(iso), now = new Date();
  if (d.toDateString() === now.toDateString()) return timeOf(iso, lang);
  const diff = Math.round((now - d) / 86400000);
  if (diff <= 1) return t("ch_yesterday");
  return d.toLocaleDateString(lang === "mn" ? "mn-MN" : "en-GB",
    { month: "short", day: "numeric" });
}

/* ============================================================ */
function MessagesInner() {
  const { id: routeId } = useParams();
  const { lang, t } = useLang();
  const { user } = useAuth();
  const nav = useNavigate();

  const [convs, setConvs] = useState(null);
  const [activeId, setActiveId] = useState(routeId || null);
  const [msgs, setMsgs] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [query, setQuery] = useState("");
  const [loadErr, setLoadErr] = useState("");
  const endRef = useRef(null);
  const taRef = useRef(null);

  const loadConvs = useCallback(async () => {
    try { setConvs(await myConversations()); setLoadErr(""); }
    catch (e) { console.error("[LINKLEY myConversations]", e); setConvs([]); setLoadErr(e.message || "error"); }
  }, []);

  useEffect(() => { loadConvs(); }, [loadConvs]);
  useEffect(() => { if (routeId) setActiveId(routeId); }, [routeId]);

  useEffect(() => {
    if (!activeId && convs?.length && window.innerWidth > 880) setActiveId(convs[0].id);
  }, [convs, activeId]);

  useEffect(() => {
    if (!activeId) { setMsgs([]); return; }
    let alive = true;
    setLoadingThread(true);
    conversationMessages(activeId)
      .then((m) => alive && setMsgs(m))
      .catch((e) => { console.error("[LINKLEY thread]", e); alive && setMsgs([]); })
      .finally(() => alive && setLoadingThread(false));
    markRead(activeId).then(loadConvs).catch(() => {});
    return () => { alive = false; };
  }, [activeId, loadConvs]);

  useEffect(() => {
    if (!activeId) return;
    return subscribeToConversation(activeId, (row) => {
      setMsgs((prev) => prev.some((m) => m.id === row.id) ? prev : [...prev, row]);
      if (row.sender_id !== user?.id) markRead(activeId).catch(() => {});
    });
  }, [activeId, user]);

  useEffect(() => subscribeToAllMessages(() => loadConvs()), [loadConvs]);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [msgs, activeId]);

  const grow = (el) => { if (!el) return; el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 140) + "px"; };

  const send = async (e) => {
    e?.preventDefault();
    const body = draft.trim();
    if (!body || sending || !activeId) return;
    setDraft(""); grow(taRef.current); setSending(true);
    const temp = { id: "tmp" + Date.now(), body, created_at: new Date().toISOString(),
                   sender_id: user.id, pending: true };
    setMsgs((p) => [...p, temp]);
    try {
      const saved = await sendMessage(activeId, body);
      setMsgs((p) => p.map((m) => (m.id === temp.id ? { ...saved } : m)));
      loadConvs();
    } catch (e2) {
      console.error("[LINKLEY send]", e2);
      setMsgs((p) => p.map((m) => (m.id === temp.id ? { ...m, pending: false, failed: true } : m)));
      setDraft(body);
    } finally { setSending(false); }
  };

  const active = convs?.find((c) => c.id === activeId) || null;
  const nameOf = (c) => (c.kind === "project" ? c.title : c.other_name) || t("ch_untitled");
  const shown = (convs || []).filter((c) => {
    const q = query.trim().toLowerCase();
    return !q || nameOf(c).toLowerCase().includes(q) || (c.last_body || "").toLowerCase().includes(q);
  });
  const totalUnread = (convs || []).reduce((a, c) => a + (c.unread || 0), 0);

  return (
    <div className="ch-page">
      {/* page header — always visible, always has a way back */}
      <header className="ch-pagehead">
        <button className="ch-back" onClick={() => nav("/")}>← {t("ch_home")}</button>
        <h1>{t("ch_title")}</h1>
        {totalUnread > 0 && <span className="ch-count">{totalUnread}</span>}
        <div className="ch-spacer" />
        <button className="ch-btn ch-btn-ghost" onClick={() => nav("/browse")}>
          + {t("ch_new_chat")}
        </button>
      </header>

      <div className={"ch-wrap" + (activeId ? " ch-has-active" : "")}>
        {/* ---------- sidebar ---------- */}
        <aside className="ch-side">
          <div className="ch-search">
            <span>⌕</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={t("ch_search")} aria-label={t("ch_search")} />
            {query && <button onClick={() => setQuery("")} aria-label="clear">✕</button>}
          </div>

          <div className="ch-list">
            {convs === null ? (
              [0, 1, 2].map((i) => (
                <div className="ch-skel" key={i}>
                  <div className="ch-skel-av" />
                  <div className="ch-skel-lines"><i /><b /></div>
                </div>
              ))
            ) : loadErr ? (
              <div className="ch-note">
                <b>{t("ch_load_err")}</b>
                <code>{loadErr}</code>
                <button className="ch-btn ch-btn-ghost" onClick={loadConvs}>{t("ch_retry")}</button>
              </div>
            ) : shown.length === 0 ? (
              <div className="ch-note">
                <div className="ch-note-ico">✉</div>
                <b>{query ? t("ch_no_match") : t("ch_none_title")}</b>
                <p>{query ? t("ch_no_match_sub") : t("ch_none_sub")}</p>
                {!query && (
                  <button className="ch-btn ch-btn-primary" onClick={() => nav("/browse")}>
                    {t("ch_find_expert")}
                  </button>
                )}
              </div>
            ) : shown.map((c) => (
              <button key={c.id}
                className={"ch-row" + (c.id === activeId ? " on" : "") + (c.unread ? " unread" : "")}
                onClick={() => { setActiveId(c.id); nav("/messages/" + c.id, { replace: true }); }}>
                {c.kind === "project"
                  ? <div className="ch-av ch-av-proj">◪</div>
                  : <Avatar initials={c.other_initials} color={c.other_color} />}
                <div className="ch-row-mid">
                  <div className="ch-row-top">
                    <b>{nameOf(c)}</b>
                    <time>{listStamp(c.last_message_at, t, lang)}</time>
                  </div>
                  <p>
                    {c.last_sender === user?.id && <span className="ch-you">{t("ch_you")}: </span>}
                    {c.last_body || "…"}
                  </p>
                </div>
                {c.unread > 0 && <span className="ch-dot">{c.unread}</span>}
              </button>
            ))}
          </div>
        </aside>

        {/* ---------- thread ---------- */}
        <section className="ch-thread">
          {!active ? (
            <div className="ch-note ch-note-center">
              <div className="ch-note-ico">💬</div>
              <b>{convs?.length ? t("ch_pick") : t("ch_none_title")}</b>
              <p>{convs?.length ? t("ch_pick_sub") : t("ch_none_sub")}</p>
            </div>
          ) : (
            <>
              <header className="ch-head">
                <button className="ch-mback"
                  onClick={() => { setActiveId(null); nav("/messages", { replace: true }); }}
                  aria-label={t("back")}>←</button>
                {active.kind === "project"
                  ? <div className="ch-av ch-av-proj" style={{ width: 36, height: 36, fontSize: 15 }}>◪</div>
                  : <Avatar initials={active.other_initials} color={active.other_color} size={36} />}
                <div className="ch-head-txt">
                  <b>{nameOf(active)}</b>
                  <span>
                    {active.kind === "project" ? `${active.member_count} ${t("people")}`
                      : active.kind === "booking" ? t("ch_from_booking") : t("ch_direct")}
                  </span>
                </div>
                {active.kind === "project" && active.project_id && (
                  <button className="ch-btn ch-btn-ghost"
                    onClick={() => nav("/projects/" + active.project_id)}>{t("ch_open_project")}</button>
                )}
              </header>

              <div className="ch-msgs">
                {loadingThread && msgs.length === 0 ? (
                  <div className="ch-note ch-note-center"><p>{t("loading")}</p></div>
                ) : msgs.length === 0 ? (
                  <div className="ch-note ch-note-center"><p>{t("ch_empty_thread")}</p></div>
                ) : msgs.map((m, i) => {
                  const mine = m.sender_id === user?.id;
                  const prev = msgs[i - 1];
                  const newDay = !prev || dayLabel(prev.created_at, t, lang) !== dayLabel(m.created_at, t, lang);
                  const grouped = !newDay && prev && prev.sender_id === m.sender_id;
                  return (
                    <div key={m.id}>
                      {newDay && <div className="ch-day"><span>{dayLabel(m.created_at, t, lang)}</span></div>}
                      <div className={"ch-msg" + (mine ? " mine" : "") + (grouped ? " grouped" : "")}>
                        {!mine && (
                          <div className="ch-msg-av">
                            {!grouped && <Avatar initials={m.sender_initials} color={m.sender_color} size={28} />}
                          </div>
                        )}
                        <div className="ch-msg-col">
                          {!mine && !grouped && active.kind === "project" && (
                            <div className="ch-msg-name">{m.sender_name}</div>
                          )}
                          <div className={"ch-bub" + (m.pending ? " pending" : "") + (m.failed ? " failed" : "")}>
                            <span>{m.body}</span>
                            <time>{m.failed ? t("ch_failed") : timeOf(m.created_at, lang)}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>

              <form className="ch-form" onSubmit={send}>
                <textarea ref={taRef} value={draft} rows={1}
                  onChange={(e) => { setDraft(e.target.value); grow(e.target); }}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(e); } }}
                  placeholder={t("ch_placeholder")} maxLength={4000} />
                <button className="ch-btn ch-btn-primary ch-send" disabled={!draft.trim() || sending}>
                  {sending ? "…" : t("ch_send")}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default function Messages() {
  const { t } = useLang();
  return <Boundary t={t}><MessagesInner /></Boundary>;
}
