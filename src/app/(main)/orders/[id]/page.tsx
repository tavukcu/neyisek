"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ChefHat,
  MapPin,
  CreditCard,
  Banknote,
  Phone,
  MessageSquare,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useOrder } from "@/hooks/use-orders";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatDate, formatTime } from "@/lib/date-utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useState } from "react";
import type { OrderStatus } from "@/types";

const timelineIcons: Record<string, React.ElementType> = {
  pending: Clock,
  confirmed: CheckCircle2,
  preparing: ChefHat,
  ready: Package,
  courier_assigned: Truck,
  picked_up: Truck,
  delivering: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

const timelineColors: Record<string, string> = {
  pending: "bg-amber-500",
  confirmed: "bg-blue-500",
  preparing: "bg-blue-500",
  ready: "bg-emerald-500",
  courier_assigned: "bg-indigo-500",
  picked_up: "bg-indigo-500",
  delivering: "bg-indigo-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-red-500",
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { order, isLoading } = useOrder(id);
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-4 h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="mb-5 space-y-2">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-5">
          <div className="h-48 animate-pulse rounded-xl bg-muted" />
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Package className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold">Siparis Bulunamadi</h1>
        <p className="mt-2 text-muted-foreground">
          Bu siparis mevcut degil veya silinmis olabilir
        </p>
        <Link href="/orders">
          <Button className="mt-6">Siparislerime Don</Button>
        </Link>
      </div>
    );
  }

  const statusInfo = ORDER_STATUSES[order.status as OrderStatus];
  const isActive = !["delivered", "cancelled"].includes(order.status);
  const restaurantName = (order as unknown as { restaurantName?: string }).restaurantName || "Restoran";

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    toast.success("Siparis numarasi kopyalandi");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Back */}
      <Link
        href="/orders"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Siparislerim
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{restaurantName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={handleCopyOrderNumber}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {order.orderNumber}
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
              <span className="text-muted-foreground">&middot;</span>
              <span className="text-xs text-muted-foreground">
                {formatDate(order.createdAt)}
              </span>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`shrink-0 ${
              order.status === "delivered"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : order.status === "cancelled"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {statusInfo?.label}
          </Badge>
        </div>
      </motion.div>

      <div className="space-y-5">
        {/* Status Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border bg-card p-5"
        >
          <h2 className="font-semibold text-sm mb-4">Siparis Durumu</h2>

          {/* Progress bar */}
          {isActive && (
            <div className="mb-5">
              <OrderProgressBar status={order.status} />
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-0">
            {order.statusHistory.map((entry, i) => {
              const Icon = timelineIcons[entry.status] || Clock;
              const color = timelineColors[entry.status] || "bg-gray-400";
              const isLast = i === order.statusHistory.length - 1;
              const label =
                ORDER_STATUSES[entry.status as OrderStatus]?.label ||
                entry.status;

              return (
                <div key={i} className="flex gap-3">
                  {/* Timeline dot + line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-white shrink-0 ${
                        isLast ? color : "bg-muted-foreground/20"
                      }`}
                    >
                      <Icon
                        className={`h-3.5 w-3.5 ${
                          isLast ? "" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    {!isLast && (
                      <div className="w-0.5 h-6 bg-muted-foreground/15" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-4">
                    <span
                      className={`text-sm font-medium ${
                        isLast ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">
                        {formatTime(entry.timestamp)}
                      </span>
                      {entry.note && (
                        <span className="text-[11px] text-muted-foreground">
                          &middot; {entry.note}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border bg-card p-5"
        >
          <h2 className="font-semibold text-sm mb-3">Siparis Detayi</h2>
          <div className="space-y-3">
            {order.items.map((item, i) => {
              const extrasTotal = item.extras.reduce((s, e) => s + e.price, 0);
              const itemTotal = (item.price + extrasTotal) * item.quantity;
              return (
                <div key={i}>
                  {i > 0 && <Separator className="mb-3" />}
                  <div className="flex justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary shrink-0">
                          {item.quantity}x
                        </span>
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      {item.extras.length > 0 && (
                        <p className="mt-0.5 ml-7 text-[11px] text-muted-foreground">
                          +{item.extras.map((e) => e.name).join(", ")}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-medium shrink-0">
                      {"\u20BA"}
                      {itemTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator className="my-3" />

          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ara Toplam</span>
              <span>
                {"\u20BA"}
                {order.pricing.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Teslimat Ucreti</span>
              <span>
                {order.pricing.deliveryFee === 0 ? (
                  <span className="text-emerald-600 font-medium">Ucretsiz</span>
                ) : (
                  <>
                    {"\u20BA"}
                    {order.pricing.deliveryFee.toFixed(2)}
                  </>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hizmet Bedeli</span>
              <span>
                {"\u20BA"}
                {order.pricing.serviceFee.toFixed(2)}
              </span>
            </div>
            {order.pricing.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Indirim</span>
                <span>
                  -{"\u20BA"}
                  {order.pricing.discount.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <Separator className="my-3" />

          <div className="flex justify-between font-bold">
            <span>Toplam</span>
            <span className="text-primary">
              {"\u20BA"}
              {order.pricing.total.toFixed(2)}
            </span>
          </div>
        </motion.div>

        {/* Delivery & Payment Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid gap-4 sm:grid-cols-2"
        >
          {/* Delivery */}
          <div className="rounded-xl border bg-card p-4">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Teslimat
            </h3>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm">{order.delivery.address}</p>
                {order.delivery.estimatedTime && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Tahmini: {order.delivery.estimatedTime} dk
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-xl border bg-card p-4">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Odeme
            </h3>
            <div className="flex items-center gap-2">
              {order.payment.method === "credit_card" ? (
                <CreditCard className="h-4 w-4 text-primary" />
              ) : (
                <Banknote className="h-4 w-4 text-primary" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {order.payment.method === "credit_card"
                    ? "Kredi Karti"
                    : "Kapida Odeme"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {order.payment.status === "paid"
                    ? "Odendi"
                    : order.payment.status === "pending"
                    ? "Odeme bekliyor"
                    : "Basarisiz"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3"
        >
          {isActive && (
            <>
              <Button variant="outline" className="flex-1 gap-1.5 rounded-xl">
                <Phone className="h-4 w-4" />
                Restorani Ara
              </Button>
              <Button variant="outline" className="flex-1 gap-1.5 rounded-xl">
                <MessageSquare className="h-4 w-4" />
                Destek
              </Button>
            </>
          )}
          {order.status === "delivered" && (
            <Link href="/menu" className="flex-1">
              <Button className="w-full gap-1.5 rounded-xl">
                <RotateCcw className="h-4 w-4" />
                Tekrar Siparis Ver
              </Button>
            </Link>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function OrderProgressBar({ status }: { status: string }) {
  const steps = [
    { key: "pending", label: "Onay" },
    { key: "confirmed", label: "Hazirlaniyor" },
    { key: "delivering", label: "Yolda" },
    { key: "delivered", label: "Teslim" },
  ];

  const mapping: Record<string, number> = {
    pending: 0,
    confirmed: 1,
    preparing: 1,
    ready: 2,
    courier_assigned: 2,
    picked_up: 2,
    delivering: 2,
    delivered: 3,
    cancelled: -1,
  };

  const currentIndex = mapping[status] ?? 0;

  if (status === "cancelled") {
    return (
      <div className="text-center text-sm text-destructive font-medium">
        Siparis iptal edildi
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {steps.map((step, i) => (
        <div key={step.key} className="flex-1 flex flex-col items-center">
          <div className="flex items-center w-full">
            {i > 0 && (
              <div
                className={`flex-1 h-0.5 ${
                  i <= currentIndex ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
            <div
              className={`h-3 w-3 rounded-full shrink-0 ${
                i <= currentIndex
                  ? i === currentIndex
                    ? "bg-primary ring-4 ring-primary/20"
                    : "bg-primary"
                  : "bg-muted"
              }`}
            />
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 ${
                  i < currentIndex ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
          <span
            className={`text-[10px] mt-1.5 ${
              i <= currentIndex
                ? "text-primary font-medium"
                : "text-muted-foreground"
            }`}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}
