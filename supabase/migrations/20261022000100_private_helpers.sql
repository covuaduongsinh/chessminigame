-- Đưa các hàm trợ giúp RLS ra khỏi schema public để không gọi được qua REST API.
create schema if not exists private;
grant usage on schema private to authenticated;

alter function public.is_group_member(uuid) set schema private;
alter function public.is_group_coach(uuid) set schema private;
alter function public.shares_group(uuid) set schema private;
alter function public.coaches_user(uuid) set schema private;
alter function public.new_join_code() set schema private;

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
      values (btrim(p_name), p_kind, private.new_join_code(), uid)
      returning * into result;
      exit;
    exception when unique_violation then
      null; -- mã trùng, thử mã khác
    end;
  end loop;
  insert into public.group_members (group_id, user_id, role) values (result.id, uid, 'owner');
  update public.profiles set role = 'coach' where id = uid and role = 'kid';
  return result;
end;
$$;

create or replace function public.group_progress(p_group uuid)
returns table (user_id uuid, nickname text, avatar text, item_id text, best_stars smallint, best_moves integer, attempts integer, updated_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.is_group_coach(p_group) then raise exception 'coach only'; end if;
  return query
  select m.user_id, pr.nickname, pr.avatar, p.item_id, p.best_stars, p.best_moves, p.attempts, p.updated_at
  from public.group_members m
  join public.profiles pr on pr.id = m.user_id
  left join public.progress p on p.user_id = m.user_id
  where m.group_id = p_group;
end;
$$;

create or replace function public.create_game(p_group uuid, p_opponent uuid, p_my_color text default 'w')
returns public.games language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  result public.games;
begin
  if not private.is_group_member(p_group) then raise exception 'not a member'; end if;
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

revoke execute on all functions in schema private from public, anon;
grant execute on all functions in schema private to authenticated;
revoke execute on all functions in schema public from public, anon;
grant execute on all functions in schema public to authenticated;
