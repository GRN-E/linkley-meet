/* ============================================================
   LINKLEY — profile photo upload
   Files live at  avatars/<user-id>/<timestamp>.jpg
   Storage policy only allows writing inside your own uid folder.
   ============================================================ */
import { supabase } from "./supabase";

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;   // 2 MB, matches the bucket limit
const OUTPUT_SIZE = 512;                            // square, plenty for a 104px avatar

/**
 * Downscale and centre-crop to a square JPEG before uploading.
 * A phone photo is 4 MB and 4000px wide; sending that raw would blow the
 * bucket limit and make every card slow to paint.
 */
export function squareJpeg(file, size = OUTPUT_SIZE) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const ctx = c.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error("ENCODE_FAILED"))), "image/jpeg", 0.86);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("BAD_IMAGE")); };
    img.src = url;
  });
}

/** Upload, write the public URL onto profiles, return the URL. */
export async function uploadAvatar(userId, file) {
  if (!userId) throw new Error("NOT_AUTHENTICATED");
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("BAD_TYPE");
  if (file.size > 12 * 1024 * 1024) throw new Error("TOO_BIG");

  const blob = await squareJpeg(file);
  if (blob.size > MAX_UPLOAD_BYTES) throw new Error("TOO_BIG");

  const path = `${userId}/${Date.now()}.jpg`;
  const { error: upErr } = await supabase.storage
    .from("avatars")
    .upload(path, blob, { contentType: "image/jpeg", upsert: true, cacheControl: "3600" });
  if (upErr) throw upErr;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  const url = data.publicUrl;

  const { error: pErr } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
  if (pErr) throw pErr;

  removeOldAvatars(userId, path);      // fire and forget, never blocks the save
  return url;
}

export async function removeAvatar(userId) {
  const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", userId);
  if (error) throw error;
  removeOldAvatars(userId, null);
}

/** Keep the bucket tidy: delete every file in the user's folder except the current one. */
async function removeOldAvatars(userId, keepPath) {
  try {
    const { data } = await supabase.storage.from("avatars").list(userId, { limit: 100 });
    const stale = (data || [])
      .map((f) => `${userId}/${f.name}`)
      .filter((p) => p !== keepPath);
    if (stale.length) await supabase.storage.from("avatars").remove(stale);
  } catch { /* tidying is best-effort */ }
}

export function avatarErrorKey(err) {
  const m = String(err?.message || "");
  if (m.includes("BAD_TYPE"))  return "av_err_type";
  if (m.includes("TOO_BIG"))   return "av_err_size";
  if (m.includes("BAD_IMAGE")) return "av_err_read";
  return "err_generic";
}
