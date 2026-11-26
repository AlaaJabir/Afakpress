"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronUp,
  FileText,
  Lock,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useCms } from "@/lib/cms-store";

const STRATEGIC_REGIONS = [
  {
    name: "جهة طنجة - تطوان - الحسيمة",
    slug: "جهة-طنجة-تطوان-الحسيمة",
    count: "8 أقاليم",
  },
  {
    name: "جهة الدار البيضاء - سطات",
    slug: "جهة-الدار-البيضاء-سطات",
    count: "9 أقاليم",
  },
  {
    name: "جهة الرباط - سلا - القنيطرة",
    slug: "جهة-الرباط-سلا-القنيطرة",
    count: "7 أقاليم",
  },
  {
    name: "جهة مراكش - آسفي",
    slug: "جهة-مراكش-آسفي",
    count: "8 أقاليم",
  },
  {
    name: "جهة سوس - ماسة",
    slug: "جهة-سوس-ماسة",
    count: "6 أقاليم",
  },
];

const KEY_MINISTRIES = [
  { name: "وزارة الداخلية", slug: "interieur" },
  { name: "الاقتصاد والمالية", slug: "economie-et-finances" },
  { name: "التجهيز والماء", slug: "equipement-et-eau" },
  { name: "الصحة والحماية الاجتماعية", slug: "sante-et-protection-sociale" },
];

const EDITORIAL_SECTIONS = [
  { label: "أخبار وطنية", slug: "وطنية" },
  { label: "سياسة ودبلوماسية", slug: "سياسة" },
  { label: "اقتصاد واستثمارات", slug: "اقتصاد" },
  { label: "أخبار الجهات الـ 12", slug: "جهات" },
  { label: "مجتمع وقضايا", slug: "مجتمع" },
  { label: "ثقافة وفنون", slug: "ثقافة" },
  { label: "آراء وتحليلات", slug: "رأي" },
];

