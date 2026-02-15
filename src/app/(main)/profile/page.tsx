"use client";

import Link from "next/link";
import {
  User,
  MapPin,
  Heart,
  ClipboardList,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth.store";
import { useAuth } from "@/hooks/use-auth";

const menuItems = [
  { href: "/orders", icon: ClipboardList, label: "Siparişlerim" },
  { href: "/favorites", icon: Heart, label: "Favorilerim" },
  { href: "/addresses", icon: MapPin, label: "Adreslerim" },
  { href: "/help", icon: HelpCircle, label: "Yardım & Destek" },
];

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <User className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold">Profilim</h1>
        <p className="mt-2 text-muted-foreground">
          Hesabınıza giriş yaparak siparişlerinizi takip edin
        </p>
        <Link href="/login">
          <Button className="mt-6 gap-2">
            <LogIn className="h-4 w-4" />
            Giriş Yap
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      {/* User Info */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{user?.displayName || "Kullanıcı"}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {/* Menu */}
      <div className="rounded-xl border bg-card">
        {menuItems.map((item, i) => (
          <div key={item.href}>
            <Link
              href={item.href}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            {i < menuItems.length - 1 && <Separator />}
          </div>
        ))}
      </div>

      {/* Settings */}
      <div className="mt-4 rounded-xl border bg-card">
        <Link
          href="/profile"
          className="flex items-center justify-between px-4 py-3.5 hover:bg-accent transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Ayarlar</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>

      {/* Logout */}
      <Button
        variant="ghost"
        className="mt-4 w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={logout}
      >
        <LogOut className="h-5 w-5" />
        Çıkış Yap
      </Button>
    </div>
  );
}
