/* Header link with a live unread badge. */
import { useEffect, useState, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { useLang } from "../lib/i18n.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { unreadTotal, subscribeToAllMessages } from "../lib/chat.js";

export default function MessagesLink() {
  const { t } = useLang();
  const { user } = useAuth();
  const [n, setN] = useState(0);

  const refresh = useCallback(() => {
    if (!user) { setN(0); return; }
    unreadTotal().then(setN);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!user) return;
    const off = subscribeToAllMessages(() => refresh());
    const timer = setInterval(refresh, 60000);   // safety net if the socket drops
    return () => { off(); clearInterval(timer); };
  }, [user, refresh]);

  if (!user) return null;

  return (
    <NavLink to="/messages" className={({ isActive }) => "chnav" + (isActive ? " active" : "")}>
      {t("ch_title")}
      {n > 0 && <span className="chnav-badge">{n > 9 ? "9+" : n}</span>}
    </NavLink>
  );
}
