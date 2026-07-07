import Link from "next/link";

const cards = [
  { title: "المقالات", value: "24" },
  { title: "الأقسام", value: "8" },
  { title: "الأقاليم", value: "12" },
  { title: "الإعدادات", value: "3" },
];

export default function AdminPage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-zinc-200 bg-zinc-950 p-8 text-white shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-400">لوحة الإدارة</p>
        <h1 className="mt-3 text-3xl font-semibold">Afakpress Admin</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-300">واجهة إدارية احترافية لتمكين إدارة المقالات والأقسام والأقاليم والإعدادات في المستقبل.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-600">{card.title}</p>
            <p className="mt-3 text-3xl font-semibold text-zinc-950">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-950">لوحة الإدارة</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {['المقالات','الفئات','الأقاليم','المناطق','البلديات','القوائم','الإعدادات'].map((item) => (
              <div key={item} className="rounded-xl border border-zinc-200 p-4 text-sm font-medium text-zinc-700">{item}</div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-950">إجراءات سريعة</h2>
          <div className="mt-4 space-y-3">
            <Link href="/" className="block rounded-xl border border-zinc-200 p-3 text-sm font-medium text-zinc-700 hover:border-red-700">العودة إلى الموقع</Link>
            <Link href="/article/maroc-accelere-reformes-attractivite-economique" className="block rounded-xl border border-zinc-200 p-3 text-sm font-medium text-zinc-700 hover:border-red-700">عرض مثال مقال</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
