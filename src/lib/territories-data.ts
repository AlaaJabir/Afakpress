import { moroccoRegions } from "@/data/morocco-regions";

export type TerritoryType = "region" | "province" | "commune";

export interface TerritoryRegion {
  id: string;
  slug: string;
  arabicSlug: string;
  name: string;
  nameFr: string;
  nameAr: string;
  code: string;
  col: string;
  row: string;
  population: number;
  provincesCount: number;
  communesCount: number;
  sortOrder: number;
}

export interface TerritoryProvince {
  id: string;
  slug: string;
  regionSlug: string;
  regionNameFr: string;
  name: string;
  nameFr: string;
  nameAr: string;
  kind: "province" | "prefecture";
  population: number;
  communesCount: number;
}

export interface TerritoryCommune {
  id: string;
  slug: string;
  provinceSlug: string;
  regionSlug: string;
  name: string;
  nameFr: string;
  nameAr: string;
  kind: "urbaine" | "rurale";
  population: number;
  address?: string;
  phone?: string;
  website?: string;
}

export interface OfficialProfile {
  id: string;
  territoryType: TerritoryType;
  regionId?: string;
  provinceId?: string;
  communeId?: string;
  regionSlug?: string;
  provinceSlug?: string;
  communeSlug?: string;
  fullName: string;
  fullNameAr?: string;
  role: string;
  house?: "conseil" | "chambre_representants" | "chambre_conseillers";
  party?: string;
  mandateStart: string;
  mandateEnd: string;
  bio?: string;
  photoUrl?: string;
  displayOrder: number;
  isPublished: boolean;
}

export interface TerritoryMapEntry {
  id: string;
  territoryType: TerritoryType;
  regionId?: string;
  provinceId?: string;
  communeId?: string;
  regionSlug?: string;
  provinceSlug?: string;
  communeSlug?: string;
  territoryName?: string;
  mapUrl: string;
  caption?: string;
  updatedAt?: string;
}

export interface TerritoryArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  image?: string;
  author?: string;
}

