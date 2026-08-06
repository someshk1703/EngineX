-- Migration: EX-Notebook schema (notebooks, notebook_blocks, storage bucket)
-- Feature: 001-notebook-personal-notion

create table if not exists public.notebooks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null check (btrim(title) <> ''),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists notebooks_user_id_idx on public.notebooks(user_id);

create table if not exists public.notebook_blocks (
  id            uuid primary key default gen_random_uuid(),
  notebook_id   uuid not null references public.notebooks(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  type          text not null check (type in ('text', 'image', 'flashcard', 'link')),
  x             numeric not null default 0,
  y             numeric not null default 0,
  width         numeric not null default 280,
  height        numeric not null default 160,
  z_index       integer not null default 1,
  content       jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists notebook_blocks_notebook_id_idx on public.notebook_blocks(notebook_id);
create index if not exists notebook_blocks_user_id_idx on public.notebook_blocks(user_id);

-- Keep notebooks.updated_at fresh whenever a block changes (drives library "last edited")
create or replace function public.touch_notebook_updated_at()
returns trigger as $$
begin
  update public.notebooks set updated_at = now() where id = coalesce(new.notebook_id, old.notebook_id);
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

drop trigger if exists notebook_blocks_touch_parent on public.notebook_blocks;
create trigger notebook_blocks_touch_parent
  after insert or update or delete on public.notebook_blocks
  for each row execute function public.touch_notebook_updated_at();

-- Row Level Security: strict per-user isolation (FR-015 / SC-007)
alter table public.notebooks enable row level security;
alter table public.notebook_blocks enable row level security;

create policy notebooks_select_own on public.notebooks
  for select using (auth.uid() = user_id);
create policy notebooks_insert_own on public.notebooks
  for insert with check (auth.uid() = user_id);
create policy notebooks_update_own on public.notebooks
  for update using (auth.uid() = user_id);
create policy notebooks_delete_own on public.notebooks
  for delete using (auth.uid() = user_id);

create policy notebook_blocks_select_own on public.notebook_blocks
  for select using (auth.uid() = user_id);
create policy notebook_blocks_insert_own on public.notebook_blocks
  for insert with check (auth.uid() = user_id);
create policy notebook_blocks_update_own on public.notebook_blocks
  for update using (auth.uid() = user_id);
create policy notebook_blocks_delete_own on public.notebook_blocks
  for delete using (auth.uid() = user_id);

-- Storage bucket for pasted/dropped images
insert into storage.buckets (id, name, public)
values ('notebook-images', 'notebook-images', false)
on conflict (id) do nothing;

create policy notebook_images_select_own on storage.objects
  for select using (
    bucket_id = 'notebook-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy notebook_images_insert_own on storage.objects
  for insert with check (
    bucket_id = 'notebook-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy notebook_images_delete_own on storage.objects
  for delete using (
    bucket_id = 'notebook-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
