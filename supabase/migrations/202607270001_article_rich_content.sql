-- Preserve rich article HTML and large tables in the existing content column.
-- PostgreSQL text is unbounded for normal article content and this conversion is non-destructive.

alter table if exists public.articles
  alter column content type text
  using content::text;
