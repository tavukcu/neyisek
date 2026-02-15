"use client";

import Link from "next/link";
import { useState } from "react";
import {
  MapPin,
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  Heart,
  ClipboardList,
  LogOut,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import { useLocationStore } from "@/stores/location.store";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const itemCount = useCartStore((s) => s.getItemCount());
  const address = useLocationStore((s) => s.address);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            N
          </div>
          <span className="text-xl font-bold">
            Ne<span className="text-primary">Yisek</span>
          </span>
        </Link>

        {/* Location - Desktop */}
        <button className="hidden md:flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:border-primary/50 transition-colors max-w-[280px]">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span className="truncate text-muted-foreground">
            {address || "Konum seçin"}
          </span>
          <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
        </button>

        {/* Search - Desktop */}
        <div className="hidden lg:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Restoran veya yemek ara..."
              className="w-full rounded-full border bg-muted/50 py-2 pl-10 pr-4 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Search Mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-full"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Cart */}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* User Menu - Desktop */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex rounded-full"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">
                    {user?.displayName || "Kullanıcı"}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="cursor-pointer">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Siparişlerim
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/favorites" className="cursor-pointer">
                    <Heart className="mr-2 h-4 w-4" />
                    Favorilerim
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profilim
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className="hidden md:block">
              <Button size="sm" className="rounded-full gap-2">
                <LogIn className="h-4 w-4" />
                Giriş Yap
              </Button>
            </Link>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                <button className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-accent transition-colors">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="truncate">
                    {address || "Konum seçin"}
                  </span>
                </button>
                <div className="my-2 border-t" />
                {!isAuthenticated && (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-accent transition-colors"
                  >
                    <LogIn className="h-5 w-5" />
                    Giriş Yap / Kayıt Ol
                  </Link>
                )}
                {isAuthenticated && (
                  <>
                    <Link
                      href="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-accent transition-colors"
                    >
                      <ClipboardList className="h-5 w-5" />
                      Siparişlerim
                    </Link>
                    <Link
                      href="/favorites"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-accent transition-colors"
                    >
                      <Heart className="h-5 w-5" />
                      Favorilerim
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-accent transition-colors"
                    >
                      <User className="h-5 w-5" />
                      Profilim
                    </Link>
                    <div className="my-2 border-t" />
                    <button className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                      <LogOut className="h-5 w-5" />
                      Çıkış Yap
                    </button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
