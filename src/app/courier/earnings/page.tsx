"use client";

import {
  Wallet,
  TrendingUp,
  Calendar,
  Package,
  ArrowUpRight,
} from "lucide-react";
import { useCourierPanelStore } from "@/stores/courier-panel.store";
import { motion } from "framer-motion";

export default function CourierEarningsPage() {
  const { todayEarnings, todayDeliveries, totalEarnings, totalDeliveries, completedDeliveries } =
    useCourierPanelStore();

  const avgPerDelivery = totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0;

  // Mock weekly data
  const weeklyData = [
    { day: "Pzt", amount: 120, deliveries: 7 },
    { day: "Sal", amount: 95, deliveries: 5 },
    { day: "Car", amount: 150, deliveries: 8 },
    { day: "Per", amount: 85, deliveries: 4 },
    { day: "Cum", amount: 180, deliveries: 10 },
    { day: "Cmt", amount: 220, deliveries: 12 },
    { day: "Paz", amount: 165, deliveries: 9 },
  ];
  const weekTotal = weeklyData.reduce((s, d) => s + d.amount, 0);
  const maxAmount = Math.max(...weeklyData.map((d) => d.amount));

  return (
    <div className="space-y-5">
      <h2 className="font-bold text-lg">Kazanclarim</h2>

      {/* Today Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-gradient-to-br from-primary to-primary/80 p-5 text-white"
      >
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="h-4 w-4 opacity-80" />
          <span className="text-xs opacity-80">Bugunun Kazanci</span>
        </div>
        <p className="text-3xl font-bold">{"\u20BA"}{todayEarnings.toFixed(0)}</p>
        <div className="flex items-center gap-3 mt-2 text-xs opacity-80">
          <span>{todayDeliveries} teslimat</span>
          <span>&middot;</span>
          <span>Ort. {"\u20BA"}{todayDeliveries > 0 ? (todayEarnings / todayDeliveries).toFixed(0) : 0}/teslimat</span>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Toplam Kazanc", value: `\u20BA${totalEarnings.toFixed(0)}`, icon: TrendingUp },
          { label: "Toplam Teslimat", value: totalDeliveries.toString(), icon: Package },
          { label: "Ort. Kazanc", value: `\u20BA${avgPerDelivery.toFixed(0)}`, icon: ArrowUpRight },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.03 }}
            className="rounded-xl border bg-card p-3 text-center"
          >
            <stat.icon className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-[9px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border bg-card p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Haftalik Kazanc</h3>
          <span className="text-xs text-muted-foreground">
            Toplam: {"\u20BA"}{weekTotal}
          </span>
        </div>

        <div className="flex items-end gap-2 h-32">
          {weeklyData.map((d, i) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] text-muted-foreground font-medium">
                {"\u20BA"}{d.amount}
              </span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.amount / maxAmount) * 100}%` }}
                transition={{ delay: 0.2 + i * 0.04, duration: 0.4 }}
                className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors min-h-[4px]"
              />
              <span className="text-[10px] text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Earnings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border bg-card p-4"
      >
        <h3 className="font-semibold text-sm mb-3">Son Kazanclar</h3>
        <div className="space-y-2.5">
          {completedDeliveries.slice(0, 5).map((d) => (
            <div key={d.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm">{d.restaurantName}</p>
                <p className="text-[10px] text-muted-foreground">
                  {d.orderNumber} &middot; {d.distance} km
                </p>
              </div>
              <span className="text-sm font-semibold text-emerald-600">
                +{"\u20BA"}{d.fee.toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
