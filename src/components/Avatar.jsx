import { AVATAR_COLORS } from "../lib/ui.jsx";

/**
 * One avatar for the whole site. Shows the uploaded photo when there is one,
 * falls back to coloured initials when there is not, and falls back again if
 * the image 404s — a deleted file should never leave a broken icon on the page.
 */
export default function Avatar({ url, initials, color = 0, size = 44, radius, className = "" }) {
  const style = {
    width: size, height: size, borderRadius: radius ?? "50%", flex: "none",
    display: "grid", placeItems: "center", overflow: "hidden",
  };

  if (url) {
    return (
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        className={"av-img " + className}
        style={{ ...style, objectFit: "cover" }}
        onError={(e) => { e.currentTarget.replaceWith(Object.assign(document.createElement("div"), {
          className: "av-fallback",
          textContent: initials || "?",
        })); }}
      />
    );
  }

  return (
    <div
      className={"av-fallback " + className}
      aria-hidden="true"
      style={{
        ...style,
        background: AVATAR_COLORS[(color ?? 0) % 8],
        color: "#fff",
        fontWeight: 800,
        fontSize: Math.round(size * 0.36),
        letterSpacing: ".5px",
      }}
    >
      {initials || "?"}
    </div>
  );
}
