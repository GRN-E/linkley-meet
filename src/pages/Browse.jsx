import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLang } from "../lib/i18n.js";
import { AVATAR_COLORS, CATEGORIES, fmt } from "../lib/ui.jsx";
import {
  searchExperts, filtersFromParams, paramsFromFilters, EMPTY_FILTERS,
} from "../lib/experts.js";
import ExpertSearchBar from "../components/ExpertSearchBar.jsx";
import ExpertFilters from "../components/ExpertFilters.jsx";

const PAGE = 12;

function ExpertCard({ e, onOpen }) {
  const { lang, t } = useLang();
  const role = lang === "mn" ? e.headline_mn : e.headline_en;
  const bio = lang === "mn" ? e.bio_mn : e.bio_en;
  const cats = (e.categories || []).map((id) => CATEGORIES.find((c) => c.id === id)).filter(Boolean);
  return (
    <article className="card expert-card excard" onClick={onOpen}>
      <div className="expert-top">
        <div className="avatar" style={{ background: AVATAR_COLORS[(e.avatar_color ?? 0) % 8] }}>
          {e.avatar_initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <h3>{e.full_name}</h3>
          <div className="expert-role">{role}</div>
          <div className="rating">
            <span className="star">★</span>{Number(e.rating).toFixed(1)}
            <span className="count">({e.reviews_count})</span>
            <span className="excard-dot">·</span>
            <span className="count">{e.sessions_count} {t("completed").toLowerCase()}</span>
          </div>
        </div>
      </div>

      <p className="expert-bio">{bio}</p>

      {e.skills?.length > 0 && (
        <div className="tag-row">
          {e.skills.slice(0, 4).map((s) => <span className="pill pill-gray" key={s}>{s}</span>)}
          {e.skills.length > 4 && <span className="pill pill-gray">+{e.skills.length - 4}</span>}
        </div>
      )}

      <div className="excard-meta">
        {cats.slice(0, 2).map((c) => (
          <span key={c.id}>{c.emoji} {lang === "mn" ? c.mn : c.en}</span>
        ))}
        <span>⏱ ~{e.response_mins} {t("mins")}</span>
      </div>

      <div className="expert-foot">
        <div className="expert-price">
          <b>₮{fmt(e.fee_mnt)}</b>
          <span>{t("per_session")} · {lang === "mn" ? "эсвэл" : "or"} {e.student_points} {t("points")}</span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={(ev) => { ev.stopPropagation(); onOpen(); }}>
          {t("view_profile")}
        </button>
      </div>
    </article>
  );
}

export default function Browse() {
  const { t } = useLang();
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const [filters, setFilters] = useState(() => filtersFromParams(sp));
  const [rows, setRows] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sheet, setSheet] = useState(false);
  const reqId = useRef(0);

  useEffect(() => { setSp(paramsFromFilters(filters), { replace: true }); }, [filters]); // eslint-disable-line

  const run = useCallback(async (f, pageN) => {
    const id = ++reqId.current;
    setLoading(true);
    try {
      const { rows: r, total: tot } = await searchExperts(f, { limit: PAGE, offset: pageN * PAGE });
      if (id !== reqId.current) return;                 // drop stale responses
      setRows(pageN === 0 ? r : (prev) => [...(prev || []), ...r]);
      setTotal(tot);
    } catch {
      if (id === reqId.current) { setRows([]); setTotal(0); }
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, []);

  useEffect(() => { setPage(0); run(filters, 0); }, [filters, run]);

  return (
    <section className="section fade-in">
      <div className="container">
        <div className="phead">
          <div>
            <h2 className="phead-title">{t("browse_title")}</h2>
            <p className="muted">{t("ex_sub")}</p>
          </div>
        </div>

        <ExpertSearchBar filters={filters} onChange={setFilters} total={total}
          onOpenFilters={() => setSheet(true)} />

        <div className="exlayout">
          <ExpertFilters filters={filters} onChange={setFilters}
            open={sheet} onClose={() => setSheet(false)} />

          <div className="exresults">
            {rows === null ? (
              <div className="spinner" />
            ) : rows.length === 0 ? (
              <div className="card pempty">
                <div className="pempty-ico">⌕</div>
                <h3>{t("ex_none_title")}</h3>
                <p className="muted">{t("ex_none_sub")}</p>
                <button className="btn btn-ghost mt-s" onClick={() => setFilters({ ...EMPTY_FILTERS })}>
                  {t("pj_reset")}
                </button>
              </div>
            ) : (
              <>
                <div className="grid exgrid">
                  {rows.map((e) => (
                    <ExpertCard key={e.id} e={e} onOpen={() => nav("/expert/" + e.id)} />
                  ))}
                </div>
                {rows.length < total && (
                  <div className="center mt-l">
                    <button className="btn btn-ghost" disabled={loading} onClick={() => { const n = page + 1; setPage(n); run(filters, n); }}>
                      {loading ? "…" : t("pj_load_more")}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
