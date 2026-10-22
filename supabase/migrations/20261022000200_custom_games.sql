-- Mini-game do HLV tự tạo (xếp thế + luật thắng), chia sẻ cho nhóm.
create table public.custom_games (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  group_id uuid references public.groups (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  def jsonb not null check (pg_column_size(def) < 20000),
  created_at timestamptz not null default now()
);
create index custom_games_owner_idx on public.custom_games (owner_id);
create index custom_games_group_idx on public.custom_games (group_id);

alter table public.custom_games enable row level security;

create policy custom_games_select on public.custom_games for select to authenticated
  using (owner_id = (select auth.uid()) or (group_id is not null and private.is_group_member(group_id)));
create policy custom_games_insert on public.custom_games for insert to authenticated
  with check (owner_id = (select auth.uid()) and (group_id is null or private.is_group_coach(group_id)));
create policy custom_games_update on public.custom_games for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()) and (group_id is null or private.is_group_coach(group_id)));
create policy custom_games_delete on public.custom_games for delete to authenticated
  using (owner_id = (select auth.uid()));

revoke all on public.custom_games from anon;
grant select, insert, update, delete on public.custom_games to authenticated;