export const REGIONS_12_METADATA: TerritoryRegion[] = [
  {
    id: "tta",
    code: "tta",
    slug: "tanger-tetouan-al-hoceima",
    arabicSlug: "جهة-طنجة-تطوان-الحسيمة",
    name: "Tanger-Tétouan-Al Hoceïma",
    nameFr: "Tanger-Tétouan-Al Hoceïma",
    nameAr: "طنجة - تطوان - الحسيمة",
    col: "2",
    row: "1",
    population: 3975000,
    provincesCount: 8,
    communesCount: 146,
    sortOrder: 1,
  },
  {
    id: "ori",
    code: "ori",
    slug: "oriental",
    arabicSlug: "جهة-الشرق",
    name: "L’Oriental",
    nameFr: "L’Oriental",
    nameAr: "الشرق",
    col: "4 / span 2",
    row: "1 / span 2",
    population: 2450000,
    provincesCount: 8,
    communesCount: 124,
    sortOrder: 2,
  },
  {
    id: "rsk",
    code: "rsk",
    slug: "rabat-sale-kenitra",
    arabicSlug: "جهة-الرباط-سلا-القنيطرة",
    name: "Rabat-Salé-Kénitra",
    nameFr: "Rabat-Salé-Kénitra",
    nameAr: "الرباط - سلا - القنيطرة",
    col: "2",
    row: "2",
    population: 5130000,
    provincesCount: 6,
    communesCount: 114,
    sortOrder: 3,
  },
  {
    id: "fm",
    code: "fm",
    slug: "fes-meknes",
    arabicSlug: "جهة-فاس-مكناس",
    name: "Fès-Meknès",
    nameFr: "Fès-Meknès",
    nameAr: "فاس - مكناس",
    col: "3",
    row: "2",
    population: 4400000,
    provincesCount: 9,
    communesCount: 194,
    sortOrder: 4,
  },
  {
    id: "cs",
    code: "cs",
    slug: "casablanca-settat",
    arabicSlug: "جهة-الدار-البيضاء-سطات",
    name: "Casablanca-Settat",
    nameFr: "Casablanca-Settat",
    nameAr: "الدار البيضاء - سطات",
    col: "2",
    row: "3",
    population: 7680000,
    provincesCount: 8,
    communesCount: 153,
    sortOrder: 5,
  },
  {
    id: "bmk",
    code: "bmk",
    slug: "beni-mellal-khenifra",
    arabicSlug: "جهة-بني-ملال-خنيفرة",
    name: "Béni Mellal-Khénifra",
    nameFr: "Béni Mellal-Khénifra",
    nameAr: "بني ملال - خنيفرة",
    col: "3",
    row: "3",
    population: 2600000,
    provincesCount: 5,
    communesCount: 135,
    sortOrder: 6,
  },
  {
    id: "dt",
    code: "dt",
    slug: "draa-tafilalet",
    arabicSlug: "جهة-درعة-تافلالت",
    name: "Drâa-Tafilalet",
    nameFr: "Drâa-Tafilalet",
    nameAr: "درعة - تافيلالت",
    col: "4 / span 2",
    row: "3 / span 2",
    population: 1700000,
    provincesCount: 5,
    communesCount: 109,
    sortOrder: 7,
  },
  {
    id: "ms",
    code: "ms",
    slug: "marrakech-safi",
    arabicSlug: "جهة-مراكش-اسفي",
    name: "Marrakech-Safi",
    nameFr: "Marrakech-Safi",
    nameAr: "مراكش - آسفي",
    col: "2 / span 2",
    row: "4",
    population: 4780000,
    provincesCount: 8,
    communesCount: 251,
    sortOrder: 8,
  },
  {
    id: "sm",
    code: "sm",
    slug: "souss-massa",
    arabicSlug: "جهة-سوس-ماسة",
    name: "Souss-Massa",
    nameFr: "Souss-Massa",
    nameAr: "سوس - ماسة",
    col: "2 / span 2",
    row: "5",
    population: 2850000,
    provincesCount: 5,
    communesCount: 175,
    sortOrder: 9,
  },
  {
    id: "gon",
    code: "gon",
    slug: "guelmim-oued-noun",
    arabicSlug: "جهة-كلميم-واد-نون",
    name: "Guelmim-Oued Noun",
    nameFr: "Guelmim-Oued Noun",
    nameAr: "كلميم - واد نون",
    col: "1 / span 2",
    row: "6",
    population: 445000,
    provincesCount: 5,
    communesCount: 53,
    sortOrder: 10,
  },
  {
    id: "lsh",
    code: "lsh",
    slug: "laayoune-sakia-el-hamra",
    arabicSlug: "جهة-العيون-الساقية-الحمراء",
    name: "Laâyoune-Sakia El Hamra",
    nameFr: "Laâyoune-Sakia El Hamra",
    nameAr: "العيون - الساقية الحمراء",
    col: "1 / span 2",
    row: "7",
    population: 380000,
    provincesCount: 4,
    communesCount: 20,
    sortOrder: 11,
  },
  {
    id: "dod",
    code: "dod",
    slug: "dakhla-oued-ed-dahab",
    arabicSlug: "جهة-الداخلة-واد-الذهب",
    name: "Dakhla-Oued Ed-Dahab",
    nameFr: "Dakhla-Oued Ed-Dahab",
    nameAr: "الداخلة - وادي الذهب",
    col: "1 / span 2",
    row: "8",
    population: 160000,
    provincesCount: 2,
    communesCount: 13,
    sortOrder: 12,
  },
];

export const REGION_SLUG_ALIASES: Record<string, string> = {
  "tanger-tetouan-al-hoceima": "tanger-tetouan-al-hoceima",
  "tanger-tetouan": "tanger-tetouan-al-hoceima",
  "جهة-طنجة-تطوان-الحسيمة": "tanger-tetouan-al-hoceima",
  "oriental": "oriental",
  "loriental": "oriental",
  "جهة-الشرق": "oriental",
  "rabat-sale-kenitra": "rabat-sale-kenitra",
  "جهة-الرباط-سلا-القنيطرة": "rabat-sale-kenitra",
  "fes-meknes": "fes-meknes",
  "جهة-فاس-مكناس": "fes-meknes",
  "casablanca-settat": "casablanca-settat",
  "جهة-الدار-البيضاء-سطات": "casablanca-settat",
  "beni-mellal-khenifra": "beni-mellal-khenifra",
  "جهة-بني-ملال-خنيفرة": "beni-mellal-khenifra",
  "draa-tafilalet": "draa-tafilalet",
  "جهة-درعة-تافيلالت": "draa-tafilalet",
  "جهة-درعة-تافلالت": "draa-tafilalet",
  "marrakech-safi": "marrakech-safi",
  "جهة-مراكش-اسفي": "marrakech-safi",
  "souss-massa": "souss-massa",
  "جهة-سوس-ماسة": "souss-massa",
  "guelmim-oued-noun": "guelmim-oued-noun",
  "جهة-كلميم-واد-نون": "guelmim-oued-noun",
  "laayoune-sakia-el-hamra": "laayoune-sakia-el-hamra",
  "جهة-العيون-الساقية-الحمراء": "laayoune-sakia-el-hamra",
  "dakhla-oued-ed-dahab": "dakhla-oued-ed-dahab",
  "جهة-الداخلة-وادي-الذهب": "dakhla-oued-ed-dahab",
  "جهة-الداخلة-واد-الذهب": "dakhla-oued-ed-dahab",
};

