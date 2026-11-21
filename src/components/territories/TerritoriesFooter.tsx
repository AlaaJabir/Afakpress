import Link from "next/link";

export function TerritoriesFooter() {
  return (
    <footer className="mt-20 border-t border-[#E0D8C8] bg-[#F6F2EA] px-4 py-8 sm:px-8 lg:px-20 text-sm text-[#5B6472]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <span>© {new Date().getFullYear()} Afakpress · Territoires du Royaume du Maroc</span>
        <div className="flex flex-wrap items-center gap-6">
          <Link href="/about" className="transition hover:text-[#A8472F]">
            À propos
          </Link>
          <Link href="/contact" className="transition hover:text-[#A8472F]">
            Contact
          </Link>
          <Link href="/privacy-policy" className="transition hover:text-[#A8472F]">
            Mentions légales
          </Link>
          <Link href="/admin/territoires" className="text-[#A8472F] font-semibold transition hover:underline">
            Gestion des élus
          </Link>
        </div>
      </div>
    </footer>
  );
}
