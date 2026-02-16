"use client";

import { useState } from "react";
import { Settings, Globe, Shield, Bell, CreditCard, Truck, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AdminSettingsPage() {
  const [platform, setPlatform] = useState({ name: "NeYisek", url: "neyisek.com", supportEmail: "destek@neyisek.com", supportPhone: "0850 123 45 67" });
  const [commission, setCommission] = useState({ defaultRate: 12, minRate: 8, maxRate: 20 });
  const [delivery, setDelivery] = useState({ defaultFee: 15, serviceFeeRate: 5, minOrder: 50 });
  const [maintenance, setMaintenance] = useState(false);

  return (
    <div className="max-w-2xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold flex items-center gap-2 mb-4"><Globe className="h-4 w-4 text-primary" />Platform Bilgileri</h2>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[11px] text-muted-foreground mb-1 block">Platform Adi</label><input type="text" value={platform.name} onChange={(e) => setPlatform({ ...platform, name: e.target.value })} className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50" /></div>
            <div><label className="text-[11px] text-muted-foreground mb-1 block">URL</label><input type="text" value={platform.url} onChange={(e) => setPlatform({ ...platform, url: e.target.value })} className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[11px] text-muted-foreground mb-1 block">Destek E-posta</label><input type="text" value={platform.supportEmail} onChange={(e) => setPlatform({ ...platform, supportEmail: e.target.value })} className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50" /></div>
            <div><label className="text-[11px] text-muted-foreground mb-1 block">Destek Telefon</label><input type="text" value={platform.supportPhone} onChange={(e) => setPlatform({ ...platform, supportPhone: e.target.value })} className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50" /></div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold flex items-center gap-2 mb-4"><CreditCard className="h-4 w-4 text-primary" />Komisyon Ayarlari</h2>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-[11px] text-muted-foreground mb-1 block">Varsayilan (%)</label><input type="number" value={commission.defaultRate} onChange={(e) => setCommission({ ...commission, defaultRate: Number(e.target.value) })} className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50" /></div>
          <div><label className="text-[11px] text-muted-foreground mb-1 block">Minimum (%)</label><input type="number" value={commission.minRate} onChange={(e) => setCommission({ ...commission, minRate: Number(e.target.value) })} className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50" /></div>
          <div><label className="text-[11px] text-muted-foreground mb-1 block">Maksimum (%)</label><input type="number" value={commission.maxRate} onChange={(e) => setCommission({ ...commission, maxRate: Number(e.target.value) })} className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50" /></div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold flex items-center gap-2 mb-4"><Truck className="h-4 w-4 text-primary" />Teslimat Ayarlari</h2>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-[11px] text-muted-foreground mb-1 block">Varsayilan Ucret (TL)</label><input type="number" value={delivery.defaultFee} onChange={(e) => setDelivery({ ...delivery, defaultFee: Number(e.target.value) })} className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50" /></div>
          <div><label className="text-[11px] text-muted-foreground mb-1 block">Hizmet Bedeli (%)</label><input type="number" value={delivery.serviceFeeRate} onChange={(e) => setDelivery({ ...delivery, serviceFeeRate: Number(e.target.value) })} className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50" /></div>
          <div><label className="text-[11px] text-muted-foreground mb-1 block">Min. Siparis (TL)</label><input type="number" value={delivery.minOrder} onChange={(e) => setDelivery({ ...delivery, minOrder: Number(e.target.value) })} className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50" /></div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold flex items-center gap-2 mb-4"><Shield className="h-4 w-4 text-primary" />Bakim Modu</h2>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div><p className="text-sm font-medium">Bakim Modu</p><p className="text-[11px] text-muted-foreground">Aktif edildiginde site kullanicilara kapatilir</p></div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={maintenance} onChange={(e) => setMaintenance(e.target.checked)} className="sr-only peer" />
            <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-destructive transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
          </label>
        </div>
      </motion.div>

      <Button className="w-full h-11 rounded-xl gap-2 text-sm font-semibold" onClick={() => toast.success("Ayarlar kaydedildi")}><Save className="h-4 w-4" />Ayarlari Kaydet</Button>
    </div>
  );
}