const PROVINCE_FR_MAP: Record<string, { slug: string; nameFr: string }> = {
  // Tanger-Tétouan-Al Hoceïma
  "عمالة-طنجة-ا-صيلة": { slug: "tanger-assilah", nameFr: "Tanger-Assilah" },
  "ا-قليم-الفحص-انجرة": { slug: "fahs-anjra", nameFr: "Fahs-Anjra" },
  "عمالة-المضيق-الفنيدق": { slug: "mdiq-fnideq", nameFr: "M’diq-Fnideq" },
  "ا-قليم-تطوان": { slug: "tetouan", nameFr: "Tétouan" },
  "ا-قليم-العراي-ش": { slug: "larache", nameFr: "Larache" },
  "ا-قليم-الحسيمة": { slug: "al-hoceima", nameFr: "Al Hoceïma" },
  "ا-قليم-شفشاون": { slug: "chefchaouen", nameFr: "Chefchaouen" },
  "ا-قليم-وزان": { slug: "ouezzane", nameFr: "Ouezzane" },
  // Oriental
  "عمالة-وجدة-ا-نجاد": { slug: "oujda-angad", nameFr: "Oujda-Angad" },
  "ا-قليم-الناظور": { slug: "nador", nameFr: "Nador" },
  "اقليم-الدريوش": { slug: "driouch", nameFr: "Driouch" },
  "ا-قليم-جرادة": { slug: "jerada", nameFr: "Jerada" },
  "ا-قليم-بركان": { slug: "berkane", nameFr: "Berkane" },
  "ا-قليم-تاوريرت": { slug: "taourirt", nameFr: "Taourirt" },
  "ا-قليم-جرسيف": { slug: "guercif", nameFr: "Guercif" },
  "ا-قليم-فجيج": { slug: "figuig", nameFr: "Figuig" },
  // Fès-Meknès
  "عمالة-فاس": { slug: "fes", nameFr: "Fès" },
  "عمالة-مكناس": { slug: "meknes", nameFr: "Meknès" },
  "ا-قليم-الحاجب": { slug: "el-hajeb", nameFr: "El Hajeb" },
  "ا-قليم-ا-فران": { slug: "ifrane", nameFr: "Ifrane" },
  "ا-قليم-مولاي-يعقوب": { slug: "moulay-yacoub", nameFr: "Moulay Yacoub" },
  "ا-قليم-صفرو": { slug: "sefrou", nameFr: "Sefrou" },
  "ا-قليم-بولمان": { slug: "boulemane", nameFr: "Boulemane" },
  "ا-قليم-تاونات": { slug: "taounate", nameFr: "Taounate" },
  "ا-قليم-تازة": { slug: "taza", nameFr: "Taza" },
  // Rabat-Salé-Kénitra
  "عمالة-الرباط": { slug: "rabat", nameFr: "Rabat" },
  "عمالة-الصخيرات-تمارة": { slug: "skhirate-temara", nameFr: "Skhirate-Témara" },
  "عمالة-القنيطرة": { slug: "kenitra", nameFr: "Kénitra" },
  "ا-قليم-الخميسات": { slug: "khemisset", nameFr: "Khémisset" },
  "ا-قليم-سيدي-قاسم": { slug: "sidi-kacem", nameFr: "Sidi Kacem" },
  "ا-قليم-سيدي-سليمان": { slug: "sidi-slimane", nameFr: "Sidi Slimane" },
  // Béni Mellal-Khénifra
  "عمالة-ا-قليم-بني-ملال": { slug: "beni-mellal", nameFr: "Béni Mellal" },
  "ا-قليم-ا-زيلال": { slug: "azilal", nameFr: "Azilal" },
  "اقليم-الفقيه-بنصالح": { slug: "fquih-ben-salah", nameFr: "Fquih Ben Salah" },
  "ا-قليم-خنيفرة": { slug: "khenifra", nameFr: "Khénifra" },
  "ا-قليم-خريبكة": { slug: "khouribga", nameFr: "Khouribga" },
  // Casablanca-Settat
  "عمالة-المحمدية": { slug: "mohammedia", nameFr: "Mohammédia" },
  "عمالة-الجديدة": { slug: "el-jadida", nameFr: "El Jadida" },
  "ا-قليم-النواصر": { slug: "nouaceur", nameFr: "Nouaceur" },
  "ا-قليم-مديونة": { slug: "mediouna", nameFr: "Médiouna" },
  "ا-قليم-بنسليمان": { slug: "benslimane", nameFr: "Benslimane" },
  "ا-قليم-برشيد": { slug: "berrechid", nameFr: "Berrechid" },
  "ا-قليم-السطات": { slug: "settat", nameFr: "Settat" },
  "ا-قليم-سيدي-بنور": { slug: "sidi-bennour", nameFr: "Sidi Bennour" },
  // Marrakech-Safi
  "عمالة-مراكش": { slug: "marrakech", nameFr: "Marrakech" },
  "ا-قليم-شيشاوة": { slug: "chichaoua", nameFr: "Chichaoua" },
  "ا-قليم-الحوز": { slug: "al-haouz", nameFr: "Al Haouz" },
  "ا-قليم-قلعة-السراغنة": { slug: "el-kelaa-des-sraghna", nameFr: "El Kelâa des Sraghna" },
  "ا-قليم-الصويرة": { slug: "essaouira", nameFr: "Essaouira" },
  "ا-قليم-الرحامنة": { slug: "rehamna", nameFr: "Rehamna" },
  "ا-قليم-اسفي": { slug: "safi", nameFr: "Safi" },
  "ا-قليم-اليوسفية": { slug: "youssoufia", nameFr: "Youssoufia" },
  // Drâa-Tafilalet
  "ا-قليم-الرشدية": { slug: "errachidia", nameFr: "Errachidia" },
  "ا-قليم-ورزازات": { slug: "ouarzazate", nameFr: "Ouarzazate" },
  "ا-قليم-ميدلت": { slug: "midelt", nameFr: "Midelt" },
  "ا-قليم-تنغير": { slug: "tinghir", nameFr: "Tinghir" },
  "ا-قليم-زاكورة": { slug: "zagora", nameFr: "Zagora" },
  // Souss-Massa
  "عمالة-اكادير-ادوتنان": { slug: "agadir-ida-outanane", nameFr: "Agadir Ida-Outanane" },
  "عمالة-انزكان-ايت-ملول": { slug: "inezgane-ait-melloul", nameFr: "Inezgane-Aït Melloul" },
  "ا-قليم-شتوكة-ا-يت-باها": { slug: "chtouka-ait-baha", nameFr: "Chtouka-Aït Baha" },
  "ا-قليم-تارودانت": { slug: "taroudannt", nameFr: "Taroudannt" },
  "ا-قليم-تيزنيت": { slug: "tiznit", nameFr: "Tiznit" },
  // Guelmim-Oued Noun
  "ا-قليم-طاطا": { slug: "tata", nameFr: "Tata" },
  "ا-قليم-كلميم": { slug: "guelmim", nameFr: "Guelmim" },
  "ا-قليم-اسا-الزاك": { slug: "assa-zag", nameFr: "Assa-Zag" },
  "ا-قليم-طانطان": { slug: "tan-tan", nameFr: "Tan-Tan" },
  "ا-قليم-سيدي-ا-فني": { slug: "sidi-ifni", nameFr: "Sidi Ifni" },
  // Laâyoune-Sakia El Hamra
  "ا-قليم-العيون": { slug: "laayoune", nameFr: "Laâyoune" },
  "ا-قليم-بوجدور": { slug: "boujdour", nameFr: "Boujdour" },
  "ا-قليم-طرفاية": { slug: "tarfaya", nameFr: "Tarfaya" },
  "ا-قليم-السمارة": { slug: "es-semara", nameFr: "Es-Semara" },
  // Dakhla-Oued Ed-Dahab
  "ا-قليم-وادي-الذهب": { slug: "oued-ed-dahab", nameFr: "Oued Ed-Dahab" },
  "ا-قليم-اوسرد": { slug: "aousserd", nameFr: "Aousserd" },
};

