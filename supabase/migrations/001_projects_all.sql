-- ============================================================================
-- LINKLEY · Projects & Collaboration — complete schema
-- ALREADY APPLIED to project ref zzjkxopeniecfgapanyu.
-- Kept in version control; run top-to-bottom only on a NEW Supabase project.
-- ============================================================================

create extension if not exists pg_trgm;

-- ── company role ────────────────────────────────────────────────────────────
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('client','expert','company'));

create table if not exists public.companies (
  id uuid primary key references public.profiles(id) on delete cascade,
  company_name text not null,
  website text,
  about_mn text, about_en text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── tables ──────────────────────────────────────────────────────────────────
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  summary text,
  description text,
  category_id text references public.categories(id),
  status text not null default 'open'
    check (status in ('open','in_progress','completed','archived')),
  looking_for text[] not null default '{}',
  tags text[] not null default '{}',
  funding_goal_mnt int not null default 0,
  funded_mnt int not null default 0,
  cover_color int not null default 0,
  members_count int not null default 1,
  requests_count int not null default 0,
  search_text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_members (
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null default 'collaborator' check (role in ('owner','collaborator')),
  joined_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table if not exists public.project_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  message text,
  points_spent int not null default 10,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  unique (project_id, sender_id)
);

create table if not exists public.project_funding (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  funder_id uuid not null references public.profiles(id) on delete cascade,
  amount_mnt int not null check (amount_mnt > 0),
  message text,
  status text not null default 'pending' check (status in ('pending','paid','cancelled')),
  payment_ref text,
  created_at timestamptz not null default now()
);

-- ── keep search_text in sync ────────────────────────────────────────────────
create or replace function public.projects_sync_search()
returns trigger language plpgsql as $$
begin
  new.search_text := lower(
    coalesce(new.title,'') || ' ' || coalesce(new.summary,'') || ' ' ||
    coalesce(new.description,'') || ' ' || coalesce(new.category_id,'') || ' ' ||
    coalesce(array_to_string(new.tags,' '),'') || ' ' ||
    coalesce(array_to_string(new.looking_for,' '),''));
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists projects_search_sync on public.projects;
create trigger projects_search_sync
before insert or update on public.projects
for each row execute function public.projects_sync_search();

create index if not exists projects_search_trgm on public.projects using gin (search_text gin_trgm_ops);
create index if not exists projects_tags_gin    on public.projects using gin (tags);
create index if not exists projects_status_idx  on public.projects (status, created_at desc);
create index if not exists projects_owner_idx   on public.projects (owner_id);
create index if not exists preq_project_idx     on public.project_requests (project_id, status, created_at desc);
create index if not exists preq_sender_idx      on public.project_requests (sender_id, created_at desc);
create index if not exists pfund_project_idx    on public.project_funding (project_id, status);
create index if not exists pmem_user_idx        on public.project_members (user_id);

-- ── row level security ──────────────────────────────────────────────────────
alter table public.companies         enable row level security;
alter table public.projects          enable row level security;
alter table public.project_members   enable row level security;
alter table public.project_requests  enable row level security;
alter table public.project_funding   enable row level security;

create policy co_read       on public.companies for select using (true);
create policy co_update_own on public.companies for update using (auth.uid() = id) with check (auth.uid() = id);
create policy co_insert_own on public.companies for insert with check (auth.uid() = id);

create policy pr_read       on public.projects for select using (true);
create policy pr_update_own on public.projects for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy pr_delete_own on public.projects for delete using (auth.uid() = owner_id);

create policy pm_read on public.project_members for select using (true);

create policy prq_read on public.project_requests for select
  using (auth.uid() = sender_id
      or auth.uid() in (select owner_id from public.projects p where p.id = project_id));

create policy pf_read on public.project_funding for select
  using (auth.uid() = funder_id
      or auth.uid() in (select owner_id from public.projects p where p.id = project_id));

-- ── create project (experts only) ───────────────────────────────────────────
create or replace function public.create_project(
  p_title text, p_summary text, p_description text, p_category text,
  p_tags text[], p_looking_for text[], p_funding_goal int
) returns public.projects language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_role text; v_p public.projects;
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED'; end if;
  select role into v_role from public.profiles where id = v_uid;
  if v_role <> 'expert' then raise exception 'ONLY_EXPERTS_CAN_CREATE'; end if;
  if coalesce(trim(p_title),'') = '' then raise exception 'TITLE_REQUIRED'; end if;

  insert into public.projects (owner_id, title, summary, description, category_id,
                               tags, looking_for, funding_goal_mnt, cover_color)
  values (v_uid, p_title, p_summary, p_description, nullif(p_category,''),
          coalesce(p_tags,'{}'), coalesce(p_looking_for,'{}'),
          greatest(0, coalesce(p_funding_goal,0)), (floor(random()*8))::int)
  returning * into v_p;

  insert into public.project_members (project_id, user_id, role) values (v_p.id, v_uid, 'owner');
  return v_p;
end $$;

-- ── join request: 10 points, expert OR client ───────────────────────────────
create or replace function public.send_project_request(p_project_id uuid, p_message text)
returns public.project_requests language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_cost int := 10; v_bal int; v_owner uuid; v_req public.project_requests;
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED'; end if;
  select owner_id into v_owner from public.projects where id = p_project_id;
  if v_owner is null then raise exception 'PROJECT_NOT_FOUND'; end if;
  if v_owner = v_uid then raise exception 'OWN_PROJECT'; end if;
  if exists (select 1 from public.project_members where project_id = p_project_id and user_id = v_uid) then
    raise exception 'ALREADY_MEMBER'; end if;
  if exists (select 1 from public.project_requests
             where project_id = p_project_id and sender_id = v_uid and status = 'pending') then
    raise exception 'ALREADY_REQUESTED'; end if;

  select points into v_bal from public.profiles where id = v_uid for update;
  if v_bal < v_cost then raise exception 'INSUFFICIENT_POINTS'; end if;

  update public.profiles set points = points - v_cost where id = v_uid;
  insert into public.points_ledger (user_id, delta, reason) values (v_uid, -v_cost, 'project_request');

  insert into public.project_requests (project_id, sender_id, message, points_spent)
  values (p_project_id, v_uid, p_message, v_cost)
  on conflict (project_id, sender_id)
  do update set status = 'pending', message = excluded.message, created_at = now()
  returning * into v_req;

  update public.projects set requests_count = requests_count + 1 where id = p_project_id;
  return v_req;
end $$;

-- ── owner accepts / declines ────────────────────────────────────────────────
create or replace function public.set_project_request_status(p_request_id uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_pid uuid; v_sender uuid; v_owner uuid;
begin
  if p_status not in ('accepted','declined') then raise exception 'BAD_STATUS'; end if;
  select r.project_id, r.sender_id, p.owner_id into v_pid, v_sender, v_owner
  from public.project_requests r join public.projects p on p.id = r.project_id
  where r.id = p_request_id;
  if v_owner is null then raise exception 'REQUEST_NOT_FOUND'; end if;
  if v_owner <> v_uid then raise exception 'NOT_PROJECT_OWNER'; end if;

  update public.project_requests set status = p_status where id = p_request_id;

  if p_status = 'accepted' then
    insert into public.project_members (project_id, user_id, role)
    values (v_pid, v_sender, 'collaborator') on conflict do nothing;
    update public.projects
      set members_count = (select count(*) from public.project_members where project_id = v_pid)
      where id = v_pid;
  end if;
end $$;

-- ── company funding (real ₮) ────────────────────────────────────────────────
create or replace function public.pledge_funding(p_project_id uuid, p_amount int, p_message text)
returns public.project_funding language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_f public.project_funding;
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED'; end if;
  if coalesce(p_amount,0) <= 0 then raise exception 'BAD_AMOUNT'; end if;
  if not exists (select 1 from public.projects where id = p_project_id) then
    raise exception 'PROJECT_NOT_FOUND'; end if;
  insert into public.project_funding (project_id, funder_id, amount_mnt, message, status)
  values (p_project_id, v_uid, p_amount, p_message, 'pending')
  returning * into v_f;
  return v_f;
end $$;

-- Payment webhook / service role ONLY — never callable from the browser.
create or replace function public.confirm_funding(p_funding_id uuid, p_ref text)
returns void language plpgsql security definer set search_path = public as $$
declare v_pid uuid; v_amt int; v_status text;
begin
  select project_id, amount_mnt, status into v_pid, v_amt, v_status
  from public.project_funding where id = p_funding_id;
  if v_pid is null then raise exception 'FUNDING_NOT_FOUND'; end if;
  if v_status = 'paid' then return; end if;
  update public.project_funding set status = 'paid', payment_ref = p_ref where id = p_funding_id;
  update public.projects set funded_mnt = funded_mnt + v_amt where id = v_pid;
end $$;
revoke execute on function public.confirm_funding(uuid, text) from anon, authenticated;

-- ============================================================================
-- SEARCH
-- Mongolian Cyrillic has no Postgres stemmer, so we combine:
--   1) AND-matching of every typed word  -> precision
--   2) pg_trgm similarity                -> typo tolerance
--   3) weighted ranking (title > tags)   -> relevance
-- ============================================================================
create or replace function public.search_projects(
  p_q text default '', p_category text default null, p_status text default null,
  p_tag text default null, p_needs_funding boolean default null,
  p_sort text default 'relevance', p_limit int default 24, p_offset int default 0
) returns table (
  id uuid, title text, summary text, category_id text, status text,
  tags text[], looking_for text[], funding_goal_mnt int, funded_mnt int,
  cover_color int, members_count int, requests_count int, created_at timestamptz,
  owner_id uuid, owner_name text, owner_initials text, owner_color int,
  rank real, total_count bigint
) language sql stable security definer set search_path = public as $$
  with q as (select lower(coalesce(trim(p_q), '')) as raw),
  words as (select array_remove(string_to_array((select raw from q), ' '), '') as w),
  base as (
    select p.*,
      case when (select raw from q) = '' then 0::real
      else (
          (case when lower(p.title) like '%' || (select raw from q) || '%' then 2.0 else 0 end)
        + (case when exists (select 1 from unnest(p.tags) t
                             where lower(t) like '%' || (select raw from q) || '%') then 1.2 else 0 end)
        + similarity(lower(p.title), (select raw from q)) * 1.5
        + similarity(p.search_text,  (select raw from q)) * 0.6
        + coalesce((select max(similarity(tok, (select raw from q)))
                    from unnest(string_to_array(p.search_text,' ')) tok), 0) * 0.8
      )::real end as rank
    from public.projects p
    where p.status <> 'archived'
      and (p_category is null or p_category = '' or p.category_id = p_category)
      and (p_status   is null or p_status   = '' or p.status      = p_status)
      and (p_tag      is null or p_tag      = '' or p.tags @> array[p_tag])
      and (p_needs_funding is null
           or (p_needs_funding = true and p.funding_goal_mnt > p.funded_mnt)
           or (p_needs_funding = false))
      and (
        (select raw from q) = ''
        or (select bool_and(p.search_text like '%' || wd || '%')
            from unnest((select w from words)) wd)
        or similarity(p.search_text, (select raw from q)) > 0.14
        or exists (select 1 from unnest(string_to_array(p.search_text,' ')) tok
                   where similarity(tok, (select raw from q)) > 0.40)
      )
  ),
  counted as (select count(*) over () as total, b.* from base b)
  select c.id, c.title, c.summary, c.category_id, c.status,
         c.tags, c.looking_for, c.funding_goal_mnt, c.funded_mnt,
         c.cover_color, c.members_count, c.requests_count, c.created_at,
         c.owner_id, pr.full_name, pr.avatar_initials, pr.avatar_color,
         c.rank, c.total
  from counted c
  join public.profiles pr on pr.id = c.owner_id
  order by
    case when p_sort = 'relevance' then c.rank end desc nulls last,
    case when p_sort = 'funded'    then c.funded_mnt end desc nulls last,
    case when p_sort = 'team'      then c.members_count end desc nulls last,
    case when p_sort = 'popular'   then c.requests_count end desc nulls last,
    c.created_at desc
  limit greatest(1, least(coalesce(p_limit, 24), 60))
  offset greatest(0, coalesce(p_offset, 0));
