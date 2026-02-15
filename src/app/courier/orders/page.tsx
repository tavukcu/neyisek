"use client";

import {
  MapPin,
  Phone,
  Navigation,
  Package,
  Clock,
  CheckCircle2,
  Banknote,
  CreditCard,
  Store,
  User,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCourierPanelStore } from "@/stores/courier-panel.store";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const statusLabels: Record<string, string> = {
  waiting: "Restorandan Al",
  picked_up: "Teslimata Basla",
  delivering: "Teslim Et",
};

const statusBadge: Record<string, string> = {
  waiting: "bg-amber-50 text-amber-700 border-amber-200",
  picked_up: "bg-blue-50 text-blue-700 border-blue-200",
  delivering: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

export default function CourierOrdersPage() {
  const { activeDeliveries, acceptDelivery, updateDeliveryStatus, completeDelivery } =
    useCourierPanelStore();

  const handleAction = (id: string, currentStatus: string) => {
    if (currentStatus === "waiting") {
      acceptDelivery(id);
      toast.success("Siparis alindi, restorana gidin");
    } else if (currentStatus === "picked_up") {
      updateDeliveryStatus(id, "delivering");
      toast.success("Teslimata basladiniz");
    } else if (currentStatus === "delivering") {
      completeDelivery(id);
      toast.success("Teslimat tamamlandi!");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-lg">Aktif Teslimatlar</h2>

      <AnimatePresence>
        {activeDeliveries.map((delivery, i) => (
          <motion.div
            key={delivery.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border bg-card overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 pb-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-xs text-muted-foreground">
                    {delivery.orderNumber}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${statusBadge[delivery.status] || ""}`}
                    >
                      {delivery.status === "waiting"
                        ? "Bekliyor"
                        : delivery.status === "picked_up"
                        ? "Alindi"
                        : "Yolda"}
                    </Badge>
                    {delivery.payment.method === "cash" && delivery.payment.status === "pending" && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-orange-50 text-orange-700 border-orange-200">
                        <Banknote className="mr-0.5 h-2.5 w-2.5" />
                        Nakit Tahsilat
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-lg font-bold text-primary">
                    +{"\u20BA"}{delivery.fee.toFixed(0)}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                    <span>{delivery.distance} km</span>
                    <span>~{delivery.estimatedTime} dk</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Route */}
            <div className="p-4 space-y-3">
              {/* Restaurant */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                    <Store className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="w-0.5 h-4 bg-muted-foreground/15 my-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{delivery.restaurantName}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {delivery.restaurantAddress}
                  </p>
                </div>
              </div>

              {/* Customer */}
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50">
                  <User className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{delivery.customerName}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {delivery.customerAddress}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary">
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Items */}
            <div className="px-4 pb-3">
              <div className="rounded-lg bg-muted/30 p-2.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">
                  Urunler
                </p>
                <p className="text-xs">
                  {delivery.items.map((it) => `${it.quantity}x ${it.name}`).join(", ")}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11px] text-muted-foreground">
                    Siparis Tutari
                  </span>
                  <span className="text-xs font-semibold">
                    {"\u20BA"}{delivery.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="px-4 pb-4 flex gap-2">
              <Button
                className="flex-1 rounded-xl gap-1.5 h-11"
                onClick={() => handleAction(delivery.id, delivery.status)}
              >
                {delivery.status === "waiting" && <Package className="h-4 w-4" />}
                {delivery.status === "picked_up" && <Navigation className="h-4 w-4" />}
                {delivery.status === "delivering" && <CheckCircle2 className="h-4 w-4" />}
                {statusLabels[delivery.status]}
              </Button>
              <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl shrink-0">
                <Navigation className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {activeDeliveries.length === 0 && (
        <div className="text-center py-16">
          <Package className="mx-auto h-14 w-14 text-muted-foreground/30 mb-3" />
          <h3 className="font-semibold">Aktif teslimat yok</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Yeni siparisler geldiginde burada gorunecek
          </p>
        </div>
      )}
    </div>
  );
}