const COMMUNE_SPECIAL_MAP: Record<string, { slug: string; nameFr: string }> = {
  "القنيطرة": { slug: "kenitra", nameFr: "Kénitra" },
  "الرباط": { slug: "rabat", nameFr: "Rabat" },
  "سلا": { slug: "sale", nameFr: "Salé" },
  "تمارة": { slug: "temara", nameFr: "Témara" },
  "الصخيرات": { slug: "skhirate", nameFr: "Skhirate" },
  "مهدية": { slug: "mehdia", nameFr: "Mehdia" },
  "سوق الأربعاء": { slug: "souk-el-arbaa", nameFr: "Souk El Arbaa" },
  "طنجة": { slug: "tanger", nameFr: "Tanger" },
  "أصيلة": { slug: "assilah", nameFr: "Assilah" },
  "تطوان": { slug: "tetouan", nameFr: "Tétouan" },
  "فاس": { slug: "fes", nameFr: "Fès" },
  "مكناس": { slug: "meknes", nameFr: "Meknès" },
  "وجدة": { slug: "oujda", nameFr: "Oujda" },
  "الدار البيضاء": { slug: "casablanca", nameFr: "Casablanca" },
  "المحمدية": { slug: "mohammedia", nameFr: "Mohammédia" },
  "الجديدة": { slug: "el-jadida", nameFr: "El Jadida" },
  "مراكش": { slug: "marrakech", nameFr: "Marrakech" },
  "آسفي": { slug: "safi", nameFr: "Safi" },
  "اسفي": { slug: "safi", nameFr: "Safi" },
  "الصويرة": { slug: "essaouira", nameFr: "Essaouira" },
  "أكادير": { slug: "agadir", nameFr: "Agadir" },
  "اكادير": { slug: "agadir", nameFr: "Agadir" },
  "تارودانت": { slug: "taroudannt", nameFr: "Taroudannt" },
  "العيون": { slug: "laayoune", nameFr: "Laâyoune" },
  "الداخلة": { slug: "dakhla", nameFr: "Dakhla" },
  "بني ملال": { slug: "beni-mellal", nameFr: "Béni Mellal" },
  "خريبكة": { slug: "khouribga", nameFr: "Khouribga" },
  "الخميسات": { slug: "khemisset", nameFr: "Khémisset" },
  "سيدي قاسم": { slug: "sidi-kacem", nameFr: "Sidi Kacem" },
  "سيدي سليمان": { slug: "sidi-slimane", nameFr: "Sidi Slimane" },
};

