import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-700">404</p>
      <h1 className="mt-3 text-3xl font-semibold text-zinc-950">الصفحة غير متوفرة</h1>
      <p className="mt-3 text-zinc-600">تعذر العثور على الصفحة المطلوبة. عد إلى الصفحة الرئيسية أو استعرض آخر الأخبار.</p>
      <Link href="/" className="mt-6 rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white">العودة إلى الصفحة الرئيسية</Link>
    </main>
  );
}
