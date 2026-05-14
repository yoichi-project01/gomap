create or replace function public.increment_place_list_likes(list_id uuid, delta int)
returns void
language sql
security definer
set search_path = public
as $$
  update public.place_lists
  set likes_count = greatest(0, likes_count + delta)
  where id = list_id;
$$;
