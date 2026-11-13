export type ThirteenthRegionArticle = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  regionId: string;
  countryId: string;
  countryName: string;
  category: string;
  imageUrl: string;
  author: string;
  publishedAt: string;
  readTime: string;
  status: "published" | "draft";
  isFeatured: boolean;
  isBreaking: boolean;
  views: number;
  sourceUrl: string;
};

const SOURCE_URL = "https://13emeregion.vercel.app/";

export const FALLBACK_13EME_ARTICLES: ThirteenthRegionArticle[] = [
  {
    id: "art-1",
    title: "اختتام أعمال القمة الاقتصادية المشتركة في العاصمة بتوقيع مذكرات تفاهم تاريخية لتعزيز التعاون",
    excerpt: "توافق دولي واسع على حماية سلاسل الإمداد العالمية وتطوير خطط الاستجابة السريعة للأزمات الاقتصادية وتأمين الممرات البحرية.",
    content:
      "في ختام مداولات استمرت ثلاثة أيام في جنيف، توصل ممثلو الدول المشاركة في المؤتمر الدولي إلى إعلان مشترك يتضمن حزمة من التدابير التنظيمية لحماية خطوط الملاحة التجارية وتعزيز استقرار أسواق الطاقة.\n\nوشدد البيان الختامي الصادر عن الأمانة العامة للمؤتمر على أهمية التنسيق المشترك بين غرف التجارة البحرية والمنظمات الإقليمية، مشيراً إلى أن المرحلة الراهنة تتطلب تعزيز تبادل البيانات وتحديث بروتوكولات الأمان في الموانئ الرئيسية.\n\nوأكدت الوفود الدبلوماسية المشاركة أن بنود الاتفاقية ستدخل حيز التنفيذ الاسترشادي خلال الربع الأول من العام المقبل، مع تشكيل لجان متابعة دائمة تعقد اجتماعاتها دورياً لمراجعة معدلات التدفق التجاري وتذليل أي عقبات لوجستية.",
    regionId: "europe",
    countryId: "ch",
    countryName: "سويسرا",
    category: "سياسة ودبلوماسية",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
    author: "يوسف الكردي — مكتب باريس",
    publishedAt: "21 سبتمبر 2026",
    readTime: "4 دقائق قراءة",
    status: "published",
    isFeatured: true,
    isBreaking: true,
    views: 482,
    sourceUrl: SOURCE_URL,
  },
  {
    id: "art-2",
    title: "تقرير: استثمارات الطاقة النظيفة في شمال إفريقيا تسجل قفزة نوعية بنسبة 28% خلال العام الجاري",
    excerpt: "تسارع ملحوظ في مشاريع الهيدروجين الأخضر ومحطات الطاقة الشمسية المشتركة بين الدول العربية والاتحاد الأوروبي خلال النصف الثاني من العام الجاري.",
    content:
      "أظهرت دراسة رصدية حديثة صادرة عن قسم التحليلات الاقتصادية بالوكالة نمواً قياسياً في تدفقات رؤوس الأموال الموجهة لمشروعات الطاقة النظيفة عبر دول المغرب العربي وشمال إفريقيا.\n\nويشير التقرير إلى أن الاستثمارات الملتزم بها تجاوزت التقديرات الأولية بنسبة 28%، مدفوعة بالشراكات الاستراتيجية مع كبريات الشركات الصناعية الأوروبية والآسيوية.\n\nوتحتل مشاريع توليد الكهرباء من الطاقة الشمسية في الصحراء الكبرى وإنتاج مشتقات الهيدروجين الموجهة للتصدير صدارة الاهتمامات التنموية، مما يعزز موقع المنطقة كمحور طاقي مستدام يربط القارتين.",
    regionId: "arab-world",
    countryId: "dz",
    countryName: "الجزائر",
    category: "اقتصاد وتنمية",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    author: "سارة العلمي — وحدة الرصد الاقتصادي",
    publishedAt: "28 أغسطس 2026",
    readTime: "5 دقائق قراءة",
    status: "published",
    isFeatured: false,
    isBreaking: false,
    views: 268,
    sourceUrl: SOURCE_URL,
  },
  {
    id: "art-3",
    title: "طوكيو وسيول تعززان التنسيق التقني لتطوير أشباه الموصلات وسلاسل توريد الذكاء الاصطناعي",
    excerpt: "اتفاق ثنائي رفيع المستوى لتوحيد المعايير الفنية وتوسيع التعاون بين مراكز الأبحاث في كوريا الجنوبية واليابان لمواكبة متطلبات التحول الرقمي.",
    content:
      "أعلنت وزارتا التجارة والصناعة في كل من طوكيو وسيول عن تدشين إطار عمل تقني جديد يهدف إلى ترسيخ التعاون في صناعة الرقائق الإلكترونية المتقدمة.\n\nويهدف هذا التحالف إلى تبادل الخبرات الأكاديمية بين الجامعات ومعاهد البحوث التكنولوجية في كلا البلدين، إضافة إلى تأمين إمدادات المعادن النادرة والمواد الكيميائية الفائقة النقاء اللازمة لتصنيع المعالجات الحديثة.",
    regionId: "asia-pacific",
    countryId: "jp",
    countryName: "اليابان",
    category: "شؤون دولية",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    author: "كينجي ناكامورا — مكتب طوكيو",
    publishedAt: "2 سبتمبر 2026",
    readTime: "3 دقائق قراءة",
    status: "published",
    isFeatured: false,
    isBreaking: false,
    views: 194,
    sourceUrl: SOURCE_URL,
  },
  {
    id: "art-4",
    title: "قمة نيروبي للمناخ تدعو إلى مضاعفة تمويل البنية التحتية المقاومة للجفاف في إفريقيا",
    excerpt: "وزراء التنمية الأفارقة يطالبون البنوك الدولية بآليات تمويل تفضيلية لدعم المجتمعات الزراعية في منطقة الساحل وحوض بحيرة تشاد.",
    content:
      "شدد المشاركون في الاجتماع الوزاري التنسيقي الذي اختتم أعماله اليوم في العاصمة الكينية نيروبي على ضرورة الوفاء بالتعهدات المالية الخاصة بصناديق التكيف المناخي.\n\nوأوضح التقرير النهائي أن تأخر التدفقات المالية المخصصة لبناء السدود وقنوات الري الحديثة أثر سلباً على برامج الأمن الغذائي في أكثر من 12 دولة إفريقية. ودعا المؤتمرون إلى تأسيس آلية رصد مستقلة تراقب سرعة صرف المساعدات وتضمن وصولها إلى المشروعات الميدانية الأكثر إلحاحاً.",
    regionId: "africa",
    countryId: "ke",
    countryName: "كينيا",
    category: "تحقيق صحفي",
    imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
    author: "أومارو سيسوكو — نيروبي",
    publishedAt: "16 أغسطس 2026",
    readTime: "6 دقائق قراءة",
    status: "published",
    isFeatured: false,
    isBreaking: false,
    views: 112,
    sourceUrl: SOURCE_URL,
  },
  {
    id: "art-5",
    title: "اجتماع ميركوسور في بوينس آيرس يبحث تحديث الاتفاقيات التجارية مع الأسواق العالمية",
    excerpt: "دول أمريكا الجنوبية تتفق على تبسيط الإجراءات الجمركية لتعزيز صادرات المنتجات الزراعية والصناعات الخفيفة.",
    content:
      "عقد قادة المجموعة الاقتصادية لدول المخروط الجنوبي اجتماعاً استثنائياً في العاصمة الأرجنتينية لبحث آفاق توسيع المبادلات التجارية مع دول آسيا والمحيط الهادئ.\n\nوتضمن جدول الأعمال مراجعة التعريفات الجمركية البينية وسبل تعزيز التبادل بالعملات المحلية لتقليل أعباء تكاليف التحويل المصرفي على الشركات الصغيرة والمتوسطة المصدرة.",
    regionId: "americas",
    countryId: "ar",
    countryName: "الأرجنتين",
    category: "اقتصاد وتنمية",
    imageUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80",
    author: "ماركوس غونزاليس — بوينس آيرس",
    publishedAt: "15 يونيو 2026",
    readTime: "4 دقائق قراءة",
    status: "published",
    isFeatured: false,
    isBreaking: false,
    views: 328,
    sourceUrl: SOURCE_URL,
  },
  {
    id: "art-6",
    title: "مراجعة تشريعية موسعة للسياسات الرقمية وحماية البيانات في الفضاء الإلكتروني الإقليمي",
    excerpt: "خبراء القانون الدولي يوصون بأطر تنظيمية موحدة تحمي الخصوصية وتكافح الهجمات السيبرانية العابرة للحدود.",
    content:
      "أوصى الملتقى الدولي للأمن الرقمي بضرورة صياغة بروتوكولات حماية متطورة تتوافق مع التطور المتسارع لأنظمة الذكاء الاصطناعي والحوسبة السحابية.",
    regionId: "europe",
    countryId: "fr",
    countryName: "فرنسا",
    category: "سياسة ودبلوماسية",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
    author: "ستيفن جوبير — محرر الشؤون القانونية",
    publishedAt: "18 سبتمبر 2026",
    readTime: "5 دقائق قراءة",
    status: "published",
    isFeatured: false,
    isBreaking: false,
    views: 245,
    sourceUrl: SOURCE_URL,
  },
  {
    id: "art-7",
    title: "انتعاش السياحة الثقافية والمعالم التاريخية في منطقة حوض البحر الأبيض المتوسط",
    excerpt: "ارتفاع في الحجوزات وتطوير البنية التحتية للمواقع التراثية المسجلة لدى اليونسكو خلال موسم الخريف الحالي.",
    content:
      "سجلت هيئات تنشيط السياحة المتوسطية زيادة لافتة في إقبال الزوار على المتاحف والمواقع الأثرية، مستفيدة من التسهيلات الممنوحة للمسافرين وتدشين مسارات سياحية مشتركة.",
    regionId: "arab-world",
    countryId: "eg",
    countryName: "مصر",
    category: "شؤون دولية",
    imageUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80",
    author: "ليلى البغدادي — القاهرة",
    publishedAt: "18 سبتمبر 2026",
    readTime: "3 دقائق قراءة",
    status: "published",
    isFeatured: false,
    isBreaking: false,
    views: 189,
    sourceUrl: SOURCE_URL,
  },
];

