-- Dương Sinh Chess — schema khởi tạo
-- Trẻ đăng nhập ẩn danh (anonymous sign-in), tên hiển thị tự sinh; HLV/phụ huynh có thể liên kết email.
-- Mọi bảng bật RLS; thao tác ghi quan trọng đi qua RPC security definer.

create extension if not exists pgcrypto with schema extensions;

create type public.user_role as enum ('kid', 'coach', 'parent');
create type public.group_kind as enum ('club', 'class', 'family');
create type public.member_role as enum ('owner', 'coach', 'member');
create type public.game_status as enum ('waiting', 'active', 'finished', 'aborted');

-- ---------------------------------------------------------------- bảng

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null unique check (char_length(nickname) between 2 and 40),
  avatar text not null default 'p' check (avatar in ('p', 'n', 'b', 'r', 'q', 'k')),
  role public.user_role not null default 'kid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  kind public.group_kind not null default 'club',
  join_code text not null unique check (join_code ~ '^[A-Z2-9]{6}$'),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index groups_owner_idx on public.groups (owner_id);

create table public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.member_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
create index group_members_user_idx on public.group_members (user_id);

create table public.progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  item_id text not null check (char_length(item_id) between 1 and 64),
  best_stars smallint not null default 0 check (best_stars between 0 and 3),
  best_moves integer check (best_moves >= 0),
  attempts integer not null default 0 check (attempts >= 0),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create table public.games (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  white_id uuid not null references public.profiles (id) on delete cascade,
  black_id uuid not null references public.profiles (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete cascade,
  status public.game_status not null default 'waiting',
  result text check (result in ('1-0', '0-1', '1/2-1/2')),
  initial_fen text not null default 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  fen text not null default 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  ply integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (white_id <> black_id)
);
create index games_group_idx on public.games (group_id, updated_at desc);
create index games_white_idx on public.games (white_id);
create index games_black_idx on public.games (black_id);
create index games_created_by_idx on public.games (created_by);

create table public.moves (
  game_id uuid not null references public.games (id) on delete cascade,
  ply integer not null check (ply >= 1),
  uci text not null check (uci ~ '^[a-h][1-8][a-h][1-8][qrbn]?$'),
  san text not null check (char_length(san) between 2 and 10),
  fen_after text not null,
  played_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (game_id, ply)
);
create index moves_played_by_idx on public.moves (played_by);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  item_ids text[] not null check (cardinality(item_ids) between 1 and 50),
  due_at timestamptz,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index assignments_group_idx on public.assignments (group_id);
create index assignments_created_by_idx on public.assignments (created_by);

-- --------------------------------------------------------- hàm trợ giúp

create or replace function public.is_group_member(gid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.group_members m
    where m.group_id = gid and m.user_id = (select auth.uid())
  );
$$;

create or replace function public.is_group_coach(gid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.group_members m
    where m.group_id = gid and m.user_id = (select auth.uid()) and m.role in ('owner', 'coach')
  );
$$;

create or replace function public.shares_group(other uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.group_members a
    join public.group_members b on a.group_id = b.group_id
    where a.user_id = (select auth.uid()) and b.user_id = other
  );
$$;

create or replace function public.coaches_user(other uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.group_members a
    join public.group_members b on a.group_id = b.group_id
    where a.user_id = (select auth.uid()) and a.role in ('owner', 'coach') and b.user_id = other
  );
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger games_touch before update on public.games
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------------ RLS

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.progress enable row level security;
alter table public.games enable row level security;
alter table public.moves enable row level security;
alter table public.assignments enable row level security;

create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.shares_group(id));
create policy profiles_update on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy groups_select on public.groups for select to authenticated
  using (public.is_group_member(id));
create policy groups_update on public.groups for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy groups_delete on public.groups for delete to authenticated
  using (owner_id = (select auth.uid()));

create policy members_select on public.group_members for select to authenticated
  using (public.is_group_member(group_id));
create policy members_delete on public.group_members for delete to authenticated
  using (user_id = (select auth.uid()) or public.is_group_coach(group_id));

create policy progress_select on public.progress for select to authenticated
  using (user_id = (select auth.uid()) or public.coaches_user(user_id));

create policy games_select on public.games for select to authenticated
  using (public.is_group_member(group_id));

create policy moves_select on public.moves for select to authenticated
  using (exists (select 1 from public.games g where g.id = game_id and public.is_group_member(g.group_id)));

create policy assignments_select on public.assignments for select to authenticated
  using (public.is_group_member(group_id));
