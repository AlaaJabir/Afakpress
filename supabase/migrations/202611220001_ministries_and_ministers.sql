-- Migration: 202611220001_ministries_and_ministers.sql
-- Description: Creates public.ministries (seeded with all 31 Moroccan ministries & 7 poles),
-- public.ministry_profiles (minister & delegate minister profiles with photo/role/party/bio),
-- extends public.articles with ministry_slug, and configures RLS policies & indexes.

-- 1. Create ministries table (dedicated ministry page metadata & editable content)
CREATE TABLE IF NOT EXISTS public.ministries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  group_id text NOT NULL,
  group_name_ar text NOT NULL,
  overview text,
  mission text,
  headquarters text,
  official_website text,
  emblem_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Seed all 31 Moroccan ministries across 7 poles
INSERT INTO public.ministries (number, slug, name_ar, group_id, group_name_ar)
VALUES
  (1,  'presidence-du-gouvernement', 'رئاسة الحكومة', 'presidency', 'رئاسة الحكومة'),
  (2,  'secretariat-general-du-gouvernement', 'الأمانة العامة للحكومة', 'presidency', 'رئاسة الحكومة'),
  (3,  'interieur', 'وزارة الداخلية', 'sovereign', 'الوزارات السيادية'),
  (4,  'affaires-etrangeres', 'وزارة الشؤون الخارجية والتعاون الإفريقي والمغاربة المقيمين بالخارج', 'sovereign', 'الوزارات السيادية'),
  (5,  'justice', 'وزارة العدل', 'sovereign', 'الوزارات السيادية'),
  (6,  'habous-et-affaires-islamiques', 'وزارة الأوقاف والشؤون الإسلامية', 'sovereign', 'الوزارات السيادية'),
  (7,  'administration-defense-nationale', 'الوزارة المنتدبة لدى رئيسة الحكومة المكلفة بإدارة الدفاع الوطني', 'sovereign', 'الوزارات السيادية'),
  (8,  'relations-avec-le-parlement', 'الوزارة المنتدبة لدى رئيسة الحكومة المكلفة بالعلاقات مع البرلمان والمجتمع المدني', 'sovereign', 'الوزارات السيادية'),
  (9,  'economie-et-finances', 'وزارة الاقتصاد والمالية والنجاعة العمومية', 'economic', 'الوزارات الاقتصادية'),
  (10, 'equipement-eau-et-forets', 'وزارة التجهيز والماء والغابات', 'economic', 'الوزارات الاقتصادية'),
  (11, 'agriculture-peche-et-souverainete-alimentaire', 'وزارة الفلاحة والصيد البحري والسيادة الغذائية', 'economic', 'الوزارات الاقتصادية'),
  (12, 'industrie-commerce-et-investissement', 'وزارة الصناعة والتجارة والاستثمار والإدماج الاقتصادي', 'economic', 'الوزارات الاقتصادية'),
  (13, 'energie-mines-et-developpement-durable', 'وزارة الطاقة والمعادن والتنمية المستدامة', 'economic', 'الوزارات الاقتصادية'),
  (14, 'transport-et-logistique', 'وزارة النقل واللوجيستيك', 'economic', 'الوزارات الاقتصادية'),
  (15, 'tourisme-artisanat-et-economie-solidaire', 'وزارة السياحة والصناعة التقليدية والاقتصاد التضامني', 'economic', 'الوزارات الاقتصادية'),
  (16, 'intelligence-artificielle-et-transition-numerique', 'وزارة الذكاء الاصطناعي والتحول الرقمي وإصلاح الإدارة', 'economic', 'الوزارات الاقتصادية'),
  (17, 'amenagement-du-territoire-urbanisme-et-habitat', 'وزارة إعداد التراب الوطني والتعمير والإسكان وسياسة المدينة', 'urban', 'وزارات التعمير والتراب'),
  (18, 'deleguee-habitat-et-politique-de-la-ville', 'الوزارة المنتدبة لدى وزير إعداد التراب الوطني المكلفة بالإسكان وسياسة المدينة', 'urban', 'وزارات التعمير والتراب'),
  (19, 'education-nationale-prescolaire-et-formation-professionnelle', 'وزارة التربية الوطنية والتعليم الأولي والتكوين المهني والتأهيل', 'education', 'وزارات التعليم والتكوين'),
  (20, 'enseignement-superieur-recherche-et-innovation', 'وزارة التعليم العالي والبحث العلمي والابتكار', 'education', 'وزارات التعليم والتكوين'),
  (21, 'deleguee-prescolaire-et-lutte-contre-abandon-scolaire', 'الوزارة المنتدبة لدى وزير التربية الوطنية المكلفة بالتعليم الأولي ومحاربة الهدر المدرسي', 'education', 'وزارات التعليم والتكوين'),
  (22, 'deleguee-formation-professionnelle-et-qualification', 'الوزارة المنتدبة لدى وزير التربية الوطنية المكلفة بالتكوين المهني والتأهيل', 'education', 'وزارات التعليم والتكوين'),
  (23, 'sante-et-protection-sociale', 'وزارة الصحة والحماية الاجتماعية', 'social', 'الوزارات الاجتماعية'),
  (24, 'emploi-et-dialogue-social', 'وزارة التشغيل والحوار الاجتماعي', 'social', 'الوزارات الاجتماعية'),
  (25, 'famille-developpement-social-et-egalite', 'وزارة الأسرة والتنمية الاجتماعية والمساواة', 'social', 'الوزارات الاجتماعية'),
  (26, 'jeunesse-culture-et-sport', 'وزارة الشباب والثقافة والرياضة', 'social', 'الوزارات الاجتماعية'),
  (27, 'deleguee-chargee-de-la-jeunesse', 'الوزارة المنتدبة لدى وزير الشباب المكلفة بالشباب', 'social', 'الوزارات الاجتماعية'),
  (28, 'deleguee-inclusion-sociale', 'الوزارة المنتدبة لدى وزيرة الأسرة المكلفة بالإدماج الاجتماعي', 'social', 'الوزارات الاجتماعية'),
  (29, 'deleguee-commerce-exterieur', 'الوزارة المنتدبة لدى وزير الصناعة المكلفة بالتجارة الخارجية', 'delegated', 'وزارات منتدبة أخرى'),
  (30, 'deleguee-peche-maritime', 'الوزارة المنتدبة لدى وزير الفلاحة المكلفة بالصيد البحري', 'delegated', 'وزارات منتدبة أخرى'),
  (31, 'deleguee-artisanat-et-economie-solidaire', 'الوزارة المنتدبة لدى وزير السياحة المكلفة بالصناعة التقليدية والاقتصاد التضامني', 'delegated', 'وزارات منتدبة أخرى')
