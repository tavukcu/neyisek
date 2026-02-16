"use client";

import { useState } from "react";
import { Search, Store, Star, CheckCircle2, XCircle, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAdminStore } from "@/stores/admin.store";
import { toast } from "sonner";
import { motion } from "framer-motion";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Bekliyor", color: "bg-amber-50 text-amber-700 border-amber-200" },
  active: { label: "Aktif", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  suspended: { label: "Askida", color: "bg-red-50 text-red-700 border-red-200" },
  closed: { label: "Kapali", color: "bg-gray-100 text-gray-600 border-gray-200" },
};

export default function AdminRestaurantsPage() {
  const { restaurants, updateRestaurantStatus } = useAdminStore();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = restaurants.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.owner.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleApprove = (id: string) => { updateRestaurantStatus(id, "active"); toast.success("Restoran onaylandi"); };
  const handleSuspend = (id: string) => { updateRestaurantStatus(id, "suspended"); toast.error("Restoran askiya alindi"); };
  const handleReject = (id: string) => { updateRestaurantStatus(id, "closed"); toast.error("Basvuru reddedildi"); };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Restoran ara..." className="w-full rounded-lg border bg-card pl-9 pr-3 py-2 text-sm outline-none focus:border-primary/50" />
        </div>
        <div className="flex gap-1 rounded-lg border bg-card p-1">
          {[{ key: "all", label: "Tumu" }, { key: "pending", label: "Bekleyen" }, { key: "active", label: "Aktif" }, { key: "suspended", label: "Askida" }].map((tab) => (
            <button key={tab.key} onClick={() => setFilterStatus(tab.key)} className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${filterStatus === tab.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((restaurant, i) => {
          const status = statusConfig[restaurant.status];
          return (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`rounded-xl border bg-card p-4 ${restaurant.status === "pending" ? "border-amber-200" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{restaurant.name}</span>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${status.color}`}>{status.label}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {restaurant.owner} &middot; {restaurant.city}, {restaurant.district}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                    <span>{restaurant.cuisine.join(", ")}</span>
                    {restaurant.rating > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        {restaurant.rating}
                      </span>
                    )}
                    <span>{restaurant.ordersCount} siparis</span>
                    <span>%{restaurant.commission} komisyon</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {restaurant.status === "pending" && (
                    <>
                      <Button size="sm" className="h-7 text-[11px] gap-1 rounded-lg" onClick={() => handleApprove(restaurant.id)}>
                        <CheckCircle2 className="h-3 w-3" /> Onayla
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1 rounded-lg text-destructive" onClick={() => handleReject(restaurant.id)}>
                        <XCircle className="h-3 w-3" /> Reddet
                      </Button>
                    </>
                  )}
                  {restaurant.status !== "pending" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {restaurant.status !== "active" && (
                          <DropdownMenuItem onClick={() => handleApprove(restaurant.id)}>Aktif Et</DropdownMenuItem>
                        )}
                        {restaurant.status !== "suspended" && (
                          <DropdownMenuItem onClick={() => handleSuspend(restaurant.id)}>Askiya Al</DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive" onClick={() => handleReject(restaurant.id)}>Kapat</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && <div className="text-center py-12 text-sm text-muted-foreground">Restoran bulunamadi</div>}
      </div>
    </div>
  );
}
