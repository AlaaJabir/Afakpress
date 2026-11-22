export interface MinistryGroup {
  id: string;
  nameAr: string;
  descriptionAr: string;
}

export interface MinistryItem {
  number: number;
  slug: string;
  nameAr: string;
  groupId: string;
  groupNameAr: string;
  keywords: string[];
}

export const MINISTRY_GROUPS: MinistryGroup[] = [
  {
    id: "presidency",
    nameAr: "رئاسة الحكومة",
    descriptionAr: "رئاسة الحكومة والأمانة العامة للحكومة",
  },
  {
    id: "sovereign",
    nameAr: "الوزارات السيادية",
    descriptionAr: "الداخلية، الخارجية، العدل، الأوقاف، الدفاع والعلاقات مع البرلمان",
  },
  {
    id: "economic",
    nameAr: "الوزارات الاقتصادية",
    descriptionAr: "المالية، التجهيز، الفلاحة، الصناعة، الطاقة، النقل، السياحة والتحول الرقمي",
  },
  {
    id: "urban",
    nameAr: "وزارات التعمير والتراب",
    descriptionAr: "إعداد التراب الوطني والتعمير والإسكان وسياسة المدينة",
  },
  {
    id: "education",
    nameAr: "وزارات التعليم والتكوين",
    descriptionAr: "التربية الوطنية، التعليم العالي، التعليم الأولي والتكوين المهني",
  },
  {
    id: "social",
    nameAr: "الوزارات الاجتماعية",
    descriptionAr: "الصحة، التشغيل، الأسرة، الشباب والثقافة والرياضة والإدماج الاجتماعي",
  },
  {
    id: "delegated",
    nameAr: "وزارات منتدبة أخرى",
    descriptionAr: "التجارة الخارجية، الصيد البحري، الصناعة التقليدية والاقتصاد التضامني",
  },
];