ON CONFLICT (slug) DO UPDATE SET
  number = EXCLUDED.number,
  name_ar = EXCLUDED.name_ar,
  group_id = EXCLUDED.group_id,
  group_name_ar = EXCLUDED.group_name_ar,
  updated_at = now();

-- 3. Create ministry_profiles table (Ministers & sector leaders)
CREATE TABLE IF NOT EXISTS public.ministry_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry_slug text NOT NULL REFERENCES public.ministries(slug) ON DELETE CASCADE,
  full_name text NOT NULL,
  full_name_ar text,
  role text NOT NULL,
  party text,
  mandate_start text DEFAULT '2021',
  mandate_end text DEFAULT '2026',
  bio text,
  photo_path text,
  display_order integer DEFAULT 1,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Link articles directly to ministries via ministry_slug
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS ministry_slug text;

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_ministries_group ON public.ministries(group_id, number);
CREATE INDEX IF NOT EXISTS idx_ministry_profiles_slug ON public.ministry_profiles(ministry_slug);
CREATE INDEX IF NOT EXISTS idx_ministry_profiles_published ON public.ministry_profiles(is_published, display_order);
CREATE INDEX IF NOT EXISTS idx_articles_ministry_slug ON public.articles(ministry_slug) WHERE ministry_slug IS NOT NULL;

-- 6. Row Level Security (RLS)
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministry_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ministries' AND policyname = 'Public can view active ministries'
  ) THEN
    CREATE POLICY "Public can view active ministries"
      ON public.ministries FOR SELECT
      USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ministries' AND policyname = 'Admins can manage ministries'
  ) THEN
    CREATE POLICY "Admins can manage ministries"
      ON public.ministries FOR ALL
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
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ministry_profiles' AND policyname = 'Public can view published ministry profiles'
  ) THEN
    CREATE POLICY "Public can view published ministry profiles"
      ON public.ministry_profiles FOR SELECT
      USING (is_published = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ministry_profiles' AND policyname = 'Admins can manage ministry profiles'
  ) THEN
    CREATE POLICY "Admins can manage ministry profiles"
      ON public.ministry_profiles FOR ALL
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
