"use client";

import { useState } from "react";
import { Search, Users, Shield, Store, Truck, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAdminStore } from "@/stores/admin.store";
import { toast } from "sonner";
import { motion } from "framer-motion";

const roleLabels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  customer: { label: "Musteri", color: "bg-blue-50 text-blue-700", icon: Users },
  restaurant: { label: "Restoran", color: "bg-emerald-50 text-emerald-700", icon: Store },
  courier: { label: "Kurye", color: "bg-purple-50 text-purple-700", icon: Truck },
  admin: { label: "Admin", color: "bg-red-50 text-red-700", icon: Shield },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: "Aktif", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  suspended: { label: "Askida", color: "bg-amber-50 text-amber-700 border-amber-200" },
  banned: { label: "Banlı", color: "bg-red-50 text-red-700 border-red-200" },
};

export default function AdminUsersPage() {
  const { users, updateUserStatus } = useAdminStore();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Kullanici ara..." className="w-full rounded-lg border bg-card pl-9 pr-3 py-2 text-sm outline-none focus:border-primary/50" />
        </div>
        <div className="flex gap-1 rounded-lg border bg-card p-1">
          {[{ key: "all", label: "Tumu" }, { key: "customer", label: "Musteri" }, { key: "restaurant", label: "Restoran" }, { key: "courier", label: "Kurye" }, { key: "admin", label: "Admin" }].map((tab) => (
            <button key={tab.key} onClick={() => setFilterRole(tab.key)} className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${filterRole === tab.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
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
                <th className="text-left p-3 font-medium text-xs text-muted-foreground">Kullanici</th>
                <th className="text-left p-3 font-medium text-xs text-muted-foreground hidden sm:table-cell">Rol</th>
                <th className="text-left p-3 font-medium text-xs text-muted-foreground hidden md:table-cell">Telefon</th>
                <th className="text-left p-3 font-medium text-xs text-muted-foreground">Durum</th>
                <th className="text-right p-3 font-medium text-xs text-muted-foreground">Islem</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((user, i) => {
                const role = roleLabels[user.role];
                const status = statusLabels[user.status];
                return (
                  <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-muted/20">
                    <td className="p-3">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-[11px] text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      <Badge variant="secondary" className={`text-[10px] ${role.color}`}>{role.label}</Badge>
                    </td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">{user.phone}</td>
                    <td className="p-3">
                      <Badge variant="outline" className={`text-[10px] ${status.color}`}>{status.label}</Badge>
                    </td>
                    <td className="p-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.status !== "active" && (
                            <DropdownMenuItem onClick={() => { updateUserStatus(user.id, "active"); toast.success("Kullanici aktif edildi"); }}>
                              Aktif Et
                            </DropdownMenuItem>
                          )}
                          {user.status !== "suspended" && (
                            <DropdownMenuItem onClick={() => { updateUserStatus(user.id, "suspended"); toast.success("Kullanici askiya alindi"); }}>
                              Askiya Al
                            </DropdownMenuItem>
                          )}
                          {user.status !== "banned" && (
                            <DropdownMenuItem className="text-destructive" onClick={() => { updateUserStatus(user.id, "banned"); toast.success("Kullanici banlandi"); }}>
                              Banla
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Kullanici bulunamadi</div>}
      </div>
    </div>
  );
}
