"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Store,
  ClipboardList,
  Truck,
  FolderOpen,
  Megaphone,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronLeft,
  Bell,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminStore } from "@/stores/admin.store";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Kullanicilar", icon: Users },
  { href: "/admin/restaurants", label: "Restoranlar", icon: Store, badge: "pending" },
  { href: "/admin/orders", label: "Siparisler", icon: ClipboardList },
  { href: "/admin/couriers", label: "Kuryeler", icon: Truck },
  { href: "/admin/categories", label: "Kategoriler", icon: FolderOpen },
  { href: "/admin/campaigns", label: "Kampanyalar", icon: Megaphone },
  { href: "/admin/payments", label: "Odemeler", icon: CreditCard },
  { href: "/admin/analytics", label: "Analitik", icon: BarChart3 },
  { href: "/admin/settings", label: "Ayarlar", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { restaurants } = useAdminStore();
  const pendingCount = restaurants.filter((r) => r.status === "pending").length;

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === href;
    return pathname.startsWith(href);
  };

  const sidebar = (
    <>
      <div className="flex h-16 items-center gap-2.5 border-b px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white font-bold text-sm">
          A
        </div>
        <div>
          <span className="text-sm font-bold">NeYisek</span>
          <p className="text-[10px] text-muted-foreground -mt-0.5">Admin Paneli</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge === "pending" && pendingCount > 0 && (
                <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 text-[10px]">
                  {pendingCount}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start gap-2 text-xs text-muted-foreground">
            <ChevronLeft className="h-3.5 w-3.5" />
            Siteye Don
          </Button>
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-card">
        {sidebar}
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-card border-r transform transition-transform lg:hidden flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="absolute right-2 top-4">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        {sidebar}
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/95 backdrop-blur px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-red-500" />
            <h1 className="text-sm font-semibold lg:text-base">
              {navItems.find((n) => isActive(n.href))?.label || "Dashboard"}
            </h1>
          </div>
          <div className="ml-auto">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
