import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLang } from "../lib/i18n.js";
import {
  searchExperts, filtersFromParams, paramsFromFilters, EMPTY_FILTERS,
} from "../lib/experts.js";
import ExpertSearchBar from "../components/ExpertSearchBar.jsx";
import ExpertFilters from "../components/ExpertFilters.jsx";
import ExpertCard from "../components/ExpertCard.jsx";
import StartChatModal from "../components/StartChatModal.jsx";

const PAGE = 12;


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
  const [chatWith, setChatWith] = useState(null);
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
                    <ExpertCard key={e.id} e={e} onOpen={() => nav("/expert/" + e.id)}
                      onMessage={setChatWith} />
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
      {chatWith && <StartChatModal expert={chatWith} onClose={() => setChatWith(null)} />}
    </section>
  );
}