function extractStringField(block: string, key: string): string {
  const regex = new RegExp(`(?:^|[,{]\\s*)${key}:([\`"'])([\\s\\S]*?)\\1`);
  const match = block.match(regex);
  if (!match) return "";
  return match[2]
    .replace(/\\n/g, "\n")
    .replace(/\\`/g, "`")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .trim();
}

function extractBooleanField(block: string, key: string): boolean {
  const regex = new RegExp(`(?:^|[,{]\\s*)${key}:(true|false|!0|!1)`);
  const match = block.match(regex);
  if (!match) return false;
  return match[1] === "true" || match[1] === "!0";
}

function extractNumberField(block: string, key: string): number {
  const regex = new RegExp(`(?:^|[,{]\\s*)${key}:(\\d+)`);
  const match = block.match(regex);
  return match ? Number.parseInt(match[1], 10) || 0 : 0;
}

function splitTopLevelObjects(arrayBody: string): string[] {
  const objects: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let escape = false;
  let start = -1;

  for (let i = 0; i < arrayBody.length; i += 1) {
    const ch = arrayBody[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "`" || ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === "{") {
      if (depth === 0) start = i;
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0 && start !== -1) {
        objects.push(arrayBody.slice(start, i + 1));
        start = -1;
      }
    }
  }

  return objects;
}