const AR_TO_LATIN_CHAR: Record<string, string> = {
  ا: "a", أ: "a", إ: "i", آ: "a", ى: "a",
  ب: "b", ت: "t", ث: "th", ج: "j", ح: "h", خ: "kh",
  د: "d", ذ: "dh", ر: "r", ز: "z", س: "s", ش: "ch",
  ص: "s", ض: "d", ط: "t", ظ: "z", ع: "a", غ: "gh",
  ف: "f", ق: "k", ك: "k", ل: "l", م: "m", ن: "n",
  ه: "h", ة: "a", و: "ou", ي: "i", ئ: "i", ؤ: "o", ء: "",
};

function transliterateArabicSlug(input: string): string {
  const cleaned = input.replace(/[\u064B-\u065F\u0670]/g, "").trim();
  let out = "";
  for (const ch of cleaned) {
    if (AR_TO_LATIN_CHAR[ch] !== undefined) {
      out += AR_TO_LATIN_CHAR[ch];
    } else if (/[a-zA-Z0-9]/.test(ch)) {
      out += ch.toLowerCase();
    } else if (ch === " " || ch === "-" || ch === "_") {
      out += "-";
    }
  }
  return out.replace(/-+/g, "-").replace(/^-|-$/g, "") || "commune";
}

export const INITIAL_OFFICIALS: OfficialProfile[] = [
  // Rabat-Salé-Kénitra
  {
    id: "off-rsk-1",
    territoryType: "region",
    regionSlug: "rabat-sale-kenitra",
    fullName: "Rachid El Abdi",
    fullNameAr: "رشيد العبدي",
    role: "Président du Conseil de la région",
    house: "conseil",
    party: "PAM",
    mandateStart: "2021",
    mandateEnd: "2026",
    bio: "Président du Conseil Régional de Rabat-Salé-Kénitra.",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    displayOrder: 1,
    isPublished: true,
  },
  {
    id: "off-rsk-2",
    territoryType: "region",
    regionSlug: "rabat-sale-kenitra",
    fullName: "Mohamed Yacoubi",
    fullNameAr: "محمد اليعقوبي",
    role: "Wali de la région et Gouverneur de la préfecture de Rabat",
    house: "conseil",
    party: "Administration Territoriale",
    mandateStart: "2019",
    mandateEnd: "En fonction",
    bio: "Wali de la région Rabat-Salé-Kénitra.",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    displayOrder: 2,
    isPublished: true,
  },
  // Kénitra Province
  {
    id: "off-kenitra-1",
    territoryType: "province",
    regionSlug: "rabat-sale-kenitra",
    provinceSlug: "kenitra",
    fullName: "Jawad Ghrib",
    fullNameAr: "جواد غريب",
    role: "Président du Conseil provincial",
    house: "conseil",
    party: "RNI",
    mandateStart: "2021",
    mandateEnd: "2026",
    bio: "Président du Conseil provincial de Kénitra.",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    displayOrder: 1,
    isPublished: true,
  },
  {
    id: "off-kenitra-2",
    territoryType: "province",
    regionSlug: "rabat-sale-kenitra",
    provinceSlug: "kenitra",
    fullName: "Fouad M'Hamdi",
    fullNameAr: "فؤاد محمدي",
    role: "Gouverneur de la province de Kénitra",
    house: "conseil",
    party: "Administration Territoriale",
    mandateStart: "2021",
    mandateEnd: "En fonction",
    bio: "Gouverneur de Sa Majesté le Roi sur la province de Kénitra.",
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    displayOrder: 2,
    isPublished: true,
  },
  // Parliamentarians for Kénitra
  {
    id: "off-kenitra-p1",
    territoryType: "province",
    regionSlug: "rabat-sale-kenitra",
    provinceSlug: "kenitra",
    fullName: "Aziz Rebbah",
    fullNameAr: "عزيز رباح",
    role: "Député parlementaire",
    house: "chambre_representants",
    party: "Indépendant",
    mandateStart: "2021",
    mandateEnd: "2026",
    displayOrder: 3,
    isPublished: true,
  },
  {
    id: "off-kenitra-p2",
    territoryType: "province",
    regionSlug: "rabat-sale-kenitra",
    provinceSlug: "kenitra",
    fullName: "Hatim Berdai",
    fullNameAr: "حاتم برداعي",
    role: "Député parlementaire",
    house: "chambre_representants",
    party: "RNI",
    mandateStart: "2021",
    mandateEnd: "2026",
    displayOrder: 4,
    isPublished: true,
  },
  {
    id: "off-kenitra-p3",
    territoryType: "province",
    regionSlug: "rabat-sale-kenitra",
    provinceSlug: "kenitra",
    fullName: "Mohamed Haouat",
    fullNameAr: "محمد حوات",
    role: "Conseiller parlementaire",
    house: "chambre_conseillers",
    party: "PAM",
    mandateStart: "2021",
    mandateEnd: "2027",
    displayOrder: 5,
    isPublished: true,
  },
  // Kénitra Commune
  {
    id: "off-kenitra-c1",
    territoryType: "commune",
    regionSlug: "rabat-sale-kenitra",
    provinceSlug: "kenitra",
    communeSlug: "kenitra",
    fullName: "Anas Bouanani",
    fullNameAr: "أنس البوعناني",
    role: "Président du Conseil communal",
    house: "conseil",
    party: "RNI",
    mandateStart: "2021",
    mandateEnd: "2026",
    bio: "Président du Conseil communal de la ville de Kénitra.",
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    displayOrder: 1,
    isPublished: true,
  },
  // Tanger-Tétouan-Al Hoceïma
  {
    id: "off-tta-1",
    territoryType: "region",
    regionSlug: "tanger-tetouan-al-hoceima",
    fullName: "Omar Moro",
    fullNameAr: "عمر مورو",
    role: "Président du Conseil de la région",
    house: "conseil",
    party: "RNI",
    mandateStart: "2021",
    mandateEnd: "2026",
    bio: "Président du Conseil Régional de Tanger-Tétouan-Al Hoceïma.",
    photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
    displayOrder: 1,
    isPublished: true,
  },
  // Casablanca-Settat
  {
    id: "off-cs-1",
    territoryType: "region",
    regionSlug: "casablanca-settat",
    fullName: "Abdellatif Maâzouz",
    fullNameAr: "عبد اللطيف معزوز",
    role: "Président du Conseil de la région",
    house: "conseil",
    party: "PI",
    mandateStart: "2021",
    mandateEnd: "2026",
    bio: "Président du Conseil Régional de Casablanca-Settat.",
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    displayOrder: 1,
    isPublished: true,
  },
  // Fès-Meknès
  {
    id: "off-fm-1",
    territoryType: "region",
    regionSlug: "fes-meknes",
    fullName: "Abdelouhed El Ansari",
    fullNameAr: "عبد الواحد الأنصاري",
    role: "Président du Conseil de la région",
    house: "conseil",
    party: "PI",
    mandateStart: "2021",
    mandateEnd: "2026",
    bio: "Président du Conseil Régional de Fès-Meknès.",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    displayOrder: 1,
    isPublished: true,
  },
  // Marrakech-Safi
  {
    id: "off-ms-1",
    territoryType: "region",
    regionSlug: "marrakech-safi",
    fullName: "Samir Goudar",
    fullNameAr: "سمير كودار",
    role: "Président du Conseil de la région",
    house: "conseil",
    party: "PAM",
    mandateStart: "2021",
    mandateEnd: "2026",
    bio: "Président du Conseil Régional de Marrakech-Safi.",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    displayOrder: 1,
    isPublished: true,
  },
];