$$;

create or replace function public.project_suggestions(p_q text, p_limit int default 8)
returns table (kind text, label text, project_id uuid, hits int)
language sql stable security definer set search_path = public as $$
  with q as (select lower(coalesce(trim(p_q),'')) as raw)
  (
    select 'project'::text, p.title, p.id, 0
    from public.projects p
    where (select raw from q) <> '' and p.status <> 'archived'
      and (lower(p.title) like '%' || (select raw from q) || '%'
           or similarity(lower(p.title), (select raw from q)) > 0.2)
    order by similarity(lower(p.title), (select raw from q)) desc
    limit greatest(1, p_limit / 2)
  )
  union all
  (
    select 'tag'::text, t.tag, null::uuid, count(*)::int
    from public.projects p, unnest(p.tags) as t(tag)
    where (select raw from q) <> '' and p.status <> 'archived'
      and lower(t.tag) like '%' || (select raw from q) || '%'
    group by t.tag order by count(*) desc
    limit greatest(1, p_limit / 2)
  );
$$;

create or replace function public.popular_project_tags(p_limit int default 12)
returns table (tag text, hits int)
language sql stable security definer set search_path = public as $$
  select t.tag, count(*)::int as hits
  from public.projects p, unnest(p.tags) as t(tag)
  where p.status <> 'archived'
  group by t.tag order by count(*) desc, t.tag asc
  limit greatest(1, coalesce(p_limit, 12));
$$;

grant execute on function public.search_projects(text,text,text,text,boolean,text,int,int) to anon, authenticated;
grant execute on function public.project_suggestions(text,int) to anon, authenticated;
grant execute on function public.popular_project_tags(int) to anon, authenticated;
