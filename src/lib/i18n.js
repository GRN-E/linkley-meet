import { PROJECT_I18N } from "./i18n.projects.js";
import { PROJECT_I18N_2 } from "./i18n.projects2.js";
import { EXPERT_I18N } from "./i18n.experts.js";
import { EXPERT_PROFILE_I18N } from "./i18n.expertProfile.js";
import { AUTH_I18N } from "./i18n.auth.js";
import { CHAT_I18N } from "./i18n.chat.js";
import { HOME_I18N } from "./i18n.home.js";
import { V2_I18N } from "./i18n.v2.js";
import { GUIDE_I18N } from "./i18n.guide.js";
import { createContext, useContext, useState, useCallback, createElement } from "react";

export const I18N = {
  mn: {
    nav_browse: "Мэргэжилтэн хайх", nav_how: "Хэрхэн ажилладаг", nav_points: "Point багц",
    nav_dashboard: "Хяналтын самбар", login: "Нэвтрэх", signup: "Бүртгүүлэх", logout: "Гарах", points: "point",
    hero_title_a: "Мэргэжлийн зөвлөгөөг ", hero_title_em: "point-оор", hero_title_b: " захиалаарай",
    hero_sub: "LINKLEY бол point дээр суурилсан зөвлөгөөний зах зээл. Point худалдаж аваад, мэргэжилтэнтэй цаг товлож уулзана. Яаралтай бол илүү point тавьж дараалалд түрүүлээрэй.",
    hero_cta1: "Мэргэжилтэн хайх", hero_cta2: "Бүртгүүлж эхлэх",
    stat_experts: "Баталгаажсан мэргэжилтэн", stat_sessions: "Хийгдсэн уулзалт",
    stat_bonus: "Мэргэжилтнүүдэд олгосон бонус", stat_rating: "Дундаж үнэлгээ",
    feat_eyebrow: "Үндсэн боломжууд", feat_title: "LINKLEY юу хийж чадах вэ", feat_sub: "Санааг тань бүрэн бүтэн функц болгосон.",
    f1_t: "Point түрийвч", f1_d: "100 point = 5,000₮. Point-оороо цаг товлоно. Нэг хүсэлт = 10 point.",
    f2_t: "Оюутны зөвлөгөө", f2_d: "Зөвхөн point хэрэглэдэг богино (15-30 мин) уулзалт. Уулзсан хүнд гэрчилгээ олгоно.",
    f3_t: "Мэргэжлийн зөвлөгөө", f3_d: "Хүсэлт явуулахад point шаардана. Уулзалтын үнийг мэргэжилтэн өөрөө тогтооно.",
    f4_t: "Point bid / дараалал", f4_d: "Яаралтай бол илүү point тавьж bid хийнэ. Илүү өгсөн хүн эхэнд гарна.",
    f5_t: "Хамтын ажиллагаа", f5_d: "Зөвхөн уулзалт биш, төсөл дээр хамтарч ажиллах санал тавьна.",
    f6_t: "Мэргэжилтний хяналт", f6_d: "Мэргэжилтэн эхний хэдэн хүнтэй уулзаад зогсохоо өөрөө шийднэ.",
    f7_t: "70% бонус", f7_d: "Point орлогын 70%-ийг мэргэжилтнүүдэд олгоно. 30% нь хөгжүүлэлтэд.",
    f8_t: "Үнэлгээ ба сэтгэгдэл", f8_d: "Уулзалт бүрийн дараа үнэлгээ өгнө. Итгэлцлийг ил тод хэмжинэ.",
    how_eyebrow: "Хэрхэн ажилладаг", how_title: "4 алхмаар зөвлөгөө аваарай",
    s1_t: "Бүртгүүл", s1_d: "Бүртгүүлээд 50 point бэлэгээр ав.",
    s2_t: "Мэргэжилтэн сонго", s2_d: "Ангилал, үнэлгээгээр хайж хэрэгтэй хүнээ ол.",
    s3_t: "Цаг товло / bid хий", s3_d: "Цаг сонгоод point зарцуул. Яаралтай бол илүү point тавь.",
    s4_t: "Уулз ба үнэл", s4_d: "Видео дуудлагаар уулзаад үнэлгээ өг, гэрчилгээ ав.",
    price_eyebrow: "Point багц", price_title: "Хэрэгцээндээ тохирсон багц", price_sub: "100 point = 5,000₮. Point хугацаа дуусахгүй.",
    price_buy: "Худалдаж авах", pop: "Түгээмэл", per_req: "≈ {n} хүсэлт",
    browse_title: "Мэргэжилтэн хайх", browse_sub: "Ангиллаар шүүж хэрэгтэй мэргэжилтнээ ол.",
    search_ph: "Нэр, мэргэжил, түлхүүр үгээр хай…", cat_all: "Бүгд", view_profile: "Профайл үзэх",
    from: "эхлэх", per_session: "уулзалт бүрт", no_results: "Илэрц олдсонгүй.",
    loading: "Уншиж байна…",
    book_now: "Цаг товлох", propose_collab: "Хамтран ажиллах санал", about: "Танилцуулга", reviews: "Сэтгэгдэл",
    completed: "Уулзалт", exp_years: "Туршлага", response: "Хариу өгөх", yrs: "жил", mins: "мин", no_reviews: "Одоогоор сэтгэгдэл алга.",
    book_title: "Уулзалт товлох", step_type: "Уулзалтын төрөл", step_time: "Цаг сонгох", step_bid: "Point / bid", step_pay: "Баталгаажуулах",
    type_student: "Оюутны зөвлөгөө", type_student_d: "15-30 мин · зөвхөн point · гэрчилгээтэй",
    type_pro: "Мэргэжлийн зөвлөгөө", type_pro_d: "Бүрэн уулзалт · point + мэргэжилтний үнэ",
    pick_slot: "Боломжит цаг", bid_label: "Point bid (дараалалд түрүүлэх)", bid_hint: "Бааз хүсэлт 10 point. Илүү нэмбэл дараалалд дээшилнэ.",
    msg_label: "Мэргэжилтэнд илгээх зурвас", msg_ph: "Юун талаар зөвлөгөө авахыг хүсэж байгаагаа бичнэ үү…",
    next: "Үргэлжлүүлэх", back: "Буцах", confirm: "Баталгаажуулах",
    sum_type: "Төрөл", sum_expert: "Мэргэжилтэн", sum_slot: "Цаг", sum_base: "Бааз хүсэлт", sum_bid: "Нэмэлт bid", sum_fee: "Мэргэжилтний үнэ",
    sum_total: "Нийт point", booked_ok: "Амжилттай товлолоо! 🎉", balance: "Таны үлдэгдэл",
    dash_client: "Миний самбар", dash_expert: "Мэргэжилтний самбар",
    tab_upcoming: "Товлосон уулзалт", tab_history: "Түүх", tab_certs: "Гэрчилгээ", tab_wallet: "Түрийвч",
    tab_requests: "Ирсэн хүсэлт", tab_earnings: "Орлого ба бонус", tab_settings: "Тохиргоо",
    m_balance: "Point үлдэгдэл", m_sessions: "Нийт уулзалт", m_certs: "Гэрчилгээ", m_spent: "Зарцуулсан point",
    join_call: "Дуудлагад нэгдэх", leave_review: "Үнэлгээ өгөх", rated: "Үнэлсэн", no_upcoming: "Товлосон уулзалт алга.", no_history: "Түүх хоосон байна.",
    m_pending: "Хүлээгдэж буй", m_income: "Тооцоолсон орлого", m_rating2: "Үнэлгээ",
    accept: "Хүлээн авах", decline: "Татгалзах", no_requests: "Шинэ хүсэлт алга.",
    bonus_title: "Таны бонус сан (70%)", bonus_note: "LINKLEY point орлогынхоо 70%-ийг мэргэжилтнүүдэд бонусаар тараана.",
    withdraw: "Татан авах", limit_title: "Уулзалтын хязгаар", limit_note: "Хэдэн хүнтэй уулзсаны дараа хүсэлт зогсоохоо тохируул.",
    limit_current: "Одоогийн хязгаар", people: "хүн", save: "Хадгалах", saved: "Хадгаллаа",
    review_title: "Уулзалтаа үнэлэх", review_sub: "{name}-тэй хийсэн уулзалт ямар байсан бэ?", review_ph: "Сэтгэгдлээ бичнэ үү…",
    submit_review: "Үнэлгээ илгээх", review_ok: "Үнэлгээ илгээгдлээ. Баярлалаа!",
    cert_head: "Талархлын гэрчилгээ", cert_body: "Энэхүү гэрчилгээг LINKLEY платформ дээр оюутны зөвлөгөө авсан {name}-д гардуулав.",
    cert_issued: "Огноо", cert_id: "Дугаар", download_cert: "Гэрчилгээ хэвлэх/татах", my_certs: "Миний гэрчилгээ",
    call_title: "Видео зөвлөгөө", call_with: "-тэй уулзаж байна", call_end: "Уулзалт дуусгах", call_loading: "Өрөө ачаалж байна…",
    auth_welcome: "LINKLEY-д тавтай морил", auth_sub: "Бүртгүүлээд эхний 50 point бэлэгээр аваарай.",
    role_client: "Зөвлөгөө авах", role_expert: "Зөвлөгөө өгөх", name_label: "Нэр", email_label: "И-мэйл", pass_label: "Нууц үг",
    create_acc: "Бүртгэл үүсгэх", have_acc: "Бүртгэлтэй юу? Нэвтрэх", no_acc: "Шинээр бүртгүүлэх", signin: "Нэвтрэх",
    buy_title: "Point цэнэглэх", buy_ok: "{n} point нэмэгдлээ!", insufficient: "Point хүрэлцэхгүй. Цэнэглэнэ үү.",
    sandbox_note: "Туршилтын горим: QPay холбогдоогүй тул төлбөр симуляци хийгдэнэ.",
    foot_tag: "Point дээр суурилсан зөвлөгөөний зах зээл.", foot_product: "Бүтээгдэхүүн", foot_company: "Компани", foot_support: "Тусламж", foot_rights: "Бүх эрх хуулиар хамгаалагдсан.",
    err_generic: "Алдаа гарлаа. Дахин оролдоно уу.",
  },
  en: {
    nav_browse: "Find experts", nav_how: "How it works", nav_points: "Point packs",
    nav_dashboard: "Dashboard", login: "Log in", signup: "Sign up", logout: "Log out", points: "pts",
    hero_title_a: "Book expert advice with ", hero_title_em: "points", hero_title_b: "",
    hero_sub: "LINKLEY is a points-based advice marketplace. Buy points, book a session with an expert, and if you're in a hurry, bid more points to jump the queue.",
    hero_cta1: "Find experts", hero_cta2: "Sign up to start",
    stat_experts: "Verified experts", stat_sessions: "Sessions completed",
    stat_bonus: "Paid to experts as bonus", stat_rating: "Average rating",
    feat_eyebrow: "Core features", feat_title: "What LINKLEY can do", feat_sub: "Your idea, built into a complete product.",
    f1_t: "Points wallet", f1_d: "100 pts = 5,000₮. Spend points to book. One request = 10 points.",
    f2_t: "Student advice", f2_d: "Cheap, short (15-30 min) points-only sessions. Each earns a certificate.",
    f3_t: "Professional advice", f3_d: "A request costs points; the expert sets the meeting fee.",
    f4_t: "Point bidding / queue", f4_d: "Bid extra points to rank higher. Highest bidder appears first.",
    f5_t: "Collaboration offers", f5_d: "Beyond meetings. Propose working together on a project.",
    f6_t: "Expert control", f6_d: "Experts decide to stop after meeting the first few people.",
    f7_t: "70% bonus payout", f7_d: "70% of point revenue is paid to experts as a bonus. 30% funds the platform.",
    f8_t: "Ratings & reviews", f8_d: "Rate every session. Trust measured with a transparent score.",
    how_eyebrow: "How it works", how_title: "Get advice in 4 steps",
    s1_t: "Sign up", s1_d: "Create an account and get 50 points free.",
    s2_t: "Choose an expert", s2_d: "Search by category and rating to find the right person.",
    s3_t: "Book / bid", s3_d: "Pick a slot and spend points. In a hurry? Bid more.",
    s4_t: "Meet & rate", s4_d: "Meet over video, leave a rating, earn a certificate.",
    price_eyebrow: "Point packs", price_title: "Choose a pack that fits", price_sub: "100 points = 5,000₮. Points never expire.",
    price_buy: "Buy pack", pop: "Popular", per_req: "≈ {n} requests",
    browse_title: "Find experts", browse_sub: "Filter by category to find the right expert.",
    search_ph: "Search by name, field, or keyword…", cat_all: "All", view_profile: "View profile",
    from: "from", per_session: "per session", no_results: "No results.",
    loading: "Loading…",
    book_now: "Book a session", propose_collab: "Propose collaboration", about: "About", reviews: "Reviews",
    completed: "Sessions", exp_years: "Experience", response: "Responds in", yrs: "yrs", mins: "min", no_reviews: "No reviews yet.",
    book_title: "Book a session", step_type: "Session type", step_time: "Pick a time", step_bid: "Points / bid", step_pay: "Confirm",
    type_student: "Student advice", type_student_d: "15-30 min · points only · certificate",
    type_pro: "Professional advice", type_pro_d: "Full session · points + expert fee",
    pick_slot: "Available slots", bid_label: "Point bid (jump the queue)", bid_hint: "Base request is 10 points. Add more to climb the queue.",
    msg_label: "Message to the expert", msg_ph: "Tell them what you'd like advice on…",
    next: "Continue", back: "Back", confirm: "Confirm booking",
    sum_type: "Type", sum_expert: "Expert", sum_slot: "Slot", sum_base: "Base request", sum_bid: "Extra bid", sum_fee: "Expert fee",
    sum_total: "Total points", booked_ok: "Booked successfully! 🎉", balance: "Your balance",
    dash_client: "My dashboard", dash_expert: "Expert dashboard",
    tab_upcoming: "Upcoming", tab_history: "History", tab_certs: "Certificates", tab_wallet: "Wallet",
    tab_requests: "Requests", tab_earnings: "Earnings & bonus", tab_settings: "Settings",
    m_balance: "Point balance", m_sessions: "Total sessions", m_certs: "Certificates", m_spent: "Points spent",
    join_call: "Join call", leave_review: "Rate session", rated: "Rated", no_upcoming: "No upcoming sessions.", no_history: "No history yet.",
    m_pending: "Pending", m_income: "Estimated income", m_rating2: "Rating",
    accept: "Accept", decline: "Decline", no_requests: "No new requests.",
    bonus_title: "Your bonus pool (70%)", bonus_note: "LINKLEY pays 70% of point revenue to experts as a bonus.",
    withdraw: "Withdraw", limit_title: "Session limit", limit_note: "Set how many people you'll meet before pausing requests.",
    limit_current: "Current limit", people: "people", save: "Save", saved: "Saved",
    review_title: "Rate your session", review_sub: "How was your session with {name}?", review_ph: "Write your review…",
    submit_review: "Submit review", review_ok: "Review submitted. Thank you!",
    cert_head: "Certificate of Appreciation", cert_body: "This certificate is presented to {name} for taking part in student advice on the LINKLEY platform.",
    cert_issued: "Date", cert_id: "ID", download_cert: "Print / download certificate", my_certs: "My certificates",
    call_title: "Video consultation", call_with: "In session with", call_end: "End session", call_loading: "Loading room…",
    auth_welcome: "Welcome to LINKLEY", auth_sub: "Sign up and get your first 50 points free.",
    role_client: "Get advice", role_expert: "Give advice", name_label: "Name", email_label: "Email", pass_label: "Password",
    create_acc: "Create account", have_acc: "Have an account? Log in", no_acc: "Create a new account", signin: "Log in",
    buy_title: "Top up points", buy_ok: "{n} points added!", insufficient: "Not enough points. Please top up.",
    sandbox_note: "Test mode: QPay isn't connected yet, so payment is simulated.",
    foot_tag: "A points-based advice marketplace.", foot_product: "Product", foot_company: "Company", foot_support: "Support", foot_rights: "All rights reserved.",
    err_generic: "Something went wrong. Please try again.",
  },
};


