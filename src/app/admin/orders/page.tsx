"use client";

import { useState } from "react";
import { Search, Package, CreditCard, Banknote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAdminStore } from "@/stores/admin.store";
import { motion } from "framer-motion";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Bekliyor", color: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { label: "Onaylandi", color: "bg-blue-50 text-blue-700 border-blue-200" },
  preparing: { label: "Hazirlaniyor", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  ready: { label: "Hazir", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  delivered: { label: "Teslim", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Iptal", color: "bg-red-50 text-red-700 border-red-200" },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function AdminOrdersPage() {
  const { orders } = useAdminStore();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = orders.filter((o) => {
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase()) || o.restaurant.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Siparis, musteri veya restoran ara..." className="w-full rounded-lg border bg-card pl-9 pr-3 py-2 text-sm outline-none focus:border-primary/50" />
        </div>
        <div className="flex gap-1 rounded-lg border bg-card p-1 overflow-x-auto">
          {[{ key: "all", label: "Tumu" }, { key: "pending", label: "Bekleyen" }, { key: "preparing", label: "Hazirlanan" }, { key: "delivered", label: "Teslim" }, { key: "cancelled", label: "Iptal" }].map((tab) => (
            <button key={tab.key} onClick={() => setFilterStatus(tab.key)} className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${filterStatus === tab.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium text-xs text-muted-foreground">Siparis</th>
                <th className="text-left p-3 font-medium text-xs text-muted-foreground hidden sm:table-cell">Musteri</th>
                <th className="text-left p-3 font-medium text-xs text-muted-foreground hidden md:table-cell">Restoran</th>
                <th className="text-left p-3 font-medium text-xs text-muted-foreground">Durum</th>
                <th className="text-right p-3 font-medium text-xs text-muted-foreground">Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((order, i) => {
                const status = statusConfig[order.status] || { label: order.status, color: "" };
                return (
                  <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-muted/20">
                    <td className="p-3">
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="p-3 hidden sm:table-cell text-muted-foreground">{order.customer}</td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{order.restaurant}</td>
                    <td className="p-3">
                      <Badge variant="outline" className={`text-[10px] ${status.color}`}>{status.label}</Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        {order.payment === "cash" ? <Banknote className="h-3 w-3 text-muted-foreground" /> : <CreditCard className="h-3 w-3 text-muted-foreground" />}
                        <span className="font-semibold">{"\u20BA"}{order.total.toFixed(0)}</span>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Siparis bulunamadi</div>}
      </div>
    </div>
  );
}
