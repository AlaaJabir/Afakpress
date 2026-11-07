"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Send,
  Sparkles,
  ChevronLeft,
  ChevronUp,
  Globe,
  Scale,
  FileText,
  Lock,
} from "lucide-react";
import { useCms } from "@/lib/cms-store";

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

  // Moroccan key strategic regions to display in the directory with color codes
  const keyRegions = [
    {
      name: "جهة طنجة - تطوان - الحسيمة",
      slug: "جهة-طنجة-تطوان-الحسيمة",
      count: "8 أقاليم وعمالات",
      color: "bg-blue-500",
    },
    {
      name: "جهة الدار البيضاء - سطات",
      slug: "جهة-الدار-البيضاء-سطات",
      count: "9 أقاليم وعمالات",
      color: "bg-emerald-500",
    },
    {
      name: "جهة الرباط - سلا - القنيطرة",
      slug: "جهة-الرباط-سلا-القنيطرة",
      count: "7 أقاليم وعمالات",
      color: "bg-amber-500",
    },
    {
      name: "جهة مراكش - آسفي",
      slug: "جهة-مراكش-آسفي",
      count: "8 أقاليم وعمالات",
      color: "bg-red-500",
    },
    {
      name: "جهة سوس - ماسة",
      slug: "جهة-سوس-ماسة",
      count: "6 أقاليم وعمالات",
      color: "bg-cyan-500",
    },
  ];

  return (
    <footer
      dir="rtl"
      className="relative mt-20 w-full bg-[#070a13] text-slate-300 font-sans selection:bg-red-800 selection:text-white"
    >
      {/* 1. Top Tricolor Gradient Accent Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-700 shadow-sm" />

      {/* Floating Scroll-to-Top Button on the left edge */}
      <div className="absolute -top-6 left-6 sm:left-10 z-30 hidden sm:block">
        <button
          type="button"
          onClick={scrollToTop}
          title="العودة للأعلى"
          aria-label="العودة للأعلى"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-900 shadow-2xl transition hover:scale-110 hover:bg-slate-100 hover:text-red-700 active:scale-95 focus:outline-none"
        >
          <ChevronUp className="size-6 stroke-[2.5]" />
        </button>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 pt-12 pb-16 sm:px-6 lg:px-8">
        {/* 2. Hero Newsletter Callout Box */}
        <div className="relative mb-16 overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-l from-[#0e1322] via-[#111728] to-[#2b080c] p-6 shadow-2xl sm:p-10 lg:p-12">
          {/* Subtle background ambient radial glow */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-red-600/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-amber-600/10 blur-3xl" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Right: Headline & Description */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-950/80 border border-amber-600/40 px-3.5 py-1 text-xs font-bold text-amber-300 shadow-sm mb-4">
                <Sparkles className="size-3.5 text-amber-400" />
                <span>النشرة البريدية اليومية لآفاق بريس</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                كن أوّل من يطّلع على نبض الجهات وأهم القرارات والتقارير الوطنية
              </h2>

              <p className="mt-3.5 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                تحليلات حصرية، فرص استثمارية، ومتابعة لشؤون الجهات والجماعات المغربية عبر شبكة مراسلين وتغطية ميدانية معمقة.
              </p>
            </div>

            {/* Left: Interactive Subscription Form */}
            <div className="lg:col-span-5">
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="...أدخل بريدك الإلكتروني هنا"
                      required
                      dir="rtl"
                      className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3.5 pr-11 text-sm text-white placeholder-slate-400 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                    <Mail className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#b91c1c] px-6 py-3.5 text-sm font-black text-white shadow-lg transition hover:bg-red-700 active:scale-95 shrink-0"
                  >
                    <span>اشتراك مجاني</span>
                    <Send className="size-4 -rotate-90 rtl:rotate-90" />
                  </button>
                </div>

                {isSubscribed ? (
                  <p className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <ShieldCheck className="size-4" />
                    تم تسجيل اشتراكك بنجاح. ستصلك النشرة الصباحية يومياً!
                  </p>
                ) : (
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-400">
                    <ShieldCheck className="size-4 shrink-0 text-emerald-400" />
                    <span>نحترم خصوصيتك بالكامل. بدون رسائل مزعجة، ويمكنك إلغاء الاشتراك بنقرة واحدة.</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* 3. Main 4 Columns Grid Section */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8 pb-12">
          {/* Column 1 (Far Right): Brand, Emblem & Editorial Identity */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              {/* Brand Logo & Name */}
              <Link href="/" className="inline-flex items-center gap-3 group">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-900 text-white shadow-lg ring-1 ring-white/20 transition group-hover:scale-105">
                  <span className="font-serif text-2xl font-black text-amber-300">أ</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-wide group-hover:text-red-400 transition">
                    آفـاق بـريـس
                  </h3>
                  <p className="text-[10px] font-bold tracking-widest text-amber-400/90 uppercase font-mono">
                    AFAKPRESS · MAROC
                  </p>
                </div>
              </Link>

              {/* Bio description */}
              <p className="mt-4 text-xs sm:text-sm leading-6 text-slate-300">
                {state.settings.footer ||
                  "جريدة إخبارية ورصدية مستقلة تعنى بشؤون الجهات المغربية والقضايا الوطنية، وتربط بين المواطن والمجال الترابي عبر شبكة مراسلين وتغطية ميدانية معمقة."}
              </p>

              {/* Trust Badges */}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                  <Scale className="size-3.5 text-amber-400" />
                  <span>صحافة مهنية مستقلة</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                  <Globe className="size-3.5 text-blue-400" />
                  <span>تغطية 12 جهة بالمملكة</span>
                </span>
              </div>
            </div>

            {/* Quick Admin Access Button */}
            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-amber-300 transition hover:border-amber-400/60 hover:bg-white/10 hover:text-amber-200"
            >
              <FileText className="size-4 text-amber-400" />
              <span>لوحة التحرير والإدارة (مشرف التحرير)</span>
            </Link>
          </div>

          {/* Column 2 (Center Right): Regional Directory (دليل الجهات المغربية) */}
          <div>
            <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-2.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <h4 className="text-sm font-black text-white">دليل الجهات والأقاليم (12 جهة)</h4>
            </div>

            <div className="space-y-2">
              {keyRegions.map((region) => (
                <Link
                  key={region.slug}
                  href={`/region/${encodeURIComponent(region.slug)}`}
                  className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2.5 transition hover:border-red-600/60 hover:bg-white/10"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${region.color}`} />
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                      {region.name}
                    </span>
                  </div>
                  <span className="rounded bg-black/40 border border-white/10 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300">
                    {region.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3 (Center Left): Editorial Sections & Hubs (الأقسام والمحاور التحريرية) */}
          <div>
            <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-2.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <h4 className="text-sm font-black text-white">الأقسام والمحاور التحريرية</h4>
            </div>

            <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
              {[
                { label: "سياسة وشؤون وطنية وقضايا عامة", href: "/category/national" },
                { label: "اقتصاد واستثمارات وتنمية جهوية", href: "/category/economy" },
                { label: "شؤون الجهات والمجالس الترابية", href: "/category/regions" },
                { label: "كفاءات وطاقات وطنية ومجتمع مدني", href: "/category/culture" },
                { label: "آراء وأوراق تحليلية وفكرية", href: "/category/opinion" },
                { label: "تحقيقات وتقارير ميدانية خاصة", href: "/category/national" },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-2 text-slate-300 transition hover:text-white"
                  >
                    <ChevronLeft className="size-3.5 text-red-500 transition group-hover:-translate-x-1" />
                    <span className="group-hover:underline underline-offset-4">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 (Far Left): Contact & Follow Channels (التواصل وقنوات المتابعة) */}
          <div>
            <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <h4 className="text-sm font-black text-white">التواصل وقنوات المتابعة</h4>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <a
                href={`mailto:${state.settings.contactEmail || "contact@afakpress.ma"}`}
                className="flex items-center gap-2.5 text-slate-300 hover:text-red-400 transition"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-950/80 border border-red-700/60 text-red-400 shrink-0">
                  <Mail className="size-4" />
                </div>
                <span className="dir-ltr text-right font-mono text-xs">{state.settings.contactEmail || "contact@afakpress.ma"}</span>
              </a>

              <div className="flex items-start gap-2.5 text-slate-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-950/80 border border-amber-700/60 text-amber-400 shrink-0 mt-0.5">
                  <MapPin className="size-4" />
                </div>
                <span className="text-xs leading-5">
                  {state.settings.address || "المملكة المغربية • الرباط • الدار البيضاء • طنجة • مراكش • العيون"}
                </span>
              </div>

              {state.settings.phone && (
                <div className="flex items-center gap-2.5 text-slate-300">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 shrink-0">
                    <Phone className="size-4" />
                  </div>
                  <span className="dir-ltr text-right font-mono text-xs">{state.settings.phone}</span>
                </div>
              )}

              {/* Social Channels Row */}
              <div className="pt-2">
                <p className="mb-2 text-[11px] font-bold text-slate-400">تابع جريدة آفاق بريس:</p>
                <div className="flex items-center gap-2">
                  {[
                    { label: "Facebook", icon: "f", href: "https://facebook.com" },
                    { label: "X", icon: "𝕏", href: "https://x.com" },
                    { label: "YouTube", icon: "▶", href: "https://youtube.com" },
                    { label: "LinkedIn", icon: "in", href: "https://linkedin.com" },
                    { label: "WhatsApp", icon: "💬", href: "https://whatsapp.com" },
                  ].map((social, idx) => (
                    <a
                      key={idx}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.label}
                      aria-label={social.label}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs font-black text-slate-300 transition hover:border-red-600 hover:bg-[#b91c1c] hover:text-white"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Sub-footer Bottom Bar */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Right: Copyrights & Publisher */}
            <div className="text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">
                جميع الحقوق محفوظة © {new Date().getFullYear()} · جريدة آفاق بريس الرقمية
              </p>
              <p className="text-[11px] text-slate-500">
                منظومة الرصد الإقليمي والصحافة المهنية المستقلة للجهات المغربية · إشراف وتطوير: Mr JABIR Alaa
              </p>
            </div>

            {/* Left: Quick Actions */}
            <div className="flex items-center gap-3 text-xs">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 font-bold text-amber-300 transition hover:bg-white/10"
              >
                <Lock className="size-3.5 text-amber-400" />
                <span>لوحة التحكم (CMS)</span>
              </Link>

              <button
                type="button"
                onClick={scrollToTop}
                className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <span>العودة للأعلى</span>
                <ChevronUp className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