Object.assign(I18N.mn, PROJECT_I18N.mn);      Object.assign(I18N.en, PROJECT_I18N.en);
Object.assign(I18N.mn, PROJECT_I18N_2.mn);     Object.assign(I18N.en, PROJECT_I18N_2.en);
Object.assign(I18N.mn, EXPERT_I18N.mn);       Object.assign(I18N.en, EXPERT_I18N.en);
Object.assign(I18N.mn, EXPERT_PROFILE_I18N.mn); Object.assign(I18N.en, EXPERT_PROFILE_I18N.en);
Object.assign(I18N.mn, AUTH_I18N.mn);         Object.assign(I18N.en, AUTH_I18N.en);
Object.assign(I18N.mn, CHAT_I18N.mn);         Object.assign(I18N.en, CHAT_I18N.en);
// HOME_I18N must stay LAST — it intentionally overrides older hero/how/stat strings
Object.assign(I18N.mn, HOME_I18N.mn);         Object.assign(I18N.en, HOME_I18N.en);
// V2 last: overrides a few project strings now that funding is gone
Object.assign(I18N.mn, V2_I18N.mn);           Object.assign(I18N.en, V2_I18N.en);
Object.assign(I18N.mn, GUIDE_I18N.mn);        Object.assign(I18N.en, GUIDE_I18N.en);

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("linkley_lang") || "mn");
  const change = useCallback((l) => { setLang(l); localStorage.setItem("linkley_lang", l); }, []);
  const t = useCallback((key, vars) => {
    let s = (I18N[lang] && I18N[lang][key]) || key;
    if (vars) for (const k in vars) s = s.replace(`{${k}}`, vars[k]);
    return s;
  }, [lang]);
  return createElement(LangContext.Provider, { value: { lang, setLang: change, t } }, children);
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