create policy assignments_insert on public.assignments for insert to authenticated
  with check (public.is_group_coach(group_id) and created_by = (select auth.uid()));
create policy assignments_delete on public.assignments for delete to authenticated
  using (public.is_group_coach(group_id));

-- ------------------------------------------------------------------ RPC

-- Tạo hồ sơ cho tài khoản hiện tại (nếu chưa có). Trùng tên thì thêm số.
create or replace function public.ensure_profile(p_nickname text, p_avatar text default 'p')
returns public.profiles language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  result public.profiles;
  candidate text := btrim(p_nickname);
  tries int := 0;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  select * into result from public.profiles where id = uid;
  if found then return result; end if;
  loop
    begin
      insert into public.profiles (id, nickname, avatar)
      values (uid, candidate, coalesce(nullif(p_avatar, ''), 'p'))
      returning * into result;
      return result;
    exception when unique_violation then
      tries := tries + 1;
      if tries > 8 then raise; end if;
      candidate := btrim(p_nickname) || ' ' || (10 + floor(random() * 90))::int;
    end;
  end loop;
end;
$$;

create or replace function public.update_profile(p_nickname text default null, p_avatar text default null, p_role public.user_role default null)
returns public.profiles language plpgsql security definer set search_path = '' as $$
declare
  result public.profiles;
begin
  update public.profiles set
    nickname = coalesce(nullif(btrim(p_nickname), ''), nickname),
    avatar = coalesce(p_avatar, avatar),
    role = coalesce(p_role, role)
  where id = (select auth.uid())
  returning * into result;
  return result;
end;
$$;

create or replace function public.new_join_code()
returns text language plpgsql volatile set search_path = '' as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text := '';
begin
  for i in 1..6 loop
    code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return code;
end;
$$;

create or replace function public.create_group(p_name text, p_kind public.group_kind default 'club')
returns public.groups language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  result public.groups;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if not exists (select 1 from public.profiles where id = uid) then
    raise exception 'profile required';
  end if;
  loop
    begin
      insert into public.groups (name, kind, join_code, owner_id)
      values (btrim(p_name), p_kind, public.new_join_code(), uid)
      returning * into result;
      exit;
    exception when unique_violation then
      -- mã trùng, thử mã khác
    end;
  end loop;
  insert into public.group_members (group_id, user_id, role) values (result.id, uid, 'owner');
  update public.profiles set role = 'coach' where id = uid and role = 'kid';
  return result;
end;
$$;

create or replace function public.join_group(p_code text)
returns public.groups language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  result public.groups;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  select * into result from public.groups where join_code = upper(btrim(p_code));
  if not found then raise exception 'group not found' using errcode = 'P0002'; end if;
  insert into public.group_members (group_id, user_id) values (result.id, uid)
  on conflict do nothing;
  return result;
end;
$$;

create or replace function public.set_member_role(p_group uuid, p_user uuid, p_role public.member_role)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.groups where id = p_group and owner_id = (select auth.uid())) then
    raise exception 'only the owner can change roles';
  end if;
  if p_role = 'owner' then raise exception 'cannot assign owner'; end if;
  update public.group_members set role = p_role where group_id = p_group and user_id = p_user and role <> 'owner';
end;
$$;

-- Gộp tiến độ từ thiết bị: giữ thành tích tốt nhất, cộng dồn số lần chơi.
create or replace function public.sync_progress(p_items jsonb)
returns setof public.progress language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then raise exception 'not authenticated'; end if;
  return query
  insert into public.progress as p (user_id, item_id, best_stars, best_moves, attempts, completed_at)
  select uid,
         x.item_id,
         least(greatest(coalesce(x.stars, 0), 0), 3),
         x.moves,
         greatest(coalesce(x.attempts, 0), 0),
         case when coalesce(x.stars, 0) > 0 then now() end
  from jsonb_to_recordset(p_items) as x(item_id text, stars int, moves int, attempts int)
  where x.item_id is not null
  on conflict (user_id, item_id) do update set
    best_stars = greatest(p.best_stars, excluded.best_stars),
    best_moves = case
      when p.best_moves is null then excluded.best_moves
      when excluded.best_moves is null then p.best_moves
      else least(p.best_moves, excluded.best_moves) end,
    attempts = p.attempts + excluded.attempts,
    completed_at = coalesce(p.completed_at, excluded.completed_at),
    updated_at = now()
  returning p.*;
end;
$$;