function parseArticlesFromBundle(jsSource: string): ThirteenthRegionArticle[] {
  const markerIndex = jsSource.indexOf("press_portal_articles_v1");
  if (markerIndex === -1) return [];

  const searchWindowStart = Math.max(0, markerIndex - 60000);
  const windowSlice = jsSource.slice(searchWindowStart, markerIndex);
  const arrayStartRel = windowSlice.lastIndexOf("[{id:");
  if (arrayStartRel === -1) return [];

  const arrayEndRel = windowSlice.lastIndexOf("]");
  if (arrayEndRel <= arrayStartRel) return [];

  const arrayContent = windowSlice.slice(arrayStartRel + 1, arrayEndRel);
  const blocks = splitTopLevelObjects(arrayContent);

  const parsed: ThirteenthRegionArticle[] = [];
  for (const block of blocks) {
    const id = extractStringField(block, "id");
    const title = extractStringField(block, "title");
    if (!id || !title) continue;

    const statusRaw = extractStringField(block, "status");
    const status = statusRaw === "draft" ? "draft" : "published";
    if (status !== "published") continue;

    const rawImage = extractStringField(block, "imageUrl");
    const imageUrl =
      rawImage.startsWith("http://") || rawImage.startsWith("https://")
        ? rawImage
        : rawImage.startsWith("/")
          ? `https://13emeregion.vercel.app${rawImage}`
          : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80";

    parsed.push({
      id,
      title,
      excerpt: extractStringField(block, "excerpt"),
      content: extractStringField(block, "content"),
      regionId: extractStringField(block, "regionId") || "international",
      countryId: extractStringField(block, "countryId"),
      countryName: extractStringField(block, "countryName") || "العالم",
      category: extractStringField(block, "category") || "الجهة الثالثة عشرة",
      imageUrl,
      author: extractStringField(block, "author") || "الجهة الثالثة عشرة",
      publishedAt: extractStringField(block, "publishedAt") || "2026",
      readTime: extractStringField(block, "readTime") || "3 دقائق قراءة",
      status,
      isFeatured: extractBooleanField(block, "isFeatured"),
      isBreaking: extractBooleanField(block, "isBreaking"),
      views: extractNumberField(block, "views"),
      sourceUrl: SOURCE_URL,
    });
  }

  return parsed;
}

