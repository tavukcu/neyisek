"use client";

import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  DollarSign,
  Star,
  Clock,
  ChevronRight,
  CreditCard,
  Banknote,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRestaurantPanelStore } from "@/stores/restaurant-panel.store";
import { ORDER_STATUSES } from "@/lib/constants";
import { motion } from "framer-motion";
import type { OrderStatus } from "@/types";

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Az once";
  if (mins < 60) return `${mins} dk once`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat once`;
  return `${Math.floor(hours / 24)} gun once`;
}

const statusBadgeColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  preparing: "bg-indigo-50 text-indigo-700 border-indigo-200",
  ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function RestaurantDashboard() {
  const { orders, reviews } = useRestaurantPanelStore();

  const activeOrders = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status)
  );
  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt).toDateString() === new Date().toDateString()
  );
  const todayRevenue = todayOrders.reduce((s, o) => s + o.pricing.total, 0);
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const kpis = [
    {
      label: "Bugunun Siparisleri",
      value: todayOrders.length.toString(),
      icon: ShoppingBag,
      trend: "+12%",
      trendUp: true,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Bugunun Cirosu",
      value: `\u20BA${todayRevenue.toFixed(0)}`,
      icon: DollarSign,
      trend: "+8%",
      trendUp: true,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Ortalama Puan",
      value: avgRating.toFixed(1),
      icon: Star,
      trend: reviews.length + " degerlendirme",
      trendUp: true,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Aktif Siparisler",
      value: activeOrders.length.toString(),
      icon: Clock,
      trend: "Bekliyor",
      trendUp: false,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border bg-card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${kpi.color}`}
              >
                <kpi.icon className="h-4.5 w-4.5" />
              </div>
              <span
                className={`flex items-center gap-0.5 text-[11px] font-medium ${
                  kpi.trendUp ? "text-emerald-600" : "text-muted-foreground"
                }`}
              >
                {kpi.trendUp && kpi.trend.startsWith("+") && (
                  <TrendingUp className="h-3 w-3" />
                )}
                {kpi.trend}
              </span>
            </div>
            <p className="text-2xl font-bold">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border bg-card"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold">Son Siparisler</h2>
            <Link href="/restaurant-panel/orders">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                Tumunu Gor
                <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          <div className="divide-y">
            {orders.slice(0, 5).map((order) => {
              const statusInfo = ORDER_STATUSES[order.status as OrderStatus];
              return (
                <div
                  key={order.id}
                  className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium">
                        {order.orderNumber}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${
                          statusBadgeColors[order.status] || ""
                        }`}
                      >
                        {statusInfo?.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {order.customerName} &middot;{" "}
                      {order.items
                        .map((i) => `${i.quantity}x ${i.name}`)
                        .join(", ")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">
                      {"\u20BA"}
                      {order.pricing.total.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      {order.payment.method === "credit_card" ? (
                        <CreditCard className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <Banknote className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {formatTimeAgo(order.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Active Orders Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-xl border bg-card p-4"
          >
            <h3 className="font-semibold text-sm mb-3">Siparis Dagilimi</h3>
            <div className="space-y-2">
              {(
                [
                  "pending",
                  "confirmed",
                  "preparing",
                  "ready",
                  "delivered",
                ] as OrderStatus[]
              ).map((status) => {
                const count = orders.filter((o) => o.status === status).length;
                const statusInfo = ORDER_STATUSES[status];
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          status === "pending"
                            ? "bg-amber-500"
                            : status === "confirmed"
                            ? "bg-blue-500"
                            : status === "preparing"
                            ? "bg-indigo-500"
                            : status === "ready"
                            ? "bg-emerald-500"
                            : "bg-emerald-400"
                        }`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {statusInfo?.label}
                      </span>
                    </div>
                    <span className="text-xs font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Recent Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border bg-card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Son Degerlendirmeler</h3>
              <Link href="/restaurant-panel/reviews">
                <Button variant="ghost" size="sm" className="text-[10px] h-7 gap-1">
                  Tumunu Gor
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">
                      {review.customerName}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-2.5 w-2.5 ${
                            i < review.rating
                              ? "text-amber-500 fill-amber-500"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
