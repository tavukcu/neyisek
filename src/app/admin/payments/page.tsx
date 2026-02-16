"use client";

import { DollarSign, TrendingUp, CreditCard, Banknote, ArrowUpRight, Store } from "lucide-react";
import { useAdminStore } from "@/stores/admin.store";
import { motion } from "framer-motion";

export default function AdminPaymentsPage() {
  const { orders, restaurants } = useAdminStore();

  const deliveredOrders = orders.filter((o) => o.status === "delivered");
  const totalRevenue = deliveredOrders.reduce((s, o) => s + o.total, 0);
  const cardPayments = deliveredOrders.filter((o) => o.payment === "credit_card");
  const cashPayments = deliveredOrders.filter((o) => o.payment === "cash");
  const cardTotal = cardPayments.reduce((s, o) => s + o.total, 0);
  const cashTotal = cashPayments.reduce((s, o) => s + o.total, 0);
  const avgCommission = restaurants.filter((r) => r.status === "active").reduce((s, r) => s + r.commission, 0) / Math.max(restaurants.filter((r) => r.status === "active").length, 1);
  const commissionRevenue = totalRevenue * (avgCommission / 100);

  const stats = [
    { label: "Toplam Ciro", value: `\u20BA${totalRevenue.toFixed(0)}`, icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
    { label: "Kart Odemeler", value: `\u20BA${cardTotal.toFixed(0)}`, sub: `${cardPayments.length} islem`, icon: CreditCard, color: "bg-blue-50 text-blue-600" },
    { label: "Nakit Odemeler", value: `\u20BA${cashTotal.toFixed(0)}`, sub: `${cashPayments.length} islem`, icon: Banknote, color: "bg-amber-50 text-amber-600" },
    { label: "Komisyon Geliri", value: `\u20BA${commissionRevenue.toFixed(0)}`, sub: `Ort. %${avgCommission.toFixed(0)}`, icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border bg-card p-4">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg mb-3 ${stat.color}`}><stat.icon className="h-4.5 w-4.5" /></div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            {stat.sub && <p className="text-[10px] text-muted-foreground">{stat.sub}</p>}
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border bg-card p-5">
        <h3 className="font-semibold mb-4">Restoran Komisyonlari</h3>
        <div className="space-y-2">
          {restaurants.filter((r) => r.status === "active").map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2"><Store className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">{r.name}</p><p className="text-[10px] text-muted-foreground">{r.ordersCount} siparis</p></div></div>
              <div className="text-right"><p className="text-sm font-semibold">%{r.commission}</p><p className="text-[10px] text-muted-foreground">{"\u20BA"}{(r.ordersCount * 25 * r.commission / 100).toFixed(0)} tahmini</p></div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
