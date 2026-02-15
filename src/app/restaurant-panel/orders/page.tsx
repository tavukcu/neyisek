"use client";

import { useState } from "react";
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Package,
  Truck,
  XCircle,
  CreditCard,
  Banknote,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRestaurantPanelStore } from "@/stores/restaurant-panel.store";
import { ORDER_STATUSES } from "@/lib/constants";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { OrderStatus } from "@/types";

const tabs = [
  { key: "active", label: "Aktif" },
  { key: "all", label: "Tumu" },
  { key: "delivered", label: "Tamamlanan" },
  { key: "cancelled", label: "Iptal" },
];

const nextStatusMap: Record<string, OrderStatus | null> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "courier_assigned",
  courier_assigned: "picked_up",
  picked_up: "delivering",
  delivering: "delivered",
  delivered: null,
  cancelled: null,
};

const nextStatusLabels: Record<string, string> = {
  pending: "Onayla",
  confirmed: "Hazirlaniyor",
  preparing: "Hazir",
  ready: "Kuryeye Ver",
  courier_assigned: "Alindi",
  picked_up: "Teslimat Basladi",
  delivering: "Teslim Edildi",
};

const statusBadgeColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  preparing: "bg-indigo-50 text-indigo-700 border-indigo-200",
  ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
  courier_assigned: "bg-sky-50 text-sky-700 border-sky-200",
  picked_up: "bg-sky-50 text-sky-700 border-sky-200",
  delivering: "bg-violet-50 text-violet-700 border-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeDiff(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Az once";
  if (mins < 60) return `${mins} dk`;
  return `${Math.floor(mins / 60)} sa ${mins % 60} dk`;
}

export default function RestaurantOrdersPage() {
  const { orders, updateOrderStatus } = useRestaurantPanelStore();
  const [activeTab, setActiveTab] = useState("active");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    if (activeTab === "active")
      return !["delivered", "cancelled"].includes(o.status);
    if (activeTab === "delivered") return o.status === "delivered";
    if (activeTab === "cancelled") return o.status === "cancelled";
    return true;
  });

  const handleNextStatus = (orderId: string, currentStatus: string) => {
    const next = nextStatusMap[currentStatus];
    if (!next) return;
    updateOrderStatus(orderId, next);
    const label = ORDER_STATUSES[next]?.label || next;
    toast.success(`Siparis durumu: ${label}`);
  };

  const handleCancel = (orderId: string) => {
    updateOrderStatus(orderId, "cancelled");
    toast.error("Siparis iptal edildi");
  };

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit">
        {tabs.map((tab) => {
          const count =
            tab.key === "active"
              ? orders.filter(
                  (o) => !["delivered", "cancelled"].includes(o.status)
                ).length
              : tab.key === "delivered"
              ? orders.filter((o) => o.status === "delivered").length
              : tab.key === "cancelled"
              ? orders.filter((o) => o.status === "cancelled").length
              : orders.length;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span
                className={`text-[10px] ${
                  activeTab === tab.key
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                }`}
              >
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((order) => {
            const expanded = expandedId === order.id;
            const statusInfo = ORDER_STATUSES[order.status as OrderStatus];
            const canAdvance = nextStatusMap[order.status] !== null;
            const isActiveOrder = !["delivered", "cancelled"].includes(
              order.status
            );

            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`rounded-xl border bg-card overflow-hidden ${
                  order.status === "pending" ? "border-amber-300 shadow-sm" : ""
                }`}
              >
                {/* Order Header */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() =>
                    setExpandedId(expanded ? null : order.id)
                  }
                >
                  {/* Status indicator */}
                  <div
                    className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                      order.status === "pending"
                        ? "bg-amber-500 animate-pulse"
                        : order.status === "preparing"
                        ? "bg-indigo-500"
                        : order.status === "delivered"
                        ? "bg-emerald-500"
                        : order.status === "cancelled"
                        ? "bg-red-500"
                        : "bg-blue-500"
                    }`}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">
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
                      {order.status === "pending" && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 animate-pulse">
                          Yeni!
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.customerName} &middot;{" "}
                      {order.items.length} urun &middot;{" "}
                      {formatTime(order.createdAt)}
                      {isActiveOrder && (
                        <span className="ml-1 text-primary font-medium">
                          ({timeDiff(order.createdAt)})
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold">
                      {"\u20BA"}
                      {order.pricing.total.toFixed(2)}
                    </span>
                    {order.payment.method === "credit_card" ? (
                      <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    {expanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <Separator />
                      <div className="p-4 space-y-4">
                        {/* Items */}
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Urunler
                          </h4>
                          <div className="space-y-1.5">
                            {order.items.map((item, i) => (
                              <div
                                key={i}
                                className="flex justify-between text-sm"
                              >
                                <div>
                                  <span>
                                    {item.quantity}x {item.name}
                                  </span>
                                  {item.extras.length > 0 && (
                                    <span className="text-xs text-muted-foreground ml-1">
                                      (+
                                      {item.extras
                                        .map((e) => e.name)
                                        .join(", ")}
                                      )
                                    </span>
                                  )}
                                </div>
                                <span className="font-medium shrink-0">
                                  {"\u20BA"}
                                  {(
                                    (item.price +
                                      item.extras.reduce(
                                        (s, e) => s + e.price,
                                        0
                                      )) *
                                    item.quantity
                                  ).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Customer & Delivery */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg border p-3">
                            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                              Musteri
                            </h4>
                            <p className="text-sm font-medium">
                              {order.customerName}
                            </p>
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {order.customerPhone}
                            </div>
                          </div>
                          <div className="rounded-lg border p-3">
                            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                              Teslimat
                            </h4>
                            <div className="flex items-start gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                              <span>{order.delivery.address}</span>
                            </div>
                          </div>
                        </div>

                        {/* Payment */}
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-2">
                            {order.payment.method === "credit_card" ? (
                              <CreditCard className="h-4 w-4 text-primary" />
                            ) : (
                              <Banknote className="h-4 w-4 text-primary" />
                            )}
                            <span className="text-sm">
                              {order.payment.method === "credit_card"
                                ? "Kredi Karti"
                                : "Kapida Odeme"}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              order.payment.status === "paid"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }
                          >
                            {order.payment.status === "paid"
                              ? "Odendi"
                              : "Bekliyor"}
                          </Badge>
                        </div>

                        {/* Actions */}
                        {isActiveOrder && (
                          <div className="flex gap-2">
                            {canAdvance && (
                              <Button
                                className="flex-1 rounded-xl gap-1.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNextStatus(order.id, order.status);
                                }}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                {nextStatusLabels[order.status] || "Ilerle"}
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              className="rounded-xl gap-1.5 text-destructive hover:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancel(order.id);
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                              Iptal
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
            <h3 className="font-semibold">Siparis bulunamadi</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Bu filtrede siparis yok
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
