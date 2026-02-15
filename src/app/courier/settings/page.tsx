"use client";

import { useState } from "react";
import {
  User,
  Bike,
  Car,
  MapPin,
  Phone,
  Mail,
  Shield,
  Save,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useCourierPanelStore } from "@/stores/courier-panel.store";

export default function CourierSettingsPage() {
  const { courierName, vehicle, zone } = useCourierPanelStore();

  const [info, setInfo] = useState({
    name: courierName,
    phone: "0532 123 45 67",
    email: "ali.yilmaz@email.com",
    tc: "12345678901",
  });

  const [vehicleForm, setVehicleForm] = useState({
    type: vehicle.type,
    plate: vehicle.plate,
  });

  const [zoneForm, setZoneForm] = useState({
    city: zone.city,
    district: zone.district,
  });

  const [notifications, setNotifications] = useState({
    newOrder: true,
    earnings: true,
    announcements: false,
  });

  const handleSave = () => {
    toast.success("Ayarlar kaydedildi");
  };

  return (
    <div className="space-y-5">
      <h2 className="font-bold text-lg">Ayarlar</h2>

      {/* Personal Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border bg-card p-4"
      >
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
          <User className="h-4 w-4 text-primary" />
          Kisisel Bilgiler
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">
              Ad Soyad
            </label>
            <input
              type="text"
              value={info.name}
              onChange={(e) => setInfo({ ...info, name: e.target.value })}
              className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50"
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
        </div>
      </motion.div>

      {/* Vehicle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border bg-card p-4"
      >
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
          <Bike className="h-4 w-4 text-primary" />
          Arac Bilgileri
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] text-muted-foreground mb-1.5 block">
              Arac Tipi
            </label>
            <div className="flex gap-2">
              {[
                { key: "bicycle", label: "Bisiklet", icon: Bike },
                { key: "motorcycle", label: "Motorsiklet", icon: Bike },
                { key: "car", label: "Otomobil", icon: Car },
              ].map((v) => (
                <button
                  key={v.key}
                  onClick={() => setVehicleForm({ ...vehicleForm, type: v.key as typeof vehicleForm.type })}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-xs font-medium transition-all ${
                    vehicleForm.type === v.key
                      ? "border-primary bg-primary/5 text-primary"
                      : "hover:border-primary/30"
                  }`}
                >
                  <v.icon className="h-3.5 w-3.5" />
                  {v.label}
                </button>
              ))}
            </div>
          </div>
          {vehicleForm.type !== "bicycle" && (
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">
                Plaka
              </label>
              <input
                type="text"
                value={vehicleForm.plate}
                onChange={(e) =>
                  setVehicleForm({ ...vehicleForm, plate: e.target.value.toUpperCase() })
                }
                placeholder="34 ABC 123"
                className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50"
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Zone */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border bg-card p-4"
      >
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
          <MapPin className="h-4 w-4 text-primary" />
          Calisma Bolgesi
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">
              Sehir
            </label>
            <input
              type="text"
              value={zoneForm.city}
              onChange={(e) => setZoneForm({ ...zoneForm, city: e.target.value })}
              className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">
              Ilce
            </label>
            <input
              type="text"
              value={zoneForm.district}
              onChange={(e) =>
                setZoneForm({ ...zoneForm, district: e.target.value })
              }
              className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50"
            />
          </div>
        </div>
      </motion.div>

      {/* Documents */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border bg-card p-4"
      >
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-primary" />
          Belgeler
        </h3>

        <div className="space-y-2">
          {[
            { label: "Kimlik Belgesi", status: "approved" },
            { label: "Ehliyet", status: "approved" },
            { label: "SGK Belgesi", status: "pending" },
          ].map((doc) => (
            <div
              key={doc.label}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <span className="text-sm">{doc.label}</span>
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  doc.status === "approved"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {doc.status === "approved" ? "Onayli" : "Bekliyor"}
              </Badge>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border bg-card p-4"
      >
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
          <Bell className="h-4 w-4 text-primary" />
          Bildirimler
        </h3>

        <div className="space-y-2">
          {[
            { key: "newOrder", label: "Yeni siparis", desc: "Siparis geldiginde bildirim" },
            { key: "earnings", label: "Kazanc bildirimi", desc: "Gunluk kazanc ozeti" },
            { key: "announcements", label: "Duyurular", desc: "Platform duyurulari" },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="text-sm">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[item.key as keyof typeof notifications]}
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

      {/* Save */}
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