-- Bảng tiến độ cả nhóm cho HLV.
create or replace function public.group_progress(p_group uuid)
returns table (user_id uuid, nickname text, avatar text, item_id text, best_stars smallint, best_moves integer, attempts integer, updated_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_group_coach(p_group) then raise exception 'coach only'; end if;
  return query
  select m.user_id, pr.nickname, pr.avatar, p.item_id, p.best_stars, p.best_moves, p.attempts, p.updated_at
  from public.group_members m
  join public.profiles pr on pr.id = m.user_id
  left join public.progress p on p.user_id = m.user_id
  where m.group_id = p_group;
end;
$$;

-- Mời chơi một bạn trong nhóm.
create or replace function public.create_game(p_group uuid, p_opponent uuid, p_my_color text default 'w')
returns public.games language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  result public.games;
begin
  if not public.is_group_member(p_group) then raise exception 'not a member'; end if;
  if not exists (select 1 from public.group_members where group_id = p_group and user_id = p_opponent) then
    raise exception 'opponent not in group';
  end if;
  if p_opponent = uid then raise exception 'cannot play yourself'; end if;
  insert into public.games (group_id, white_id, black_id, created_by)
  values (
    p_group,
    case when p_my_color = 'b' then p_opponent else uid end,
    case when p_my_color = 'b' then uid else p_opponent end,
    uid
  ) returning * into result;
  return result;
end;
$$;

create or replace function public.respond_game(p_game uuid, p_accept boolean)
returns public.games language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  g public.games;
begin
  select * into g from public.games where id = p_game for update;
  if not found or g.status <> 'waiting' then raise exception 'game not waiting'; end if;
  if uid not in (g.white_id, g.black_id) then raise exception 'not a player'; end if;
  if uid = g.created_by and p_accept then raise exception 'opponent must accept'; end if;
  update public.games set status = case when p_accept then 'active'::public.game_status else 'aborted'::public.game_status end
  where id = p_game returning * into g;
  return g;
end;
$$;

-- Ghi một nước đi. Luật cờ được kiểm tra ở cả hai máy khách; máy chủ kiểm tra lượt và thứ tự.
create or replace function public.play_move(p_game uuid, p_ply integer, p_uci text, p_san text, p_fen_after text, p_result text default null)
returns public.games language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  g public.games;
  white_starts boolean;
  white_to_move boolean;
  expected_player uuid;
begin
  select * into g from public.games where id = p_game for update;
  if not found then raise exception 'game not found'; end if;
  if g.status <> 'active' then raise exception 'game not active'; end if;
  if p_ply <> g.ply + 1 then raise exception 'wrong ply % (expected %)', p_ply, g.ply + 1; end if;
  white_starts := split_part(g.initial_fen, ' ', 2) = 'w';
  white_to_move := (g.ply % 2 = 0) = white_starts;
  expected_player := case when white_to_move then g.white_id else g.black_id end;
  if uid is distinct from expected_player then
    raise exception 'not your turn';
  end if;
  if p_result is not null and p_result not in ('1-0', '0-1', '1/2-1/2') then raise exception 'bad result'; end if;
  insert into public.moves (game_id, ply, uci, san, fen_after, played_by)
  values (p_game, p_ply, p_uci, p_san, p_fen_after, uid);
  update public.games set
    fen = p_fen_after,
    ply = p_ply,
    status = case when p_result is null then status else 'finished'::public.game_status end,
    result = p_result
  where id = p_game returning * into g;
  return g;
end;
$$;

create or replace function public.resign_game(p_game uuid)
returns public.games language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  g public.games;
begin
  select * into g from public.games where id = p_game for update;
  if not found or g.status <> 'active' then raise exception 'game not active'; end if;
  if uid not in (g.white_id, g.black_id) then raise exception 'not a player'; end if;
  update public.games set status = 'finished', result = case when uid = g.white_id then '0-1' else '1-0' end
  where id = p_game returning * into g;
  return g;
end;
$$;

-- Chỉ người dùng đã đăng nhập (kể cả ẩn danh) được gọi hàm.
revoke execute on all functions in schema public from public, anon;
grant execute on all functions in schema public to authenticated;

-- Bảng chỉ đọc qua RLS; ghi qua RPC.
revoke insert, update, delete on public.profiles, public.groups, public.group_members, public.progress, public.games, public.moves from anon, authenticated;
grant update on public.profiles to authenticated;
grant update (name), delete on public.groups to authenticated;
grant delete on public.group_members to authenticated;
grant insert, delete on public.assignments to authenticated;
revoke all on all tables in schema public from anon;

-- Realtime cho ván online.
alter publication supabase_realtime add table public.games, public.moves;
