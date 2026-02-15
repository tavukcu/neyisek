"use client";

import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Users,
  Star,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from "lucide-react";
import { useRestaurantPanelStore } from "@/stores/restaurant-panel.store";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
  const { orders, reviews, products } = useRestaurantPanelStore();

  const totalRevenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((s, o) => s + o.pricing.total, 0);

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;
  const avgOrderValue = deliveredOrders > 0 ? totalRevenue / deliveredOrders : 0;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const stats = [
    {
      label: "Toplam Ciro",
      value: `\u20BA${totalRevenue.toFixed(0)}`,
      change: "+15.3%",
      up: true,
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Toplam Siparis",
      value: totalOrders.toString(),
      change: "+8.1%",
      up: true,
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Ort. Siparis Tutari",
      value: `\u20BA${avgOrderValue.toFixed(0)}`,
      change: "+3.2%",
      up: true,
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Musteri Puani",
      value: avgRating.toFixed(1),
      change: reviews.length + " yorum",
      up: true,
      icon: Star,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  const weeklyData = [
    { day: "Pzt", orders: 12, revenue: 2890 },
    { day: "Sal", orders: 15, revenue: 3450 },
    { day: "Car", orders: 10, revenue: 2100 },
    { day: "Per", orders: 18, revenue: 4200 },
    { day: "Cum", orders: 25, revenue: 5800 },
    { day: "Cmt", orders: 30, revenue: 7200 },
    { day: "Paz", orders: 22, revenue: 5100 },
  ];

  const maxRevenue = Math.max(...weeklyData.map((d) => d.revenue));

  const topProducts = [...products]
    .sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border bg-card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}
              >
                <stat.icon className="h-4.5 w-4.5" />
              </div>
              <span
                className={`flex items-center gap-0.5 text-[11px] font-medium ${
                  stat.up ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {stat.up ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Weekly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border bg-card p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold">Haftalik Ciro</h3>
            <span className="text-xs text-muted-foreground">Son 7 gun</span>
          </div>

          {/* Simple Bar Chart */}
          <div className="flex items-end gap-3 h-48">
            {weeklyData.map((d, i) => (
              <div
                key={d.day}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span className="text-[10px] text-muted-foreground font-medium">
                  {"\u20BA"}
                  {(d.revenue / 1000).toFixed(1)}k
                </span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{
                    height: `${(d.revenue / maxRevenue) * 100}%`,
                  }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                  className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors min-h-[4px]"
                />
                <span className="text-[11px] text-muted-foreground">
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Order Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-xl border bg-card p-4"
          >
            <h3 className="font-semibold text-sm mb-3">Siparis Istatistikleri</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Tamamlanan
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${
                          totalOrders > 0
                            ? (deliveredOrders / totalOrders) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium">
                    {deliveredOrders}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Iptal Edilen
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{
                        width: `${
                          totalOrders > 0
                            ? (cancelledOrders / totalOrders) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium">
                    {cancelledOrders}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Basari Orani
                </span>
                <span className="text-xs font-semibold text-emerald-600">
                  %
                  {totalOrders > 0
                    ? ((deliveredOrders / totalOrders) * 100).toFixed(0)
                    : 0}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Popular Products */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border bg-card p-4"
          >
            <h3 className="font-semibold text-sm mb-3">En Populer Urunler</h3>
            <div className="space-y-2">
              {topProducts.map((product, i) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm flex-1 truncate">
                    {product.name}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground shrink-0">
                    {"\u20BA"}
                    {product.price.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
