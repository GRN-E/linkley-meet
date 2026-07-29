import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLang } from "../lib/i18n.js";
import { useAuth } from "../lib/AuthContext.jsx";
import {
  searchProjects, projectFiltersFromParams, projectParamsFromFilters,
  EMPTY_PROJECT_FILTERS,
} from "../lib/projects.js";
import ProjectSearchBar from "../components/ProjectSearchBar.jsx";
import ProjectFilters from "../components/ProjectFilters.jsx";
import ProjectCard from "../components/ProjectCard.jsx";

const PAGE = 12;

export default function Projects() {
  const { t } = useLang();
  const { profile } = useAuth();
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const [filters, setFilters] = useState(() => projectFiltersFromParams(sp));
  const [rows, setRows] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sheet, setSheet] = useState(false);
  const reqId = useRef(0);

  // keep the URL shareable
  useEffect(() => { setSp(projectParamsFromFilters(filters), { replace: true }); }, [filters]); // eslint-disable-line

  const run = useCallback(async (f, pageN) => {
    const id = ++reqId.current;
    setLoading(true);
    try {
      const { rows: r, total: tot } = await searchProjects(f, { limit: PAGE, offset: pageN * PAGE });
      if (id !== reqId.current) return;              // drop stale responses
      setRows(pageN === 0 ? r : (prev) => [...(prev || []), ...r]);
      setTotal(tot);
    } catch {
      if (id === reqId.current) { setRows([]); setTotal(0); }
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, []);

  useEffect(() => { setPage(0); run(filters, 0); }, [filters, run]);

  const canCreate = profile?.role === "expert";

  return (
    <section className="section fade-in">
      <div className="container">
        <div className="phead">
          <div>
            <h2 className="phead-title">{t("pj_title")}</h2>
            <p className="muted">{t("pj_sub")}</p>
          </div>
          {canCreate ? (
            <button className="btn btn-primary" onClick={() => nav("/projects/new")}>
              + {t("pj_create")}
            </button>
          ) : (
            <span className="pill pill-gray phead-hint">{t("pj_expert_only_hint")}</span>
          )}
        </div>

        <ProjectSearchBar filters={filters} onChange={setFilters} total={total}
          onOpenFilters={() => setSheet(true)} />

        <div className="exlayout">
          <ProjectFilters filters={filters} onChange={setFilters}
            open={sheet} onClose={() => setSheet(false)} />

          <div className="exresults">
            {rows === null ? (
              <div className="spinner" />
            ) : rows.length === 0 ? (
              <div className="card pempty">
                <div className="pempty-ico">⌕</div>
                <h3>{t("pj_none_title")}</h3>
                <p className="muted">{t("pj_none_sub")}</p>
                <button className="btn btn-ghost mt-s"
                  onClick={() => setFilters({ ...EMPTY_PROJECT_FILTERS })}>
                  {t("pj_reset")}
                </button>
              </div>
            ) : (
              <>
                <div className="grid exgrid">
                  {rows.map((p) => <ProjectCard key={p.id} p={p} />)}
                </div>
                {rows.length < total && (
                  <div className="center mt-l">
                    <button className="btn btn-ghost" disabled={loading}
                      onClick={() => { const n = page + 1; setPage(n); run(filters, n); }}>
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
