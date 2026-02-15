import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

const footerLinks = {
  platform: [
    { label: "Hakkımızda", href: "/about" },
    { label: "Nasıl Çalışır?", href: "/help" },
    { label: "İletişim", href: "/contact" },
    { label: "Kariyer", href: "/careers" },
  ],
  partner: [
    { label: "Restoran Başvurusu", href: "/restaurant-panel" },
    { label: "Kurye Ol", href: "/courier" },
    { label: "İş Ortaklığı", href: "/contact" },
  ],
  legal: [
    { label: "Kullanım Koşulları", href: "/terms" },
    { label: "Gizlilik Politikası", href: "/privacy" },
    { label: "KVKK", href: "/privacy" },
    { label: "Çerez Politikası", href: "/privacy" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                N
              </div>
              <span className="text-xl font-bold">
                Ne<span className="text-primary">Yisek</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Türkiye&apos;nin en lezzetli yemek sipariş platformu. Binlerce
              restorandan kapınıza teslimat.
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Türkiye geneli hizmet</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>0850 123 45 67</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>destek@neyisek.com</span>
              </div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Platform</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Partner */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">İş Ortaklığı</h3>
            <ul className="space-y-2">
              {footerLinks.partner.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Yasal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} NeYisek. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-4">
            <span className="text-xs text-muted-foreground">
              App Store
            </span>
            <span className="text-xs text-muted-foreground">
              Google Play
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
