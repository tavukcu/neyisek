"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Package,
  Star,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronLeft,
  Bell,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRestaurantPanelStore } from "@/stores/restaurant-panel.store";

const navItems = [
  { href: "/restaurant-panel", label: "Dashboard", icon: LayoutDashboard },
  { href: "/restaurant-panel/orders", label: "Siparisler", icon: ClipboardList, badge: true },
  { href: "/restaurant-panel/menu", label: "Menu Yonetimi", icon: UtensilsCrossed },
  { href: "/restaurant-panel/products", label: "Urunler", icon: Package },
  { href: "/restaurant-panel/reviews", label: "Degerlendirmeler", icon: Star },
  { href: "/restaurant-panel/analytics", label: "Analitik", icon: BarChart3 },
  { href: "/restaurant-panel/settings", label: "Ayarlar", icon: Settings },
];

export default function RestaurantPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { restaurantName, orders } = useRestaurantPanelStore();
  const activeOrderCount = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status)
  ).length;

  const isActive = (href: string) => {
    if (href === "/restaurant-panel") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-card">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 border-b px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            N
          </div>
          <div>
            <span className="text-sm font-bold">
              Ne<span className="text-primary">Yisek</span>
            </span>
            <p className="text-[10px] text-muted-foreground -mt-0.5">Restoran Paneli</p>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Store className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{restaurantName}</p>
              <p className="text-[10px] text-emerald-600 font-medium">Acik</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && activeOrderCount > 0 && (
                  <Badge className="h-5 min-w-[20px] px-1.5 flex items-center justify-center text-[10px]">
                    {activeOrderCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Back to site */}
        <div className="border-t p-3">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start gap-2 text-xs text-muted-foreground">
              <ChevronLeft className="h-3.5 w-3.5" />
              Siteye Don
            </Button>
          </Link>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              N
            </div>
            <span className="text-sm font-bold">
              Ne<span className="text-primary">Yisek</span>
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">{restaurantName}</span>
          </div>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && activeOrderCount > 0 && (
                  <Badge className="h-5 min-w-[20px] px-1.5 text-[10px]">
                    {activeOrderCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/95 backdrop-blur px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <h1 className="text-sm font-semibold lg:text-base">
            {navItems.find((n) => isActive(n.href))?.label || "Dashboard"}
          </h1>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="h-4 w-4" />
              {activeOrderCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-destructive text-[9px] text-white flex items-center justify-center">
                  {activeOrderCount}
                </span>
              )}
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
