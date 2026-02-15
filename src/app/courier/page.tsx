"use client";

import Link from "next/link";
import {
  Navigation,
  Wallet,
  Star,
  Package,
  TrendingUp,
  ChevronRight,
  MapPin,
  Clock,
  Banknote,
  CreditCard,
  Bike,
  Power,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCourierPanelStore } from "@/stores/courier-panel.store";
import { motion } from "framer-motion";

const statusConfig = {
  available: { label: "Cevrimici", color: "bg-emerald-500", desc: "Siparis bekleniyor" },
  busy: { label: "Mesgul", color: "bg-amber-500", desc: "Teslimat yapiliyor" },
  offline: { label: "Cevrimdisi", color: "bg-gray-400", desc: "Siparis almiyorsunuz" },
};

export default function CourierDashboard() {
  const {
    courierStatus,
    setStatus,
    activeDeliveries,
    todayEarnings,
    todayDeliveries,
    totalDeliveries,
    rating,
  } = useCourierPanelStore();

  const config = statusConfig[courierStatus];

  return (
    <div className="space-y-5">
      {/* Status Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border bg-card p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${config.color} ${courierStatus === "available" ? "animate-pulse" : ""}`} />
            <div>
              <p className="text-sm font-semibold">{config.label}</p>
              <p className="text-[11px] text-muted-foreground">{config.desc}</p>
            </div>
          </div>
          <Power className={`h-5 w-5 ${courierStatus === "offline" ? "text-muted-foreground" : "text-primary"}`} />
        </div>

        <div className="flex gap-2">
          {(["available", "busy", "offline"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                courierStatus === s
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {statusConfig[s].label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Today Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Bugunun Kazanci", value: `\u20BA${todayEarnings.toFixed(0)}`, icon: Wallet, color: "bg-emerald-50 text-emerald-600" },
          { label: "Bugunku Teslimat", value: todayDeliveries.toString(), icon: Package, color: "bg-blue-50 text-blue-600" },
          { label: "Toplam Teslimat", value: totalDeliveries.toString(), icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
          { label: "Puan", value: rating.toFixed(1), icon: Star, color: "bg-amber-50 text-amber-600" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.03 }}
            className="rounded-xl border bg-card p-3"
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg mb-2 ${stat.color}`}>
              <stat.icon className="h-4 w-4" />
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Active Deliveries */}
      {activeDeliveries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Aktif Teslimatlar</h2>
            <Link href="/courier/orders">
              <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
                Tumunu Gor <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {activeDeliveries.slice(0, 2).map((delivery) => (
              <Link key={delivery.id} href="/courier/orders">
                <div className="rounded-xl border bg-card p-4 hover:shadow-md hover:border-primary/20 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{delivery.restaurantName}</span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 ${
                            delivery.status === "waiting"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : delivery.status === "picked_up"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-indigo-50 text-indigo-700 border-indigo-200"
                          }`}
                        >
                          {delivery.status === "waiting" ? "Bekliyor" : delivery.status === "picked_up" ? "Alindi" : "Yolda"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {delivery.orderNumber}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-primary shrink-0">
                      +{"\u20BA"}{delivery.fee.toFixed(0)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {delivery.distance} km
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ~{delivery.estimatedTime} dk
                    </div>
                    <div className="flex items-center gap-1">
                      {delivery.payment.method === "cash" ? (
                        <Banknote className="h-3 w-3" />
                      ) : (
                        <CreditCard className="h-3 w-3" />
                      )}
                      {delivery.payment.method === "cash" ? "Nakit" : "Kart"}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {activeDeliveries.length === 0 && courierStatus === "available" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-10"
        >
          <Bike className="mx-auto h-14 w-14 text-muted-foreground/30 mb-3" />
          <h3 className="font-semibold">Yeni siparis bekleniyor</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Yakininizdaki siparisler burada gorunecek
          </p>
        </motion.div>
      )}

      {courierStatus === "offline" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-10"
        >
          <Power className="mx-auto h-14 w-14 text-muted-foreground/30 mb-3" />
          <h3 className="font-semibold">Cevrimdisisiniz</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Siparis almak icin durumunuzu &quot;Cevrimici&quot; yapın
          </p>
        </motion.div>
      )}
    </div>
  );
}
