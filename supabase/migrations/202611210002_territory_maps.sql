-- Migration: 202611210002_territory_maps.sql
-- Description: Adds map_url column to regions/provinces/communes and allows public SELECT on territory_map:* rows in public.settings.

ALTER TABLE public.regions
  ADD COLUMN IF NOT EXISTS map_url text;

ALTER TABLE public.provinces
  ADD COLUMN IF NOT EXISTS map_url text;

ALTER TABLE public.communes
  ADD COLUMN IF NOT EXISTS map_url text;

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'settings'
      AND policyname = 'Public read territory maps settings'
  ) THEN
    CREATE POLICY "Public read territory maps settings"
      ON public.settings FOR SELECT
      USING (key LIKE 'territory_map:%');
  END IF;
END $$;
