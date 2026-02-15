"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  Pencil,
  Check,
  X,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRestaurantPanelStore } from "@/stores/restaurant-panel.store";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function MenuManagementPage() {
  const { categories, products, addCategory, removeCategory } =
    useRestaurantPanelStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    if (!newName.trim()) {
      toast.error("Kategori adi bos olamaz");
      return;
    }
    addCategory(newName.trim());
    setNewName("");
    setShowAdd(false);
    toast.success("Kategori eklendi");
  };

  const handleRemove = (id: string, name: string) => {
    const productCount = products.filter((p) => p.categoryId === id).length;
    if (productCount > 0) {
      toast.error(`${name} kategorisinde ${productCount} urun var, once urunleri tasiyin`);
      return;
    }
    removeCategory(id);
    toast.success("Kategori silindi");
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Menu Kategorileri</h2>
          <p className="text-sm text-muted-foreground">
            Kategori ekleyin, duzenleyin veya silin
          </p>
        </div>
        {!showAdd && (
          <Button
            size="sm"
            className="gap-1.5 rounded-xl"
            onClick={() => setShowAdd(true)}
          >
            <Plus className="h-4 w-4" />
            Yeni Kategori
          </Button>
        )}
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border bg-card p-4 flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Kategori adi (orn: Tatlilar)"
                className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                autoFocus
              />
              <Button size="sm" className="rounded-lg gap-1" onClick={handleAdd}>
                <Check className="h-3.5 w-3.5" />
                Ekle
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg"
                onClick={() => {
                  setShowAdd(false);
                  setNewName("");
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories List */}
      <div className="rounded-xl border bg-card divide-y">
        <AnimatePresence>
          {categories.map((cat, i) => {
            const productCount = products.filter(
              (p) => p.categoryId === cat.id
            ).length;

            return (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{cat.name}</span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {productCount} urun
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-muted-foreground mr-2">
                    #{cat.order}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemove(cat.id, cat.name)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {categories.length === 0 && (
          <div className="text-center py-10">
            <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">
              Henuz kategori eklenmemis
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
