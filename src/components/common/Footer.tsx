import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

const footerLinks = {
  platform: [
    { label: "Hakkimizda", href: "/about" },
    { label: "Nasil Calisir?", href: "/help" },
    { label: "Iletisim", href: "/contact" },
    { label: "Kariyer", href: "/careers" },
  ],
  partner: [
    { label: "Restoran Basvurusu", href: "/restaurant-panel" },
    { label: "Kurye Ol", href: "/courier" },
    { label: "Is Ortakligi", href: "/contact" },
  ],
  legal: [
    { label: "Kullanim Kosullari", href: "/terms" },
    { label: "Gizlilik Politikasi", href: "/privacy" },
    { label: "KVKK", href: "/privacy" },
    { label: "Cerez Politikasi", href: "/privacy" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                N
              </div>
              <span className="text-lg font-bold">
                Ne<span className="text-primary">Yisek</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Turkiye&apos;nin en lezzetli yemek siparis platformu.
            </p>
            <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 shrink-0" />
                <span>Turkiye geneli hizmet</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="h-3 w-3 shrink-0" />
                <span>0850 123 45 67</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="h-3 w-3 shrink-0" />
                <span>destek@neyisek.com</span>
              </div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">Platform</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Partner */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">Is Ortakligi</h3>
            <ul className="space-y-2">
              {footerLinks.partner.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">Yasal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row">
          <p className="text-[11px] text-muted-foreground">
            &copy; {new Date().getFullYear()} NeYisek. Tum haklari saklidir.
          </p>
          <div className="flex gap-3">
            {["Twitter", "Instagram", "LinkedIn"].map((social) => (
              <span key={social} className="text-[11px] text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                {social}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