// Helper to normalize slugs for matching
export function normalizeTerritorySlug(slug: string): string {
  if (!slug) return "";
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    decoded = slug;
  }
  decoded = decoded.trim().toLowerCase();
  if (REGION_SLUG_ALIASES[decoded]) {
    return REGION_SLUG_ALIASES[decoded];
  }
  if (PROVINCE_FR_MAP[decoded]) {
    return PROVINCE_FR_MAP[decoded].slug;
  }
  return decoded
    .replace(/^جهة[-_]/u, "")
    .replace(/^عمالة[-_]/u, "")
    .replace(/^إقليم[-_]/u, "")
    .replace(/^ا-قليم[-_]/u, "")
    .replace(/^اقليم[-_]/u, "");
}

// Convert moroccoRegions dataset into normalized provinces map
export function getProvincesForRegion(regionSlug: string): TerritoryProvince[] {
  const norm = normalizeTerritorySlug(regionSlug);
  const foundRegion = REGIONS_12_METADATA.find((r) => r.slug === norm);
  const rName = foundRegion?.nameFr || norm;

  const raw = moroccoRegions.find(
    (r) =>
      r.slug === regionSlug ||
      normalizeTerritorySlug(r.slug) === norm ||
      r.name.includes(foundRegion?.nameAr?.split(" ")[0] || "---")
  );

  if (!raw) return [];

  return raw.provinces.map((p, idx) => {
    const mapped = PROVINCE_FR_MAP[p.slug];
    const isPrefecture = p.name.includes("عمالة") || p.slug.includes("عمالة");
    const nameCleanAr = p.name.replace(/^عمالة\s+/u, "").replace(/^(?:إقليم|اقليم)\s+/u, "").trim();
    const pSlug = mapped?.slug || transliterateArabicSlug(nameCleanAr);
    const pNameFr = mapped?.nameFr || nameCleanAr;

    return {
      id: `prov-${norm}-${idx + 1}`,
      slug: pSlug,
      regionSlug: norm,
      regionNameFr: rName,
      name: pNameFr,
      nameFr: pNameFr,
      nameAr: p.name,
      kind: isPrefecture ? "prefecture" : "province",
      population: 180000 + idx * 45000,
      communesCount: p.communes.length || 12,
    };
  });
}

