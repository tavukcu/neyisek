"use client";

import { Users, Store, ShoppingBag, Truck, DollarSign, TrendingUp, ArrowUpRight, Star } from "lucide-react";
import { useAdminStore } from "@/stores/admin.store";
import { motion } from "framer-motion";

export default function AdminAnalyticsPage() {
  const { users, restaurants, orders, couriers } = useAdminStore();

  const totalRevenue = orders.filter((o) => o.status === "delivered").reduce((s, o) => s + o.total, 0);
  const avgOrderValue = orders.filter((o) => o.status === "delivered").length > 0 ? totalRevenue / orders.filter((o) => o.status === "delivered").length : 0;

  const weeklyData = [
    { day: "Pzt", orders: 45, revenue: 12500 },
    { day: "Sal", orders: 52, revenue: 14200 },
    { day: "Car", orders: 38, revenue: 10800 },
    { day: "Per", orders: 61, revenue: 17500 },
    { day: "Cum", orders: 78, revenue: 22000 },
    { day: "Cmt", orders: 95, revenue: 28500 },
    { day: "Paz", orders: 70, revenue: 19800 },
  ];
  const maxRevenue = Math.max(...weeklyData.map((d) => d.revenue));

  const metrics = [
    { label: "Toplam Kullanici", value: users.length, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Aktif Restoran", value: restaurants.filter((r) => r.status === "active").length, icon: Store, color: "bg-emerald-50 text-emerald-600" },
    { label: "Toplam Siparis", value: orders.length, icon: ShoppingBag, color: "bg-purple-50 text-purple-600" },
    { label: "Aktif Kurye", value: couriers.filter((c) => c.status !== "suspended").length, icon: Truck, color: "bg-sky-50 text-sky-600" },
    { label: "Toplam Ciro", value: `\u20BA${totalRevenue.toFixed(0)}`, icon: DollarSign, color: "bg-amber-50 text-amber-600" },
    { label: "Ort. Siparis", value: `\u20BA${avgOrderValue.toFixed(0)}`, icon: TrendingUp, color: "bg-pink-50 text-pink-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="rounded-xl border bg-card p-4">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg mb-3 ${m.color}`}><m.icon className="h-4.5 w-4.5" /></div>
            <p className="text-2xl font-bold">{m.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold">Haftalik Platform Cirosu</h3>
          <span className="text-xs text-muted-foreground">Son 7 gun</span>
        </div>
        <div className="flex items-end gap-3 h-48">
          {weeklyData.map((d, i) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] text-muted-foreground font-medium">{"\u20BA"}{(d.revenue / 1000).toFixed(0)}k</span>
              <motion.div initial={{ height: 0 }} animate={{ height: `${(d.revenue / maxRevenue) * 100}%` }} transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }} className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors min-h-[4px]" />
              <span className="text-[10px] text-muted-foreground">{d.day}</span>
              <span className="text-[9px] text-muted-foreground">{d.orders}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="rounded-xl border bg-card p-4">
          <h3 className="font-semibold text-sm mb-3">En Cok Siparis Alan Restoranlar</h3>
          <div className="space-y-2">
            {[...restaurants].sort((a, b) => b.ordersCount - a.ordersCount).slice(0, 5).map((r, i) => (
              <div key={r.id} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground">{i + 1}</span>
                <div className="flex-1"><p className="text-sm">{r.name}</p><p className="text-[10px] text-muted-foreground">{r.city}</p></div>
                <div className="text-right"><p className="text-xs font-semibold">{r.ordersCount}</p><div className="flex items-center gap-0.5"><Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500" /><span className="text-[10px]">{r.rating}</span></div></div>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-xl border bg-card p-4">
          <h3 className="font-semibold text-sm mb-3">En Iyi Kuryeler</h3>
          <div className="space-y-2">
            {[...couriers].sort((a, b) => b.deliveries - a.deliveries).slice(0, 5).map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground">{i + 1}</span>
                <div className="flex-1"><p className="text-sm">{c.name}</p><p className="text-[10px] text-muted-foreground">{c.zone} - {c.vehicle}</p></div>
                <div className="text-right"><p className="text-xs font-semibold">{c.deliveries} teslimat</p><div className="flex items-center gap-0.5"><Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500" /><span className="text-[10px]">{c.rating}</span></div></div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
