"use client";

import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff, GripVertical, Check, X, FolderOpen, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminStore } from "@/stores/admin.store";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminCategoriesPage() {
  const { categories, addCategory, removeCategory, toggleCategory } = useAdminStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");

  const handleAdd = () => {
    if (!newName.trim()) { toast.error("Kategori adi zorunlu"); return; }
    const slug = newSlug.trim() || newName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    addCategory(newName.trim(), slug);
    setNewName(""); setNewSlug(""); setShowAdd(false);
    toast.success("Kategori eklendi");
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Kategoriler</h2>
          <p className="text-sm text-muted-foreground">{categories.length} kategori, {categories.filter((c) => c.isActive).length} aktif</p>
        </div>
        {!showAdd && <Button size="sm" className="gap-1.5 rounded-xl" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" />Yeni Kategori</Button>}
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-xl border bg-card p-4 flex gap-2">
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Kategori adi" className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50" autoFocus />
              <input type="text" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="slug (opsiyonel)" className="w-32 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50" />
              <Button size="sm" className="rounded-lg gap-1" onClick={handleAdd}><Check className="h-3.5 w-3.5" />Ekle</Button>
              <Button size="sm" variant="outline" className="rounded-lg" onClick={() => { setShowAdd(false); setNewName(""); setNewSlug(""); }}><X className="h-3.5 w-3.5" /></Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-xl border bg-card divide-y">
        {categories.map((cat) => (
          <div key={cat.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors ${!cat.isActive ? "opacity-50" : ""}`}>
            <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{cat.name}</span>
                <span className="text-[10px] text-muted-foreground">/{cat.slug}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Store className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">{cat.restaurantCount} restoran</span>
              </div>
            </div>
            <Badge variant="secondary" className="text-[10px]">#{cat.order}</Badge>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { toggleCategory(cat.id); toast.success(cat.isActive ? "Kategori pasif edildi" : "Kategori aktif edildi"); }}>
              {cat.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => { removeCategory(cat.id); toast.success("Kategori silindi"); }}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        {categories.length === 0 && <div className="text-center py-10"><FolderOpen className="mx-auto h-10 w-10 text-muted-foreground/30 mb-2" /><p className="text-sm text-muted-foreground">Kategori yok</p></div>}
      </div>
    </div>
  );
}