export async function fetchThirteenthRegionArticles(): Promise<ThirteenthRegionArticle[]> {
  try {
    const htmlRes = await fetch(SOURCE_URL, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(6000),
      headers: {
        "User-Agent": "AfakpressBot/1.0 (+https://afakpress.ma)",
      },
    });
    if (!htmlRes.ok) return FALLBACK_13EME_ARTICLES;

    const html = await htmlRes.text();
    const scriptMatch = html.match(/src="(\/assets\/[^"]+\.js)"/);
    if (!scriptMatch) return FALLBACK_13EME_ARTICLES;

    const bundleUrl = `${SOURCE_URL.replace(/\/$/, "")}${scriptMatch[1]}`;
    const jsRes = await fetch(bundleUrl, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(6000),
      headers: {
        "User-Agent": "AfakpressBot/1.0 (+https://afakpress.ma)",
      },
    });
    if (!jsRes.ok) return FALLBACK_13EME_ARTICLES;

    const jsText = await jsRes.text();
    const articles = parseArticlesFromBundle(jsText);
    return articles.length > 0 ? articles : FALLBACK_13EME_ARTICLES;
  } catch {
    return FALLBACK_13EME_ARTICLES;
  }
}

export async function getThirteenthRegionArticleById(id: string): Promise<ThirteenthRegionArticle | null> {
  const articles = await fetchThirteenthRegionArticles();
  const decoded = decodeURIComponent(id).trim();
  return articles.find((article) => article.id === decoded) ?? null;
}
