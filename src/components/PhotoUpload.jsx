import { useRef, useState } from "react";
import { useLang } from "../lib/i18n.js";
import { uploadAvatar, removeAvatar, avatarErrorKey } from "../lib/avatar.js";
import Avatar from "./Avatar.jsx";

export default function PhotoUpload({ userId, url, initials, color, onChange }) {
  const { t } = useLang();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";                    // let the same file be re-picked after an error
    if (!file) return;
    setErr(""); setBusy(true);
    try {
      const next = await uploadAvatar(userId, file);
      onChange?.(next);
    } catch (ex) {
      setErr(t(avatarErrorKey(ex)));
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    setErr(""); setBusy(true);
    try { await removeAvatar(userId); onChange?.(null); }
    catch (ex) { setErr(t(avatarErrorKey(ex))); }
    finally { setBusy(false); }
  };

  return (
    <div className="photoup">
      <div className={"photoup-frame" + (busy ? " is-busy" : "")}>
        <Avatar url={url} initials={initials} color={color} size={96} />
        {busy && <div className="photoup-spin"><div className="spinner spinner-sm" /></div>}
      </div>

      <div className="photoup-side">
        <div className="photoup-btns">
          <button type="button" className="btn btn-ghost btn-sm" disabled={busy}
                  onClick={() => input.current?.click()}>
            {url ? t("av_change") : t("av_upload")}
          </button>
          {url && (
            <button type="button" className="btn btn-ghost btn-sm photoup-del" disabled={busy} onClick={clear}>
              {t("av_remove")}
            </button>
          )}
        </div>
        <p className="photoup-hint">{t("av_hint")}</p>
        {err && <p className="err-text">{err}</p>}
      </div>

      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp"
             onChange={pick} hidden />
    </div>
  );
}
