import { createContext, useContext, useState, useCallback } from "react";

export const AVATAR_COLORS = ["#2563EB","#7C3AED","#DB2777","#059669","#D97706","#0891B2","#DC2626","#4F46E5"];
export const PACKS = [
  { pts: 100,  price: "5,000₮" },
  { pts: 300,  price: "14,000₮", pop: true },
  { pts: 1000, price: "44,000₮" },
];
export const SLOTS = ["09:00","10:30","13:00","14:30","16:00","18:00"];
export const CATEGORIES = [
  { id: "business",  mn: "Бизнес",     en: "Business",  emoji: "💼" },
  { id: "law",       mn: "Хууль",      en: "Law",       emoji: "⚖️" },
  { id: "finance",   mn: "Санхүү",     en: "Finance",   emoji: "📈" },
  { id: "tech",      mn: "Технологи",  en: "Tech",      emoji: "💻" },
  { id: "marketing", mn: "Маркетинг",  en: "Marketing", emoji: "📣" },
  { id: "career",    mn: "Карьер",     en: "Career",    emoji: "🎯" },
  { id: "health",    mn: "Эрүүл мэнд", en: "Health",    emoji: "🩺" },
  { id: "education", mn: "Боловсрол",  en: "Education", emoji: "🎓" },
];
export const fmt = (n) => Number(n || 0).toLocaleString("en-US");

const ToastCtx = createContext(null);
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, kind = "") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-wrap">
        {toasts.map((t) => <div key={t.id} className={"toast " + t.kind}>{t.msg}</div>)}
      </div>
    </ToastCtx.Provider>
  );
}
export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast within ToastProvider");
  return ctx;
}