// Convert moroccoRegions dataset into normalized communes map
export function getCommunesForProvince(regionSlug: string, provinceSlug: string): TerritoryCommune[] {
  const normR = normalizeTerritorySlug(regionSlug);
  const normP = normalizeTerritorySlug(provinceSlug);

  const rawRegion = moroccoRegions.find(
    (r) => r.slug === regionSlug || normalizeTerritorySlug(r.slug) === normR
  );
  if (!rawRegion) return [];

  const rawProv = rawRegion.provinces.find((p) => {
    const mapped = PROVINCE_FR_MAP[p.slug];
    return (
      p.slug === provinceSlug ||
      mapped?.slug === normP ||
      normalizeTerritorySlug(p.slug) === normP
    );
  });
  if (!rawProv) return [];

  const provMapped = PROVINCE_FR_MAP[rawProv.slug];
  const canonicalProvSlug = provMapped?.slug || normP;

  return rawProv.communes.map((c, idx) => {
    const special = COMMUNE_SPECIAL_MAP[c.name.trim()];
    const latinSlug = special?.slug || transliterateArabicSlug(c.slug || c.name);
    const nameFr = special?.nameFr || c.name;
    const isUrban =
      idx === 0 ||
      c.name.includes("البلدية") ||
      c.name === rawProv.name.replace(/^(عمالة|إقليم|اقليم)\s+/u, "");

    return {
      id: `comm-${canonicalProvSlug}-${idx + 1}`,
      slug: latinSlug,
      provinceSlug: canonicalProvSlug,
      regionSlug: normR,
      name: nameFr,
      nameFr,
      nameAr: c.name,
      kind: isUrban ? "urbaine" : "rurale",
      population: isUrban ? 120000 + idx * 1500 : 15000 + idx * 800,
      address: isUrban ? `Boulevard Mohammed V, Hôtel de Ville, ${nameFr}` : `Centre communal, ${nameFr}`,
      phone: `+212 5 37 ${String(10 + idx).padStart(2, "0")} 00 00`,
      website: isUrban ? `https://www.${latinSlug}.ma` : undefined,
    };
  });
}

