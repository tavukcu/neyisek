import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
        <Search className="h-10 w-10" />
      </div>
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-lg text-muted-foreground mb-1">Sayfa Bulunamadi</p>
      <p className="text-sm text-muted-foreground mb-8 max-w-md">
        Aradiginiz sayfa kaldirilmis, adi degismis veya gecici olarak kullanim disi olabilir.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Home className="h-4 w-4" />
        Ana Sayfaya Don
      </Link>
    </div>
  );
}
