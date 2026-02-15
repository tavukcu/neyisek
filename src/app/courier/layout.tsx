"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Navigation,
  History,
  Wallet,
  Settings,
  ChevronLeft,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCourierPanelStore } from "@/stores/courier-panel.store";

const navItems = [
  { href: "/courier", label: "Anasayfa", icon: LayoutDashboard },
  { href: "/courier/orders", label: "Teslimatlar", icon: Navigation, badge: true },
  { href: "/courier/history", label: "Gecmis", icon: History },
  { href: "/courier/earnings", label: "Kazanc", icon: Wallet },
  { href: "/courier/settings", label: "Ayarlar", icon: Settings },
];

const statusColors = {
  available: "bg-emerald-500",
  busy: "bg-amber-500",
  offline: "bg-gray-400",
};

const statusLabels = {
  available: "Cevrimici",
  busy: "Mesgul",
  offline: "Cevrimdisi",
};

export default function CourierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { courierName, courierStatus, activeDeliveries } = useCourierPanelStore();
  const activeCount = activeDeliveries.length;

  const isActive = (href: string) => {
    if (href === "/courier") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/95 backdrop-blur px-4">
        <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" />
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs">
            N
          </div>
        </Link>

        <div className="flex-1">
          <p className="text-sm font-semibold">{courierName}</p>
          <div className="flex items-center gap-1.5">
            <Circle className={`h-2 w-2 fill-current ${statusColors[courierStatus]} text-transparent`} />
            <span className="text-[10px] text-muted-foreground">
              {statusLabels[courierStatus]}
            </span>
          </div>
        </div>

        {activeCount > 0 && (
          <Badge className="text-[10px]">
            {activeCount} aktif
          </Badge>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 p-4 pb-20 max-w-lg mx-auto w-full">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-card/95 backdrop-blur safe-area-bottom">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div className="relative">
                  <item.icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} />
                  {item.badge && activeCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 h-3.5 w-3.5 rounded-full bg-primary text-[8px] text-white flex items-center justify-center font-bold">
                      {activeCount}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] ${active ? "font-semibold" : ""}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
