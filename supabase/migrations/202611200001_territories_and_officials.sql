-- Migration: 202611200001_territories_and_officials.sql
-- Description: Adds territories enhancement (FR & AR naming, populations, kinds),
-- officials profiles table with role/party/mandate/photos, article_territories linking table,
-- and RLS security policies.

-- 1. Extend regions table
ALTER TABLE public.regions
  ADD COLUMN IF NOT EXISTS name_fr text,
  ADD COLUMN IF NOT EXISTS name_ar text,
  ADD COLUMN IF NOT EXISTS population integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- 2. Extend provinces table
ALTER TABLE public.provinces
  ADD COLUMN IF NOT EXISTS name_fr text,
  ADD COLUMN IF NOT EXISTS name_ar text,
  ADD COLUMN IF NOT EXISTS kind text CHECK (kind IN ('province', 'prefecture')) DEFAULT 'province',
  ADD COLUMN IF NOT EXISTS population integer DEFAULT 0;

-- 3. Extend communes table
ALTER TABLE public.communes
  ADD COLUMN IF NOT EXISTS name_fr text,
  ADD COLUMN IF NOT EXISTS name_ar text,
  ADD COLUMN IF NOT EXISTS kind text CHECK (kind IN ('urbaine', 'rurale')) DEFAULT 'rurale',
  ADD COLUMN IF NOT EXISTS population integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS website text;

-- 4. Create officials table
CREATE TABLE IF NOT EXISTS public.officials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  territory_type text NOT NULL CHECK (territory_type IN ('region', 'province', 'commune')),
  region_id uuid REFERENCES public.regions(id) ON DELETE CASCADE,
  province_id uuid REFERENCES public.provinces(id) ON DELETE CASCADE,
  commune_id uuid REFERENCES public.communes(id) ON DELETE CASCADE,
  CONSTRAINT check_territory_fk CHECK (
    (territory_type = 'region'   AND region_id IS NOT NULL AND province_id IS NULL AND commune_id IS NULL) OR
    (territory_type = 'province' AND province_id IS NOT NULL AND region_id IS NULL AND commune_id IS NULL) OR
    (territory_type = 'commune'  AND commune_id IS NOT NULL AND region_id IS NULL AND province_id IS NULL)
  ),
  full_name text NOT NULL,
  full_name_ar text,
  role text NOT NULL,
  house text CHECK (house IN ('conseil', 'chambre_representants', 'chambre_conseillers')) DEFAULT 'conseil',
  party text,
  mandate_start text DEFAULT '2021',
  mandate_end text DEFAULT '2026',
  bio text,
  photo_path text,
  display_order integer DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Create article_territories table
CREATE TABLE IF NOT EXISTS public.article_territories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  territory_type text NOT NULL CHECK (territory_type IN ('region', 'province', 'commune')),
  region_id uuid REFERENCES public.regions(id) ON DELETE CASCADE,
  province_id uuid REFERENCES public.provinces(id) ON DELETE CASCADE,
  commune_id uuid REFERENCES public.communes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (article_id, territory_type, region_id, province_id, commune_id)
);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_officials_region ON public.officials(region_id) WHERE region_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_officials_province ON public.officials(province_id) WHERE province_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_officials_commune ON public.officials(commune_id) WHERE commune_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_officials_published ON public.officials(is_published, display_order);
CREATE INDEX IF NOT EXISTS idx_article_territories_article ON public.article_territories(article_id);
CREATE INDEX IF NOT EXISTS idx_article_territories_region ON public.article_territories(region_id);
CREATE INDEX IF NOT EXISTS idx_article_territories_province ON public.article_territories(province_id);
CREATE INDEX IF NOT EXISTS idx_article_territories_commune ON public.article_territories(commune_id);

-- 7. Row Level Security (RLS)
ALTER TABLE public.officials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_territories ENABLE ROW LEVEL SECURITY;

-- Public read policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'officials' AND policyname = 'Public can view published officials'
  ) THEN
    CREATE POLICY "Public can view published officials"
      ON public.officials FOR SELECT
      USING (is_published = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'article_territories' AND policyname = 'Public can view article territories'
  ) THEN
    CREATE POLICY "Public can view article territories"
      ON public.article_territories FOR SELECT
      USING (true);
  END IF;
END $$;

-- Admin write policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'officials' AND policyname = 'Admins can manage officials'
  ) THEN
    CREATE POLICY "Admins can manage officials"
      ON public.officials FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_users
          WHERE admin_users.user_id = auth.uid()
            AND admin_users.status = 'active'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.admin_users
          WHERE admin_users.user_id = auth.uid()
            AND admin_users.status = 'active'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'article_territories' AND policyname = 'Admins can manage article territories'
  ) THEN
    CREATE POLICY "Admins can manage article territories"
      ON public.article_territories FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_users
          WHERE admin_users.user_id = auth.uid()
            AND admin_users.status = 'active'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.admin_users
          WHERE admin_users.user_id = auth.uid()
            AND admin_users.status = 'active'
        )
      );
  END IF;
END $$;

-- 8. Storage bucket setup for territory media
INSERT INTO storage.buckets (id, name, public)
VALUES ('territory-media', 'territory-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public Access Territory Media'
  ) THEN
    CREATE POLICY "Public Access Territory Media"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'territory-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated Upload Territory Media'
  ) THEN
    CREATE POLICY "Authenticated Upload Territory Media"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'territory-media');
  END IF;
END $$;