export function AfakFooter() {
  const { state, notify } = useCms();
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      notify("error", "يرجى إدخال بريد إلكتروني صالح");
      return;
    }
    setIsSubscribed(true);
    notify("success", "شكراً لاشتراكك في النشرة الإخبارية لآفاق بريس!");
    setEmail("");
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer
      dir="rtl"
      className="relative mt-20 w-full bg-[#080d18] text-slate-300 font-sans selection:bg-[#b91c1c] selection:text-white"
    >
      {/* Moroccan Editorial Top Hairline */}
      <div className="grid h-1 w-full grid-cols-3" aria-hidden="true">
        <div className="bg-[#0b1930]" />
        <div className="bg-[#b91c1c]" />
        <div className="bg-[#d99b1e]" />
      </div>

      {/* Scroll-to-Top Action */}
      <div className="absolute -top-5 left-6 sm:left-10 z-20 hidden sm:block">
        <button
          type="button"
          onClick={scrollToTop}
          title="العودة للأعلى"
          aria-label="العودة للأعلى"
          className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-md transition duration-200 hover:-translate-y-0.5 hover:border-[#b91c1c] hover:text-[#b91c1c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b91c1c] cursor-pointer"
        >
          <ChevronUp className="size-5 stroke-[2.25]" />
        </button>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 pt-12 pb-10 sm:px-6 lg:px-8">
        {/* 1. Editorial Newsletter Band */}
        <section
          id="newsletter"
          className="border-b border-white/10 pb-10 mb-12"
          aria-labelledby="footer-newsletter-heading"
        >
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="text-xs font-bold tracking-wide text-[#d99b1e] mb-2.5">
                النشرة البريدية اليومية · آفاق بريس
              </p>
              <h2
                id="footer-newsletter-heading"
                className="font-moroccan-naskh text-2xl sm:text-3xl font-bold text-white leading-[1.45] text-balance"
              >
                كن أوّل من يطّلع على نبض الجهات وأهم القرارات والتقارير الوطنية
              </h2>
              <p className="mt-3 text-sm text-slate-400 leading-7 max-w-2xl">
                تحليلات حصرية، متابعة لشؤون الجهات والجماعات والقطاعات الوزارية عبر شبكة مراسلين وتغطية ميدانية معمقة.
              </p>
            </div>

            <div className="lg:col-span-5">
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <div className="relative flex-1">
                    <label htmlFor="footer-newsletter-email" className="sr-only">
                      البريد الإلكتروني
                    </label>
                    <input
                      id="footer-newsletter-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="أدخل بريدك الإلكتروني..."
                      required
                      dir="rtl"
                      className="h-11 w-full rounded-lg border border-white/15 bg-[#0e1525] px-4 pr-10 text-sm text-white placeholder:text-slate-500 outline-none transition duration-150 focus:border-[#d99b1e] focus:bg-[#11192c]"
                    />
                    <Mail className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#b91c1c] px-6 text-sm font-black text-white transition duration-150 hover:bg-[#991b1b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d99b1e] cursor-pointer"
                  >
                    <span>اشتراك مجاني</span>
                    <Send className="size-3.5 -rotate-90 rtl:rotate-90" />
                  </button>
                </div>

                {isSubscribed ? (
                  <p className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <ShieldCheck className="size-4 shrink-0" />
                    <span>تم تسجيل اشتراكك بنجاح. ستصلك النشرة الصباحية يومياً.</span>
                  </p>
                ) : (
                  <p className="flex items-center gap-2 text-xs text-slate-400">
                    <ShieldCheck className="size-3.5 shrink-0 text-slate-500" />
                    <span>نحترم خصوصيتك بالكامل، ويمكنك إلغاء الاشتراك في أي وقت.</span>
                  </p>
                )}
              </form>
            </div>
          </div>
        </section>

        {/* 2. Main 4-Column Editorial Directory */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8 pb-12">
          {/* Column 1: Brand & Institutional Identity */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
            <div>
              <Link href="/" className="inline-flex items-center gap-3.5 group">
                <div className="flex h-12 w-24 shrink-0 items-center justify-center rounded-lg bg-white px-2.5 py-1.5 shadow-xs transition duration-200 group-hover:opacity-95">
                  <Image
                    src="/afakpress-logo.png"
                    alt="آفاق بريس"
                    width={140}
                    height={77}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-moroccan-naskh text-xl font-bold text-white transition group-hover:text-[#d99b1e]">
                    آفاق بريس
                  </h3>
                  <p className="text-[11px] font-semibold tracking-wider text-slate-400">
                    جريدة جهوية ووطنية مستقلة
                  </p>
                </div>
              </Link>

              <p className="mt-4 font-moroccan-naskh text-[14px] leading-[1.85] text-slate-300">
                {state.settings.footer ||
                  'آفاق بريس "همزة وصل" إعلامية مهنية تربط بين المواطن والمجال الترابي عبر تغطية شاملة لشؤون الجهات الـ 12 والأقاليم والجماعات الترابية والقطاعات الوزارية بالمملكة المغربية.'}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400 tabular-nums">
                <span>12 جهة</span>
                <span aria-hidden="true">·</span>
                <span>75 عمالة وإقليم</span>
                <span aria-hidden="true">·</span>
                <span>1503 جماعة ترابية</span>
              </div>
            </div>

            <div>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 border-b border-[#d99b1e]/40 pb-1 text-xs font-bold text-[#d99b1e] transition hover:border-[#d99b1e] hover:text-amber-300"
              >
                <FileText className="size-3.5" />
                <span>لوحة التحرير والإدارة</span>
              </Link>
            </div>
          </div>

          {/* Column 2: Regions & Ministries Directory */}
          <div className="lg:col-span-3">
            <h4 className="border-b border-white/10 pb-3 text-sm font-black text-white">
              الجهات والوزارات
            </h4>

            <ul className="mt-3 divide-y divide-white/[0.06]">
              {STRATEGIC_REGIONS.map((region) => (
                <li key={region.slug}>
                  <Link
                    href={`/region/${encodeURIComponent(region.slug)}`}
                    className="group flex items-center justify-between py-2.5 text-xs transition"
                  >
                    <span className="font-semibold text-slate-300 group-hover:text-white transition">
                      {region.name}
                    </span>
                    <span className="text-[11px] text-slate-500 tabular-nums group-hover:text-[#d99b1e] transition">
                      {region.count}
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/13eme-region"
                  className="group flex items-center justify-between py-2.5 text-xs transition"
                >
                  <span className="font-bold text-[#d99b1e] group-hover:text-amber-300 transition">
                    الجهة الثالثة عشرة (مغاربة العالم)
                  </span>
                  <span className="text-[11px] text-slate-500 group-hover:text-white transition">
                    الجالية
                  </span>
                </Link>
              </li>
            </ul>

            <div className="mt-4 pt-3 border-t border-white/10">
              <p className="mb-2 text-[11px] font-bold text-slate-400">قطاعات وزارية:</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs">
                {KEY_MINISTRIES.map((ministry) => (
                  <Link
                    key={ministry.slug}
                    href={`/ministere/${encodeURIComponent(ministry.slug)}`}
                    className="text-slate-300 underline-offset-4 transition hover:text-white hover:underline"
                  >
                    {ministry.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3: Editorial Sections */}
          <div className="lg:col-span-2">
            <h4 className="border-b border-white/10 pb-3 text-sm font-black text-white">
              الأقسام التحريرية
            </h4>

            <ul className="mt-3 space-y-2.5 text-xs sm:text-[13px] font-medium">
              {EDITORIAL_SECTIONS.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/category/${encodeURIComponent(item.slug)}`}
                    className="group inline-flex items-center gap-1.5 text-slate-300 transition hover:text-white"
                  >
                    <ChevronLeft className="size-3.5 text-[#b91c1c] transition-transform duration-150 group-hover:-translate-x-0.5" />
                    <span className="underline-offset-4 group-hover:underline">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Channels */}
          <div className="lg:col-span-3">
            <h4 className="border-b border-white/10 pb-3 text-sm font-black text-white">
              التواصل وقنوات المتابعة
            </h4>

            <div className="mt-4 space-y-3.5 text-xs">
              <a
                href={`mailto:${state.settings.contactEmail || "contact@afakpress.ma"}`}
                className="flex items-center gap-3 text-slate-300 transition hover:text-white"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300">
                  <Mail className="size-3.5" />
                </span>
                <span dir="ltr" className="font-mono text-xs">
                  {state.settings.contactEmail || "contact@afakpress.ma"}
                </span>
              </a>

              <div className="flex items-start gap-3 text-slate-300">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 mt-0.5">
                  <MapPin className="size-3.5" />
                </span>
                <span className="leading-6 text-slate-300">
                  {state.settings.address || "المملكة المغربية · الرباط · الدار البيضاء · طنجة · مراكش · العيون"}
                </span>
              </div>

              {state.settings.phone ? (
                <div className="flex items-center gap-3 text-slate-300">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300">
                    <Phone className="size-3.5" />
                  </span>
                  <span dir="ltr" className="font-mono text-xs">
                    {state.settings.phone}
                  </span>
                </div>
              ) : null}

              <div className="pt-2">
                <p className="mb-2.5 text-[11px] font-bold text-slate-400">
                  الحسابات الرسمية:
                </p>
                <div className="flex items-center gap-2">
                  {[
                    { label: "Facebook", icon: "f", href: "https://facebook.com" },
                    { label: "X", icon: "𝕏", href: "https://x.com" },
                    { label: "YouTube", icon: "▶", href: "https://youtube.com" },
                    { label: "LinkedIn", icon: "in", href: "https://linkedin.com" },
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.label}
                      aria-label={social.label}
                      className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-xs font-black text-slate-300 transition duration-150 hover:border-[#b91c1c] hover:bg-[#b91c1c] hover:text-white"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Quiet Sub-Footer Bar */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-300">
                جميع الحقوق محفوظة © {new Date().getFullYear()} · آفاق بريس
              </span>
              <span aria-hidden="true">·</span>
              <a
                href="https://www.afakpress.ma"
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                className="font-semibold text-slate-400 transition hover:text-white"
              >
                www.afakpress.ma
              </a>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-[#d99b1e]"
              >
                <Lock className="size-3" />
                <span>إدارة التحرير</span>
              </Link>

              <button
                type="button"
                onClick={scrollToTop}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 transition hover:text-white cursor-pointer"
              >
                <span>الأعلى</span>
                <ChevronUp className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
