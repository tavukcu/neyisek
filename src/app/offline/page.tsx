import { WifiOff, RotateCcw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-6">
        <WifiOff className="h-10 w-10" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Cevrimdisi</h1>
      <p className="text-sm text-muted-foreground mb-8 max-w-md">
        Internet baglantiniz yok gibi gorunuyor. Lutfen baglantinizi kontrol edip tekrar deneyin.
      </p>
      <a
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <RotateCcw className="h-4 w-4" />
        Tekrar Dene
      </a>
    </div>
  );
}
