-- Migration: 202611210002_territory_maps.sql
-- Description: Adds optional map_url column to regions, provinces, and communes for dedicated sidebar maps.

ALTER TABLE public.regions
  ADD COLUMN IF NOT EXISTS map_url text;

ALTER TABLE public.provinces
  ADD COLUMN IF NOT EXISTS map_url text;

ALTER TABLE public.communes
  ADD COLUMN IF NOT EXISTS map_url text;
