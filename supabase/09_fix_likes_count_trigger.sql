-- =====================================================================
-- 修正: bump_place_list_likes_count に SECURITY DEFINER を追加
-- =====================================================================
-- 問題: トリガーが呼び出したユーザー権限で実行されるため、
--       他人の place_lists.likes_count を更新しようとすると
--       RLS (place_lists_update_own) にブロックされて無視されていた。
-- 修正: SECURITY DEFINER で関数オーナー権限で実行し RLS をバイパスする。

create or replace function public.bump_place_list_likes_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    update public.place_lists
       set likes_count = likes_count + 1
     where id = new.place_list_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.place_lists
       set likes_count = greatest(likes_count - 1, 0)
     where id = old.place_list_id;
    return old;
  end if;
  return null;
end;
$$;
