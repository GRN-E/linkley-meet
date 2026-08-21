/* The guide used to be unreachable once dismissed. This puts it back
   within one click, from anywhere, for as long as the person needs it. */
import { useState } from "react";
import { useLang } from "../lib/i18n.js";
import { useAuth } from "../lib/AuthContext.jsx";
import Onboarding from "./Onboarding.jsx";

export default function HelpButton() {
  const { t } = useLang();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  if (!user) return null;

  return (
    <>
      <button className="helpbtn" onClick={() => setOpen(true)}
              aria-label={t("g_reopen")} title={t("g_reopen")}>
        ?
      </button>
      {open && <Onboarding force onClose={() => setOpen(false)} />}
    </>
  );
}
