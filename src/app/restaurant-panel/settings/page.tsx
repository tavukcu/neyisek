"use client";

import { useState } from "react";
import {
  Store,
  Clock,
  Truck,
  CreditCard,
  Phone,
  Mail,
  Globe,
  MapPin,
  Save,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { motion } from "framer-motion";

const days = [
  { key: "monday", label: "Pazartesi" },
  { key: "tuesday", label: "Sali" },
  { key: "wednesday", label: "Carsamba" },
  { key: "thursday", label: "Persembe" },
  { key: "friday", label: "Cuma" },
  { key: "saturday", label: "Cumartesi" },
  { key: "sunday", label: "Pazar" },
];

export default function SettingsPage() {
  const [info, setInfo] = useState({
    name: "Burger King",
    description: "Ateste izgara lezzeti ile dunyanin en sevilen burgerleri",
    phone: "0212 555 0001",
    email: "info@burgerking.com.tr",
    website: "burgerking.com.tr",
    address: "Bagdat Cad. No:123, Kadikoy, Istanbul",
  });

  const [delivery, setDelivery] = useState({
    fee: 9.99,
    minOrder: 50,
    estimatedTime: 30,
    radius: 5,
    hasPickup: true,
    hasDelivery: true,
    acceptsCard: true,
  });

  const [hours, setHours] = useState<
    Record<string, { open: string; close: string; isOpen: boolean }>
  >({
    monday: { open: "10:00", close: "23:00", isOpen: true },
    tuesday: { open: "10:00", close: "23:00", isOpen: true },
    wednesday: { open: "10:00", close: "23:00", isOpen: true },
    thursday: { open: "10:00", close: "23:00", isOpen: true },
    friday: { open: "10:00", close: "00:00", isOpen: true },
    saturday: { open: "10:00", close: "00:00", isOpen: true },
    sunday: { open: "11:00", close: "23:00", isOpen: true },
  });

  const [notifications, setNotifications] = useState({
    newOrder: true,
    orderCancel: true,
    newReview: true,
    dailyReport: false,
  });

  const handleSave = () => {
    toast.success("Ayarlar kaydedildi");
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Restaurant Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border bg-card p-5"
      >
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <Store className="h-4 w-4 text-primary" />
          Restoran Bilgileri
        </h2>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">
              Restoran Adi
            </label>
            <input
              type="text"
              value={info.name}
              onChange={(e) => setInfo({ ...info, name: e.target.value })}
              className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">
              Aciklama
            </label>
            <textarea
              value={info.description}
              onChange={(e) =>
                setInfo({ ...info, description: e.target.value })
              }
              rows={2}
              className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1">
                <Phone className="h-3 w-3" /> Telefon
              </label>
              <input
                type="text"
                value={info.phone}
                onChange={(e) => setInfo({ ...info, phone: e.target.value })}
                className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1">
                <Mail className="h-3 w-3" /> E-posta
              </label>
              <input
                type="text"
                value={info.email}
                onChange={(e) => setInfo({ ...info, email: e.target.value })}
                className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Adres
            </label>
            <input
              type="text"
              value={info.address}
              onChange={(e) => setInfo({ ...info, address: e.target.value })}
              className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50"
            />
          </div>
        </div>
      </motion.div>

      {/* Working Hours */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border bg-card p-5"
      >
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-primary" />
          Calisma Saatleri
        </h2>

        <div className="space-y-2">
          {days.map(({ key, label }) => {
            const day = hours[key];
            return (
              <div
                key={key}
                className="flex items-center gap-3 rounded-lg border p-2.5"
              >
                <label className="flex items-center gap-2 cursor-pointer w-28 shrink-0">
                  <input
                    type="checkbox"
                    checked={day.isOpen}
                    onChange={(e) =>
                      setHours({
                        ...hours,
                        [key]: { ...day, isOpen: e.target.checked },
                      })
                    }
                    className="accent-primary"
                  />
                  <span
                    className={`text-xs font-medium ${
                      !day.isOpen ? "text-muted-foreground" : ""
                    }`}
                  >
                    {label}
                  </span>
                </label>

                {day.isOpen ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={day.open}
                      onChange={(e) =>
                        setHours({
                          ...hours,
                          [key]: { ...day, open: e.target.value },
                        })
                      }
                      className="rounded-md border bg-background px-2 py-1 text-xs outline-none focus:border-primary/50"
                    />
                    <span className="text-xs text-muted-foreground">-</span>
                    <input
                      type="time"
                      value={day.close}
                      onChange={(e) =>
                        setHours({
                          ...hours,
                          [key]: { ...day, close: e.target.value },
                        })
                      }
                      className="rounded-md border bg-background px-2 py-1 text-xs outline-none focus:border-primary/50"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Kapali</span>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Delivery Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border bg-card p-5"
      >
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <Truck className="h-4 w-4 text-primary" />
          Teslimat Ayarlari
        </h2>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">
              Teslimat Ucreti (TL)
            </label>
            <input
              type="number"
              value={delivery.fee}
              onChange={(e) =>
                setDelivery({ ...delivery, fee: Number(e.target.value) })
              }
              className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">
              Min. Siparis (TL)
            </label>
            <input
              type="number"
              value={delivery.minOrder}
              onChange={(e) =>
                setDelivery({ ...delivery, minOrder: Number(e.target.value) })
              }
              className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">
              Tahmini Teslimat (dk)
            </label>
            <input
              type="number"
              value={delivery.estimatedTime}
              onChange={(e) =>
                setDelivery({
                  ...delivery,
                  estimatedTime: Number(e.target.value),
                })
              }
              className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">
              Teslimat Yaricapi (km)
            </label>
            <input
              type="number"
              value={delivery.radius}
              onChange={(e) =>
                setDelivery({ ...delivery, radius: Number(e.target.value) })
              }
              className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={delivery.hasDelivery}
              onChange={(e) =>
                setDelivery({ ...delivery, hasDelivery: e.target.checked })
              }
              className="accent-primary"
            />
            <span className="text-xs">Teslimat</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={delivery.hasPickup}
              onChange={(e) =>
                setDelivery({ ...delivery, hasPickup: e.target.checked })
              }
              className="accent-primary"
            />
            <span className="text-xs">Gel Al</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={delivery.acceptsCard}
              onChange={(e) =>
                setDelivery({ ...delivery, acceptsCard: e.target.checked })
              }
              className="accent-primary"
            />
            <span className="text-xs">Kart Kabul</span>
          </label>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border bg-card p-5"
      >
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <Bell className="h-4 w-4 text-primary" />
          Bildirim Ayarlari
        </h2>

        <div className="space-y-3">
          {[
            {
              key: "newOrder",
              label: "Yeni siparis bildirimi",
              desc: "Yeni siparis geldiginde bildirim al",
            },
            {
              key: "orderCancel",
              label: "Siparis iptali",
              desc: "Siparis iptal edildiginde bildirim al",
            },
            {
              key: "newReview",
              label: "Yeni degerlendirme",
              desc: "Musteri degerlendirme yaptiginda bildirim al",
            },
            {
              key: "dailyReport",
              label: "Gunluk rapor",
              desc: "Her gun saat 21:00'de ozet rapor al",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    notifications[item.key as keyof typeof notifications]
                  }
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      [item.key]: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Save Button */}
      <Button
        className="w-full h-11 rounded-xl gap-2 text-sm font-semibold"
        onClick={handleSave}
      >
        <Save className="h-4 w-4" />
        Ayarlari Kaydet
      </Button>
    </div>
  );
}
