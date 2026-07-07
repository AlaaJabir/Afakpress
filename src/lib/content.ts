export type Article = {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  region: string;
  province: string;
  commune: string;
  image: string;
  publishedAt: string;
  author: string;
  slug: string;
  featured?: boolean;
  breaking?: boolean;
  mostRead?: boolean;
};

export type RegionNode = {
  name: string;
  slug: string;
  provinces: Array<{
    name: string;
    slug: string;
    communes: Array<{ name: string; slug: string }>;
  }>;
};

export const regions: RegionNode[] = [
  {
    name: "طنجة تطوان الحسيمة",
    slug: "tanger-tetouan-al-hoceima",
    provinces: [
      { name: "طنجة أصيلة", slug: "tanger-asilah", communes: [{ name: "طنجة", slug: "tanger" }, { name: "أصيلة", slug: "asilah" }] },
      { name: "القصر الكبير", slug: "ksar-el-kebir", communes: [{ name: "القصر الكبير", slug: "ksar-el-kebir" }] },
    ],
  },
  {
    name: "الشرق",
    slug: "loriental",
    provinces: [{ name: "وجدة أنكاد", slug: "oujda-angad", communes: [{ name: "وجدة", slug: "oujda" }] }],
  },
  {
    name: "فاس مكناس",
    slug: "fes-meknes",
    provinces: [{ name: "فاس", slug: "fes", communes: [{ name: "فاس", slug: "fes" }] }],
  },
  {
    name: "الرباط سلا القنيطرة",
    slug: "rabat-sale-kenitra",
    provinces: [{ name: "الرباط", slug: "rabat", communes: [{ name: "الرباط", slug: "rabat" }] }],
  },
  {
    name: "بني ملال خنيفرة",
    slug: "beni-mellal-khenifra",
    provinces: [{ name: "بني ملال", slug: "beni-mellal", communes: [{ name: "بني ملال", slug: "beni-mellal" }] }],
  },
  {
    name: "الدار البيضاء سطات",
    slug: "casablanca-settat",
    provinces: [{ name: "الدار البيضاء", slug: "casablanca", communes: [{ name: "الدار البيضاء", slug: "casablanca" }] }],
  },
  {
    name: "مراكش آسفي",
    slug: "marrakech-safi",
    provinces: [{ name: "مراكش", slug: "marrakech", communes: [{ name: "مراكش", slug: "marrakech" }] }],
  },
  {
    name: "درعة تافيلالت",
    slug: "draa-tafilalet",
    provinces: [{ name: "ورزازات", slug: "ouarzazate", communes: [{ name: "ورزازات", slug: "ouarzazate" }] }],
  },
  {
    name: "سوس ماسة",
    slug: "souss-massa",
    provinces: [{ name: "أكادير", slug: "agadir", communes: [{ name: "أكادير", slug: "agadir" }] }],
  },
  {
    name: "كلميم واد نون",
    slug: "guelmim-es-smara",
    provinces: [{ name: "كلميم", slug: "guelmim", communes: [{ name: "كلميم", slug: "guelmim" }] }],
  },
  {
    name: "العيون الساقية الحمراء",
    slug: "laayoune-sakia-el-hamra",
    provinces: [{ name: "العيون", slug: "laayoune", communes: [{ name: "العيون", slug: "laayoune" }] }],
  },
  {
    name: "الداخلة وادي الذهب",
    slug: "dakhla-oued-eddahab",
    provinces: [{ name: "الداخلة", slug: "dakhla", communes: [{ name: "الداخلة", slug: "dakhla" }] }],
  },
];

export const articles: Article[] = [
  {
    id: 1,
    title: "المغرب يسرّع وتيرة الإصلاحات لتقوية جاذبية الاستثمار",
    excerpt: "تستعد المملكة لرفع كفاءة البنية التحتية وتبسيط الإجراءات أمام المستثمرين في قطاعات رئيسية.",
    category: "اقتصاد",
    region: "الرباط سلا القنيطرة",
    province: "الرباط",
    commune: "الرباط",
    image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2026-07-07",
    author: "سلمى بنشريفة",
    slug: "maroc-accelere-reformes-attractivite-economique",
    featured: true,
    breaking: true,
  },
  {
    id: 2,
    title: "الدار البيضاء تفتح أبوابها لوجة جديدة من النقل الحضري",
    excerpt: "مشروع كبير يهدف إلى خفض الازدحام وزيادة الربط بين الأحياء والتجمعات الجديدة.",
    category: "مدينة",
    region: "الدار البيضاء سطات",
    province: "الدار البيضاء",
    commune: "الدار البيضاء",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2026-07-06",
    author: "يوسف القادري",
    slug: "casablanca-prep-new-generation-transports-urbains",
    breaking: true,
  },
  {
    id: 3,
    title: "الثقافة المغربية تعزز حضورها على الساحة الدولية",
    excerpt: "تسجل المهرجانات والفعاليات المغربية حضوراً متزايدا في الفضاءات الثقافية الأوروبية والأفريقية.",
    category: "ثقافة",
    region: "فاس مكناس",
    province: "فاس",
    commune: "فاس",
    image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2026-07-05",
    author: "مريم السلاوي",
    slug: "culture-marocaine-s-affirme-a-l-international",
  },
  {
    id: 4,
    title: "طنجة تستثمر في التحول الطاقي ضمن رؤية مناخية جديدة",
    excerpt: "أطلقت المدينة شراكات حديثة لترقية الطاقات المتجددة وتقليل انبعاثات الكربون.",
    category: "بيئة",
    region: "طنجة تطوان الحسيمة",
    province: "طنجة أصيلة",
    commune: "طنجة",
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2026-07-04",
    author: "عبد الإله بوشعيب",
    slug: "tanger-investit-transition-energetique",
    mostRead: true,
  },
  {
    id: 5,
    title: "الانتخابات المحلية تفتح نقاشاً جديداً حول الحكم المحلي",
    excerpt: "يتطلع المواطنون إلى المزيد من الرقابة والشفافية في تسيير الجماعات المحلية.",
    category: "سياسة",
    region: "مراكش آسفي",
    province: "مراكش",
    commune: "مراكش",
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2026-07-03",
    author: "نادية الزاير",
    slug: "elections-locales-ouvre-debat-gouvernance",
  },
  {
    id: 6,
    title: "المغرب يرفع سقف التنافسية في قطاع الخدمات الرقمية",
    excerpt: "تستقطب الشركات الناشئة مزيداً من الاستثمار مع نمو الاقتصاد الرقمي.",
    category: "اقتصاد",
    region: "الدار البيضاء سطات",
    province: "الدار البيضاء",
    commune: "الدار البيضاء",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2026-07-02",
    author: "هشام العلوي",
    slug: "maroc-hausse-competitivite-services-numeriques",
  },
];

export function getArticleBySlug(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getArticlesByCategory(category: string) {
  return articles.filter((article) => article.category === category);
}

export function getArticlesByRegion(region: string) {
  return articles.filter((article) => article.region === region);
}
