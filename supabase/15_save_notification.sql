-- =====================================================================
-- 保存通知: place_list_saves INSERT → 通知を生成
-- =====================================================================
-- 08_notifications.sql のあとに実行してください。冪等。

-- notifications.type の CHECK 制約を拡張
alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (type in ('place_list_liked', 'place_list_saved'));

-- トリガー関数
create or replace function public.notify_place_list_saved()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_creator uuid;
begin
  select creator into v_creator
    from public.place_lists
   where id = new.place_list_id;

  -- 自分自身の保存 / creator IS NULL は通知しない
  if v_creator is null or v_creator = new.user_id then
    return new;
  end if;

  insert into public.notifications (user_id, type, place_list_id, actor_id)
  values (v_creator, 'place_list_saved', new.place_list_id, new.user_id);

  return new;
end;
$$;

drop trigger if exists place_list_saved_notify_trg on public.place_list_saves;
create trigger place_list_saved_notify_trg
  after insert on public.place_list_saves
  for each row execute function public.notify_place_list_saved();