export function getRegionBySlug(slug: string): TerritoryRegion | null {
  const norm = normalizeTerritorySlug(slug);
  return REGIONS_12_METADATA.find((r) => r.slug === norm || r.id === norm || r.code === norm) || null;
}

export function getProvinceBySlug(regionSlug: string, provinceSlug: string): TerritoryProvince | null {
  const provinces = getProvincesForRegion(regionSlug);
  const normP = normalizeTerritorySlug(provinceSlug);
  return (
    provinces.find(
      (p) =>
        p.slug === normP ||
        p.slug === provinceSlug ||
        normalizeTerritorySlug(p.slug) === normP ||
        p.nameAr.includes(decodeURIComponent(provinceSlug))
    ) || null
  );
}

export function getCommuneBySlug(regionSlug: string, provinceSlug: string, communeSlug: string): TerritoryCommune | null {
  const communes = getCommunesForProvince(regionSlug, provinceSlug);
  const normC = normalizeTerritorySlug(communeSlug);
  const latinTarget = transliterateArabicSlug(normC);
  return (
    communes.find(
      (c) =>
        c.slug === normC ||
        c.slug === communeSlug ||
        c.slug === latinTarget ||
        c.nameAr === decodeURIComponent(communeSlug)
    ) || null
  );
}

export interface TerritorySearchResult {
  type: TerritoryType;
  label: string;
  labelAr: string;
  sublabel: string;
  href: string;
}

export function searchTerritories(query: string, limit = 18): TerritorySearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: TerritorySearchResult[] = [];

  for (const r of REGIONS_12_METADATA) {
    if (r.nameFr.toLowerCase().includes(q) || r.nameAr.includes(query.trim()) || r.slug.includes(q)) {
      results.push({
        type: "region",
        label: r.nameFr,
        labelAr: r.nameAr,
        sublabel: `Région · ${r.provincesCount} provinces`,
        href: `/territoires/${r.slug}`,
      });
    }

    const provinces = getProvincesForRegion(r.slug);
    for (const p of provinces) {
      if (p.nameFr.toLowerCase().includes(q) || p.nameAr.includes(query.trim()) || p.slug.includes(q)) {
        results.push({
          type: "province",
          label: p.nameFr,
          labelAr: p.nameAr,
          sublabel: `${p.kind === "prefecture" ? "Préfecture" : "Province"} · ${r.nameFr}`,
          href: `/territoires/${r.slug}/${p.slug}`,
        });
      }

      const communes = getCommunesForProvince(r.slug, p.slug);
      for (const c of communes) {
        if (
          c.nameFr.toLowerCase().includes(q) ||
          c.nameAr.includes(query.trim()) ||
          c.slug.includes(q)
        ) {
          results.push({
            type: "commune",
            label: c.nameFr,
            labelAr: c.nameAr,
            sublabel: `Commune ${c.kind} · ${p.nameFr}`,
            href: `/territoires/${r.slug}/${p.slug}/${c.slug}`,
          });
        }
        if (results.length >= limit) return results;
      }
      if (results.length >= limit) return results;
    }
  }

  return results.slice(0, limit);
}
