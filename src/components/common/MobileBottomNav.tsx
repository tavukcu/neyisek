"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, Heart, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart.store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Ana Sayfa" },
  { href: "/search", icon: Search, label: "Keşfet" },
  { href: "/cart", icon: ShoppingBag, label: "Sepet", showBadge: true },
  { href: "/favorites", icon: Heart, label: "Favoriler" },
  { href: "/profile", icon: User, label: "Profil" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.getItemCount());

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ href, icon: Icon, label, showBadge }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] transition-colors relative",
                isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                {showBadge && itemCount > 0 && (
                  <Badge className="absolute -right-2.5 -top-1.5 h-4 min-w-4 rounded-full p-0 flex items-center justify-center text-[9px]">
                    {itemCount}
                  </Badge>
                )}
              </div>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
