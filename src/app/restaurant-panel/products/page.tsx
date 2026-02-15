"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Package,
  Eye,
  EyeOff,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRestaurantPanelStore } from "@/stores/restaurant-panel.store";
import type { PanelProduct } from "@/stores/restaurant-panel.store";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const emptyProduct: Omit<PanelProduct, "id"> = {
  name: "",
  description: "",
  price: 0,
  categoryId: "",
  image: "",
  extras: [],
  variants: [],
  isActive: true,
  isPopular: false,
  stock: 100,
  preparationTime: 10,
};

export default function ProductsPage() {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    removeProduct,
    toggleProductActive,
  } = useRestaurantPanelStore();

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct);

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      filterCategory === "all" || p.categoryId === filterCategory;
    return matchSearch && matchCat;
  });

  const resetForm = () => {
    setForm(emptyProduct);
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.categoryId || form.price <= 0) {
      toast.error("Urun adi, kategori ve fiyat zorunludur");
      return;
    }
    if (editingId) {
      updateProduct(editingId, form);
      toast.success("Urun guncellendi");
    } else {
      addProduct(form);
      toast.success("Urun eklendi");
    }
    resetForm();
  };

  const handleEdit = (product: PanelProduct) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      image: product.image,
      extras: product.extras,
      variants: product.variants,
      isActive: product.isActive,
      isPopular: product.isPopular,
      stock: product.stock,
      preparationTime: product.preparationTime,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    removeProduct(id);
    toast.success("Urun silindi");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Urunler</h2>
          <p className="text-sm text-muted-foreground">
            {products.length} urun, {products.filter((p) => p.isActive).length}{" "}
            aktif
          </p>
        </div>
        {!showForm && (
          <Button
            size="sm"
            className="gap-1.5 rounded-xl"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4" />
            Yeni Urun
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border bg-card p-5 space-y-4">
              <h3 className="font-semibold text-sm">
                {editingId ? "Urunu Duzenle" : "Yeni Urun Ekle"}
              </h3>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Urun adi"
                  className="rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50"
                />
                <select
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: e.target.value })
                  }
                  className="rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50"
                >
                  <option value="">Kategori secin</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Urun aciklamasi"
                rows={2}
                className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50 resize-none"
              />

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-[11px] text-muted-foreground mb-1 block">
                    Fiyat (TL)
                  </label>
                  <input
                    type="number"
                    value={form.price || ""}
                    onChange={(e) =>
                      setForm({ ...form, price: Number(e.target.value) })
                    }
                    placeholder="0.00"
                    className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground mb-1 block">
                    Stok
                  </label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground mb-1 block">
                    Hazirlanma (dk)
                  </label>
                  <input
                    type="number"
                    value={form.preparationTime}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        preparationTime: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <input
                type="text"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="Gorsel URL (opsiyonel)"
                className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50"
              />

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                    className="accent-primary"
                  />
                  <span className="text-xs">Aktif</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPopular}
                    onChange={(e) =>
                      setForm({ ...form, isPopular: e.target.checked })
                    }
                    className="accent-primary"
                  />
                  <span className="text-xs">Populer</span>
                </label>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 rounded-xl"
                  onClick={handleSave}
                >
                  <Check className="mr-1.5 h-4 w-4" />
                  {editingId ? "Guncelle" : "Kaydet"}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={resetForm}
                >
                  <X className="mr-1.5 h-4 w-4" />
                  Iptal
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Urun ara..."
            className="w-full rounded-lg border bg-card pl-9 pr-3 py-2 text-sm outline-none focus:border-primary/50"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-lg border bg-card px-3 py-2 text-sm outline-none"
        >
          <option value="all">Tum Kategoriler</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filtered.map((product) => {
            const catName =
              categories.find((c) => c.id === product.categoryId)?.name || "-";
            return (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`rounded-xl border bg-card overflow-hidden ${
                  !product.isActive ? "opacity-60" : ""
                }`}
              >
                {/* Image */}
                {product.image ? (
                  <div className="relative h-32 bg-muted">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    {!product.isActive && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Badge variant="secondary" className="text-xs">
                          <EyeOff className="mr-1 h-3 w-3" />
                          Pasif
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-20 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold truncate">
                        {product.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {product.description}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-primary shrink-0">
                      {"\u20BA"}
                      {product.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {catName}
                    </Badge>
                    {product.isPopular && (
                      <Badge className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-700 border-amber-200">
                        Populer
                      </Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      Stok: {product.stock}
                    </span>
                  </div>

                  <Separator className="my-2" />

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 h-7 text-[11px] gap-1"
                      onClick={() => handleEdit(product)}
                    >
                      <Pencil className="h-3 w-3" />
                      Duzenle
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[11px] gap-1"
                      onClick={() => toggleProductActive(product.id)}
                    >
                      {product.isActive ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[11px] gap-1 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
          <h3 className="font-semibold">Urun bulunamadi</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Arama kriterlerinize uygun urun yok
          </p>
        </div>
      )}
    </div>
  );
}