export const MOROCCAN_MINISTRIES: MinistryItem[] = [
  // 1. رئاسة الحكومة
  {
    number: 1,
    slug: "presidence-du-gouvernement",
    nameAr: "رئاسة الحكومة",
    groupId: "presidency",
    groupNameAr: "رئاسة الحكومة",
    keywords: ["الحكومة", "رئاسة الحكومة", "مجلس الحكومة", "الوزير"],
  },
  {
    number: 2,
    slug: "secretariat-general-du-gouvernement",
    nameAr: "الأمانة العامة للحكومة",
    groupId: "presidency",
    groupNameAr: "رئاسة الحكومة",
    keywords: ["الأمانة العامة للحكومة", "تشريع", "مراسيم", "الجريدة الرسمية"],
  },

  // 2. الوزارات السيادية
  {
    number: 3,
    slug: "interieur",
    nameAr: "وزارة الداخلية",
    groupId: "sovereign",
    groupNameAr: "الوزارات السيادية",
    keywords: ["الداخلية", "الجهة", "العمالة", "الإقليم", "الجماعة", "الأمن"],
  },
  {
    number: 4,
    slug: "affaires-etrangeres",
    nameAr: "وزارة الشؤون الخارجية والتعاون الإفريقي والمغاربة المقيمين بالخارج",
    groupId: "sovereign",
    groupNameAr: "الوزارات السيادية",
    keywords: ["الخارجية", "الدبلوماسية", "إفريقيا", "الجالية", "المغاربة المقيمين بالخارج"],
  },
  {
    number: 5,
    slug: "justice",
    nameAr: "وزارة العدل",
    groupId: "sovereign",
    groupNameAr: "الوزارات السيادية",
    keywords: ["العدل", "القضاء", "المحاكم", "التشريع"],
  },
  {
    number: 6,
    slug: "habous-et-affaires-islamiques",
    nameAr: "وزارة الأوقاف والشؤون الإسلامية",
    groupId: "sovereign",
    groupNameAr: "الوزارات السيادية",
    keywords: ["الأوقاف", "الشؤون الإسلامية", "المساجد", "رمضان"],
  },
  {
    number: 7,
    slug: "administration-defense-nationale",
    nameAr: "الوزارة المنتدبة لدى رئيسة الحكومة المكلفة بإدارة الدفاع الوطني",
    groupId: "sovereign",
    groupNameAr: "الوزارات السيادية",
    keywords: ["الدفاع", "القوات المسلحة", "الوطني"],
  },
  {
    number: 8,
    slug: "relations-avec-le-parlement",
    nameAr: "الوزارة المنتدبة لدى رئيسة الحكومة المكلفة بالعلاقات مع البرلمان والمجتمع المدني",
    groupId: "sovereign",
    groupNameAr: "الوزارات السيادية",
    keywords: ["البرلمان", "المجتمع المدني", "مجلس النواب", "مجلس المستشارين"],
  },

  // 3. الوزارات الاقتصادية
  {
    number: 9,
    slug: "economie-et-finances",
    nameAr: "وزارة الاقتصاد والمالية والنجاعة العمومية",
    groupId: "economic",
    groupNameAr: "الوزارات الاقتصادية",
    keywords: ["الاقتصاد", "المالية", "الضرائب", "الميزانية", "قانون المالية"],
  },
  {
    number: 10,
    slug: "equipement-eau-et-forets",
    nameAr: "وزارة التجهيز والماء والغابات",
    groupId: "economic",
    groupNameAr: "الوزارات الاقتصادية",
    keywords: ["التجهيز", "الماء", "السدود", "الطرق", "الغابات"],
  },
  {
    number: 11,
    slug: "agriculture-peche-et-souverainete-alimentaire",
    nameAr: "وزارة الفلاحة والصيد البحري والسيادة الغذائية",
    groupId: "economic",
    groupNameAr: "الوزارات الاقتصادية",
    keywords: ["الفلاحة", "الزراعة", "الصيد البحري", "السيادة الغذائية"],
  },
  {
    number: 12,
    slug: "industrie-commerce-et-investissement",
    nameAr: "وزارة الصناعة والتجارة والاستثمار والإدماج الاقتصادي",
    groupId: "economic",
    groupNameAr: "الوزارات الاقتصادية",
    keywords: ["الصناعة", "التجارة", "الاستثمار", "المقاولات", "رواد الأعمال"],
  },
  {
    number: 13,
    slug: "energie-mines-et-developpement-durable",
    nameAr: "وزارة الطاقة والمعادن والتنمية المستدامة",
    groupId: "economic",
    groupNameAr: "الوزارات الاقتصادية",
    keywords: ["الطاقة", "المعادن", "البيئة", "التنمية المستدامة", "الطاقات المتجددة"],
  },
  {
    number: 14,
    slug: "transport-et-logistique",
    nameAr: "وزارة النقل واللوجيستيك",
    groupId: "economic",
    groupNameAr: "الوزارات الاقتصادية",
    keywords: ["النقل", "اللوجيستيك", "الموانئ", "المطارات", "السكك"],
  },
  {
    number: 15,
    slug: "tourisme-artisanat-et-economie-solidaire",
    nameAr: "وزارة السياحة والصناعة التقليدية والاقتصاد التضامني",
    groupId: "economic",
    groupNameAr: "الوزارات الاقتصادية",
    keywords: ["السياحة", "الصناعة التقليدية", "الاقتصاد التضامني", "التعاونيات"],
  },
  {
    number: 16,
    slug: "intelligence-artificielle-et-transition-numerique",
    nameAr: "وزارة الذكاء الاصطناعي والتحول الرقمي وإصلاح الإدارة",
    groupId: "economic",
    groupNameAr: "الوزارات الاقتصادية",
    keywords: ["الذكاء الاصطناعي", "التحول الرقمي", "الرقمنة", "إصلاح الإدارة"],
  },

  // 4. وزارات التعمير والتراب
  {
    number: 17,
    slug: "amenagement-du-territoire-urbanisme-et-habitat",
    nameAr: "وزارة إعداد التراب الوطني والتعمير والإسكان وسياسة المدينة",
    groupId: "urban",
    groupNameAr: "وزارات التعمير والتراب",
    keywords: ["التعمير", "الإسكان", "إعداد التراب", "سياسة المدينة"],
  },
  {
    number: 18,
    slug: "deleguee-habitat-et-politique-de-la-ville",
    nameAr: "الوزارة المنتدبة لدى وزير إعداد التراب الوطني المكلفة بالإسكان وسياسة المدينة",
    groupId: "urban",
    groupNameAr: "وزارات التعمير والتراب",
    keywords: ["الإسكان", "سياسة المدينة", "السكن"],
  },

  // 5. وزارات التعليم والتكوين
  {
    number: 19,
    slug: "education-nationale-prescolaire-et-formation-professionnelle",
    nameAr: "وزارة التربية الوطنية والتعليم الأولي والتكوين المهني والتأهيل",
    groupId: "education",
    groupNameAr: "وزارات التعليم والتكوين",
    keywords: ["التربية الوطنية", "التعليم", "المدارس", "التكوين المهني"],
  },
  {
    number: 20,
    slug: "enseignement-superieur-recherche-et-innovation",
    nameAr: "وزارة التعليم العالي والبحث العلمي والابتكار",
    groupId: "education",
    groupNameAr: "وزارات التعليم والتكوين",
    keywords: ["التعليم العالي", "الجامعات", "البحث العلمي", "الابتكار"],
  },
  {
    number: 21,
    slug: "deleguee-prescolaire-et-lutte-contre-abandon-scolaire",
    nameAr: "الوزارة المنتدبة لدى وزير التربية الوطنية المكلفة بالتعليم الأولي ومحاربة الهدر المدرسي",
    groupId: "education",
    groupNameAr: "وزارات التعليم والتكوين",
    keywords: ["التعليم الأولي", "الهدر المدرسي", "التمدرس"],
  },
  {
    number: 22,
    slug: "deleguee-formation-professionnelle-et-qualification",
    nameAr: "الوزارة المنتدبة لدى وزير التربية الوطنية المكلفة بالتكوين المهني والتأهيل",
    groupId: "education",
    groupNameAr: "وزارات التعليم والتكوين",
    keywords: ["التكوين المهني", "التأهيل", "التشغيل"],
  },

  // 6. الوزارات الاجتماعية
  {
    number: 23,
    slug: "sante-et-protection-sociale",
    nameAr: "وزارة الصحة والحماية الاجتماعية",
    groupId: "social",
    groupNameAr: "الوزارات الاجتماعية",
    keywords: ["الصحة", "الحماية الاجتماعية", "المستشفيات", "التغطية الصحية"],
  },
  {
    number: 24,
    slug: "emploi-et-dialogue-social",
    nameAr: "وزارة التشغيل والحوار الاجتماعي",
    groupId: "social",
    groupNameAr: "الوزارات الاجتماعية",
    keywords: ["التشغيل", "الحوار الاجتماعي", "الشغل", "العمال"],
  },
  {
    number: 25,
    slug: "famille-developpement-social-et-egalite",
    nameAr: "وزارة الأسرة والتنمية الاجتماعية والمساواة",
    groupId: "social",
    groupNameAr: "الوزارات الاجتماعية",
    keywords: ["الأسرة", "المرأة", "التنمية الاجتماعية", "المساواة"],
  },
  {
    number: 26,
    slug: "jeunesse-culture-et-sport",
    nameAr: "وزارة الشباب والثقافة والرياضة",
    groupId: "social",
    groupNameAr: "الوزارات الاجتماعية",
    keywords: ["الشباب", "الثقافة", "الرياضة", "المسرح", "كرة القدم"],
  },
  {
    number: 27,
    slug: "deleguee-chargee-de-la-jeunesse",
    nameAr: "الوزارة المنتدبة لدى وزير الشباب المكلفة بالشباب",
    groupId: "social",
    groupNameAr: "الوزارات الاجتماعية",
    keywords: ["الشباب", "دور الشباب", "مبادرات شبابية"],
  },
  {
    number: 28,
    slug: "deleguee-inclusion-sociale",
    nameAr: "الوزارة المنتدبة لدى وزيرة الأسرة المكلفة بالإدماج الاجتماعي",
    groupId: "social",
    groupNameAr: "الوزارات الاجتماعية",
    keywords: ["الإدماج الاجتماعي", "التضامن", "التنمية الاجتماعية"],
  },

  // 7. وزارات منتدبة أخرى
  {
    number: 29,
    slug: "deleguee-commerce-exterieur",
    nameAr: "الوزارة المنتدبة لدى وزير الصناعة المكلفة بالتجارة الخارجية",
    groupId: "delegated",
    groupNameAr: "وزارات منتدبة أخرى",
    keywords: ["التجارة الخارجية", "الصادرات", "التجارة"],
  },
  {
    number: 30,
    slug: "deleguee-peche-maritime",
    nameAr: "الوزارة المنتدبة لدى وزير الفلاحة المكلفة بالصيد البحري",
    groupId: "delegated",
    groupNameAr: "وزارات منتدبة أخرى",
    keywords: ["الصيد البحري", "البحر", "الموانئ"],
  },
  {
    number: 31,
    slug: "deleguee-artisanat-et-economie-solidaire",
    nameAr: "الوزارة المنتدبة لدى وزير السياحة المكلفة بالصناعة التقليدية والاقتصاد التضامني",
    groupId: "delegated",
    groupNameAr: "وزارات منتدبة أخرى",
    keywords: ["الصناعة التقليدية", "الاقتصاد التضامني", "التعاونيات"],
  },
];

export function getMinistryBySlug(slug: string): MinistryItem | null {
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    decoded = slug;
  }
  return MOROCCAN_MINISTRIES.find((m) => m.slug === decoded) ?? null;
}
