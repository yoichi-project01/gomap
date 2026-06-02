-- place_lists の category (text) を tags (text[]) に移行
-- 冪等。既存データは tags[0] に移行される。

alter table public.place_lists add column if not exists tags text[];

update public.place_lists
  set tags = array[category]
  where category is not null and (tags is null or tags = '{}');

alter table public.place_lists drop column if exists category;

drop index if exists place_lists_category_idx;
create index if not exists place_lists_tags_idx on public.place_lists using gin(tags);
