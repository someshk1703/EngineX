-- Migration: bind a notebook to a specific chapter/topic (EX-Notebook pivot)
-- Feature: 001-notebook-personal-notion (revision — per-topic embedded notes,
-- replacing the standalone free-canvas document library)

alter table public.notebooks add column if not exists topic_key text;

-- One notebook per (user, topic) — lets the client upsert-by-topic-key.
create unique index if not exists notebooks_user_topic_key_idx
  on public.notebooks(user_id, topic_key)
  where topic_key is not null;
