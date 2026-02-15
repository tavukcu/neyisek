"use client";

import {
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  CreditCard,
  Banknote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCourierPanelStore } from "@/stores/courier-panel.store";
import { motion } from "framer-motion";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function duration(start: string, end: string) {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.round(diff / 60000);
}

export default function CourierHistoryPage() {
  const { completedDeliveries } = useCourierPanelStore();

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-lg">Teslimat Gecmisi</h2>

      {completedDeliveries.length === 0 ? (
        <div className="text-center py-16">
          <Package className="mx-auto h-14 w-14 text-muted-foreground/30 mb-3" />
          <h3 className="font-semibold">Henuz teslimat yok</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Tamamlanan teslimatlariniz burada gorunecek
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {completedDeliveries.map((delivery, i) => (
            <motion.div
              key={delivery.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {delivery.restaurantName}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200"
                    >
                      <CheckCircle2 className="mr-0.5 h-2.5 w-2.5" />
                      Teslim Edildi
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {delivery.orderNumber}
                  </p>
                </div>
                <span className="text-sm font-bold text-emerald-600 shrink-0">
                  +{"\u20BA"}{delivery.fee.toFixed(0)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mb-2">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">
                  {delivery.customerAddress}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {delivery.completedAt
                    ? `${duration(delivery.createdAt, delivery.completedAt)} dk`
                    : "-"}
                </div>
                <span>{delivery.distance} km</span>
                <div className="flex items-center gap-1">
                  {delivery.payment.method === "cash" ? (
                    <Banknote className="h-3 w-3" />
                  ) : (
                    <CreditCard className="h-3 w-3" />
                  )}
                  {delivery.payment.method === "cash" ? "Nakit" : "Kart"}
                </div>
                <span className="ml-auto">{formatDate(delivery.createdAt)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
