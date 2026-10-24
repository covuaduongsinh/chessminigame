-- Người dùng tự xóa tài khoản của mình (quyền riêng tư của trẻ em, Nghị định 13/2023).
-- Mọi bảng đều tham chiếu profiles/auth.users với on delete cascade, nên tiến độ, nhóm do mình
-- làm chủ (kèm thành viên và ván trong nhóm), ván cờ, bài tự tạo… bị xóa theo.
create or replace function public.delete_my_account()
returns void
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
