"use client";

import Link from "next/link";
import {
  Package,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  CreditCard,
  Banknote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/date-utils";
import { motion } from "framer-motion";
import type { OrderStatus } from "@/types";

const statusIcons: Record<string, React.ElementType> = {
  pending: Clock,
  confirmed: CheckCircle2,
  preparing: Package,
  ready: CheckCircle2,
  courier_assigned: Truck,
  picked_up: Truck,
  delivering: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  preparing: "bg-blue-50 text-blue-700 border-blue-200",
  ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
  courier_assigned: "bg-blue-50 text-blue-700 border-blue-200",
  picked_up: "bg-blue-50 text-blue-700 border-blue-200",
  delivering: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const { orders, isLoading } = useOrders();

  const activeOrders = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status)
  );
  const pastOrders = orders.filter((o) =>
    ["delivered", "cancelled"].includes(o.status)
  );

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Package className="mx-auto h-14 w-14 text-muted-foreground/30 mb-3" />
        <h1 className="text-2xl font-bold">Siparislerim</h1>
        <p className="mt-2 text-muted-foreground">
          Siparislerinizi gormek icin giris yapin
        </p>
        <Link href="/login">
          <Button className="mt-6">Giris Yap</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Siparislerim</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="mx-auto h-14 w-14 text-muted-foreground/30 mb-3" />
          <h3 className="font-semibold text-lg">Henuz siparis yok</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Ilk siparisinizi verin, burada gorunecek
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-1 mt-4 text-sm text-primary font-medium hover:underline"
          >
            Restoranlari Kesfet
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <>
          {/* Active Orders */}
          {activeOrders.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Aktif Siparisler
              </h2>
              <div className="space-y-3">
                {activeOrders.map((order, i) => {
                  const StatusIcon = statusIcons[order.status] || Package;
                  const statusInfo = ORDER_STATUSES[order.status as OrderStatus];
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link href={`/orders/${order.id}`}>
                        <div className="rounded-xl border bg-card p-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">
                                  {(order as unknown as { restaurantName?: string }).restaurantName || "Restoran"}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] px-1.5 py-0 ${statusColors[order.status]}`}
                                >
                                  <StatusIcon className="mr-0.5 h-2.5 w-2.5" />
                                  {statusInfo?.label}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {order.orderNumber} &middot;{" "}
                                {order.items.length} urun
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-primary">
                                {"\u20BA"}
                                {order.pricing.total.toFixed(2)}
                              </span>
                              <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 ml-auto" />
                            </div>
                          </div>

                          {/* Progress bar for active orders */}
                          <div className="mt-3">
                            <OrderProgress status={order.status} />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past Orders */}
          {pastOrders.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Gecmis Siparisler
              </h2>
              <div className="space-y-3">
                {pastOrders.map((order, i) => {
                  const StatusIcon = statusIcons[order.status] || Package;
                  const statusInfo = ORDER_STATUSES[order.status as OrderStatus];
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link href={`/orders/${order.id}`}>
                        <div className="rounded-xl border bg-card p-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">
                                  {(order as unknown as { restaurantName?: string }).restaurantName || "Restoran"}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] px-1.5 py-0 ${statusColors[order.status]}`}
                                >
                                  <StatusIcon className="mr-0.5 h-2.5 w-2.5" />
                                  {statusInfo?.label}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {order.orderNumber} &middot;{" "}
                                {order.items
                                  .map((it) => `${it.quantity}x ${it.name}`)
                                  .join(", ")}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold">
                                {"\u20BA"}
                                {order.pricing.total.toFixed(2)}
                              </span>
                              <div className="flex items-center gap-1 mt-1 justify-end text-muted-foreground">
                                {order.payment.method === "credit_card" ? (
                                  <CreditCard className="h-3 w-3" />
                                ) : (
                                  <Banknote className="h-3 w-3" />
                                )}
                                <ChevronRight className="h-4 w-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OrderProgress({ status }: { status: string }) {
  const steps = ["pending", "confirmed", "preparing", "delivering", "delivered"];
  const currentIndex = steps.indexOf(
    ["ready", "courier_assigned", "picked_up"].includes(status)
      ? "delivering"
      : status
  );

  return (
    <div className="flex gap-1">
      {steps.map((step, i) => (
        <div
          key={step}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i <= currentIndex
              ? status === "cancelled"
                ? "bg-destructive/60"
                : "bg-primary"
              : "bg-muted"
          }`}
        />
      ))}
    </div>
  );
}
