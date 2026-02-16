"use client";

import Link from "next/link";
import {
  Users,
  Store,
  ShoppingBag,
  Truck,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  Star,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminStore } from "@/stores/admin.store";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { users, restaurants, orders, couriers, campaigns } = useAdminStore();

  const totalRevenue = orders.filter((o) => o.status === "delivered").reduce((s, o) => s + o.total, 0);
  const pendingRestaurants = restaurants.filter((r) => r.status === "pending").length;
  const activeOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length;
  const activeCouriers = couriers.filter((c) => c.status !== "offline" && c.status !== "suspended").length;

  const kpis = [
    { label: "Toplam Kullanici", value: users.length.toString(), icon: Users, change: "+12%", color: "bg-blue-50 text-blue-600" },
    { label: "Aktif Restoran", value: restaurants.filter((r) => r.status === "active").length.toString(), icon: Store, change: "+3", color: "bg-emerald-50 text-emerald-600" },
    { label: "Toplam Siparis", value: orders.length.toString(), icon: ShoppingBag, change: "+18%", color: "bg-purple-50 text-purple-600" },
    { label: "Toplam Ciro", value: `\u20BA${totalRevenue.toFixed(0)}`, icon: DollarSign, change: "+22%", color: "bg-amber-50 text-amber-600" },
    { label: "Aktif Kurye", value: `${activeCouriers}/${couriers.length}`, icon: Truck, change: "Cevrimici", color: "bg-sky-50 text-sky-600" },
    { label: "Aktif Kampanya", value: campaigns.filter((c) => c.isActive).length.toString(), icon: TrendingUp, change: "Devam eden", color: "bg-pink-50 text-pink-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {pendingRestaurants > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3"
        >
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              {pendingRestaurants} yeni restoran basvurusu bekliyor
            </p>
          </div>
          <Link href="/admin/restaurants">
            <Button size="sm" variant="outline" className="text-xs h-7 border-amber-300 text-amber-700 hover:bg-amber-100">
              Incele
            </Button>
          </Link>
        </motion.div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-xl border bg-card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${kpi.color}`}>
                <kpi.icon className="h-4.5 w-4.5" />
              </div>
              <span className="flex items-center gap-0.5 text-[11px] font-medium text-emerald-600">
                <ArrowUpRight className="h-3 w-3" />
                {kpi.change}
              </span>
            </div>
            <p className="text-2xl font-bold">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border bg-card"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-sm">Son Siparisler</h2>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
                Tumunu Gor <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="divide-y">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{o.orderNumber}</p>
                  <p className="text-[11px] text-muted-foreground">{o.customer} → {o.restaurant}</p>
                </div>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${o.status === "delivered" ? "bg-emerald-50 text-emerald-700" : o.status === "cancelled" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                  {o.status}
                </Badge>
                <span className="text-xs font-semibold shrink-0">{"\u20BA"}{o.total.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pending Restaurants */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border bg-card"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-sm">Restoran Basvurulari</h2>
            <Link href="/admin/restaurants">
              <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
                Tumunu Gor <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="divide-y">
            {restaurants.filter((r) => r.status === "pending").length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">Bekleyen basvuru yok</div>
            ) : (
              restaurants.filter((r) => r.status === "pending").map((r) => (
                <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-[11px] text-muted-foreground">{r.owner} &middot; {r.city}, {r.district}</p>
                  </div>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                    Bekliyor
                  </Badge>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
