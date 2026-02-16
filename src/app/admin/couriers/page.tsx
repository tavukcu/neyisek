"use client";

import { useState } from "react";
import { Search, Truck, Star, MapPin, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAdminStore } from "@/stores/admin.store";
import { toast } from "sonner";
import { motion } from "framer-motion";

const statusConfig: Record<string, { label: string; color: string }> = {
  available: { label: "Musait", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  busy: { label: "Mesgul", color: "bg-amber-50 text-amber-700 border-amber-200" },
  offline: { label: "Cevrimdisi", color: "bg-gray-100 text-gray-600 border-gray-200" },
  suspended: { label: "Askida", color: "bg-red-50 text-red-700 border-red-200" },
};

export default function AdminCouriersPage() {
  const { couriers, updateCourierStatus } = useAdminStore();
  const [search, setSearch] = useState("");

  const filtered = couriers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.zone.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Kurye ara..." className="w-full rounded-lg border bg-card pl-9 pr-3 py-2 text-sm outline-none focus:border-primary/50" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((courier, i) => {
          const status = statusConfig[courier.status];
          return (
            <motion.div key={courier.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-sm font-semibold">{courier.name}</span>
                  <Badge variant="outline" className={`ml-2 text-[10px] px-1.5 py-0 ${status.color}`}>{status.label}</Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {courier.status !== "available" && <DropdownMenuItem onClick={() => { updateCourierStatus(courier.id, "available"); toast.success("Kurye aktif edildi"); }}>Aktif Et</DropdownMenuItem>}
                    {courier.status !== "suspended" && <DropdownMenuItem className="text-destructive" onClick={() => { updateCourierStatus(courier.id, "suspended"); toast.success("Kurye askiya alindi"); }}>Askiya Al</DropdownMenuItem>}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-1.5 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1"><Truck className="h-3 w-3" />{courier.vehicle}</div>
                <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{courier.zone}</div>
                <div className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" />{courier.rating} puan</div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                  <span>{courier.deliveries} teslimat</span>
                  <span className="font-semibold text-foreground">{"\u20BA"}{courier.earnings.toFixed(0)} kazanc</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      {filtered.length === 0 && <div className="text-center py-12 text-sm text-muted-foreground">Kurye bulunamadi</div>}
    </div>
  );
}
