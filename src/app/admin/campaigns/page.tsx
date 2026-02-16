"use client";

import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff, Megaphone, Percent, DollarSign, Truck, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAdminStore } from "@/stores/admin.store";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const typeLabels = { percentage: "Yuzde Indirim", fixed: "Sabit Indirim", free_delivery: "Ucretsiz Teslimat" };
const typeIcons = { percentage: Percent, fixed: DollarSign, free_delivery: Truck };

export default function AdminCampaignsPage() {
  const { campaigns, toggleCampaign, removeCampaign, addCampaign } = useAdminStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", code: "", type: "percentage" as "percentage" | "fixed" | "free_delivery", value: 0, minOrder: 100, usageLimit: 500, isActive: true, startDate: "", endDate: "" });

  const handleAdd = () => {
    if (!form.title.trim() || !form.code.trim()) { toast.error("Baslik ve kod zorunlu"); return; }
    addCampaign({ ...form, startDate: form.startDate || new Date().toISOString(), endDate: form.endDate || new Date(Date.now() + 30 * 86400000).toISOString() });
    setForm({ title: "", code: "", type: "percentage", value: 0, minOrder: 100, usageLimit: 500, isActive: true, startDate: "", endDate: "" });
    setShowAdd(false);
    toast.success("Kampanya eklendi");
  };

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-bold">Kampanyalar</h2><p className="text-sm text-muted-foreground">{campaigns.filter((c) => c.isActive).length} aktif kampanya</p></div>
        {!showAdd && <Button size="sm" className="gap-1.5 rounded-xl" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" />Yeni Kampanya</Button>}
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-xl border bg-card p-5 space-y-3">
              <h3 className="font-semibold text-sm">Yeni Kampanya</h3>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Kampanya adi" className="rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50" />
                <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="Kupon kodu" className="rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50 uppercase" />
              </div>
              <div className="flex gap-2">
                {(["percentage", "fixed", "free_delivery"] as const).map((t) => (
                  <button key={t} onClick={() => setForm({ ...form, type: t })} className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-all ${form.type === t ? "border-primary bg-primary/5 text-primary" : "hover:border-primary/30"}`}>
                    {typeLabels[t]}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {form.type !== "free_delivery" && <div><label className="text-[11px] text-muted-foreground mb-1 block">{form.type === "percentage" ? "Yuzde (%)" : "Tutar (TL)"}</label><input type="number" value={form.value || ""} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50" /></div>}
                <div><label className="text-[11px] text-muted-foreground mb-1 block">Min. Siparis (TL)</label><input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50" /></div>
                <div><label className="text-[11px] text-muted-foreground mb-1 block">Kullanim Limiti</label><input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50" /></div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 rounded-xl" onClick={handleAdd}><Check className="mr-1.5 h-4 w-4" />Kaydet</Button>
                <Button variant="outline" className="rounded-xl" onClick={() => setShowAdd(false)}><X className="mr-1.5 h-4 w-4" />Iptal</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {campaigns.map((campaign, i) => {
          const TypeIcon = typeIcons[campaign.type];
          const usagePercent = campaign.usageLimit > 0 ? (campaign.usageCount / campaign.usageLimit) * 100 : 0;
          return (
            <motion.div key={campaign.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className={`rounded-xl border bg-card p-4 ${!campaign.isActive ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0"><TypeIcon className="h-4 w-4" /></div>
                  <div>
                    <div className="flex items-center gap-2"><span className="text-sm font-semibold">{campaign.title}</span><Badge variant="outline" className="text-[10px] font-mono">{campaign.code}</Badge></div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{typeLabels[campaign.type]}{campaign.type !== "free_delivery" && `: ${campaign.type === "percentage" ? `%${campaign.value}` : `${campaign.value} TL`}`} &middot; Min. {"\u20BA"}{campaign.minOrder}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(usagePercent, 100)}%` }} /></div>
                      <span className="text-[10px] text-muted-foreground">{campaign.usageCount}/{campaign.usageLimit}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { toggleCampaign(campaign.id); toast.success(campaign.isActive ? "Kampanya durduruldu" : "Kampanya aktif edildi"); }}>
                    {campaign.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => { removeCampaign(campaign.id); toast.success("Kampanya silindi"); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
        {campaigns.length === 0 && <div className="text-center py-12"><Megaphone className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" /><h3 className="font-semibold">Kampanya yok</h3></div>}
      </div>
    </div>
  );
}
