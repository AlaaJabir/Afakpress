export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div dir="ltr" lang="fr" className="min-h-screen text-left">
      {children}
    </div>
  );
}
