"use client";

import { useState } from "react";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Home,
  Briefcase,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAddresses } from "@/hooks/use-addresses";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const quickTitles = [
  { label: "Ev", icon: Home },
  { label: "Is", icon: Briefcase },
  { label: "Diger", icon: MapPin },
];

export default function AddressesPage() {
  const { isAuthenticated } = useAuth();
  const {
    addresses,
    isLoading,
    addAddress,
    updateAddress,
    removeAddress,
    setDefault,
  } = useAddresses();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "Ev",
    address: "",
    city: "",
    district: "",
    isDefault: false,
  });

  const resetForm = () => {
    setForm({ title: "Ev", address: "", city: "", district: "", isDefault: false });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.address.trim() || !form.city.trim() || !form.district.trim()) {
      toast.error("Lutfen tum alanlari doldurun");
      return;
    }

    try {
      if (editingId) {
        await updateAddress(editingId, {
          title: form.title,
          address: form.address,
          city: form.city,
          district: form.district,
          isDefault: form.isDefault,
        });
        toast.success("Adres guncellendi");
      } else {
        await addAddress({
          title: form.title,
          address: form.address,
          city: form.city,
          district: form.district,
          lat: 41.0 + Math.random() * 0.1,
          lng: 29.0 + Math.random() * 0.1,
          isDefault: form.isDefault,
        });
        toast.success("Adres eklendi");
      }
      resetForm();
    } catch {
      toast.error("Bir hata olustu");
    }
  };

  const handleEdit = (addr: typeof addresses[0]) => {
    setForm({
      title: addr.title,
      address: addr.address,
      city: addr.city,
      district: addr.district,
      isDefault: addr.isDefault,
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await removeAddress(id);
      toast.success("Adres silindi");
    } catch {
      toast.error("Bir hata olustu");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <MapPin className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold">Adreslerim</h1>
        <p className="mt-2 text-muted-foreground">
          Adreslerinizi gormek icin giris yapin
        </p>
        <Link href="/login">
          <Button className="mt-6">Giris Yap</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Adreslerim</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading ? "Yukleniyor..." : `${addresses.length} kayitli adres`}
          </p>
        </div>
        {!showForm && (
          <Button
            size="sm"
            className="gap-1.5 rounded-xl"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4" />
            Yeni Adres
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
            className="mb-5 overflow-hidden"
          >
            <div className="rounded-xl border bg-card p-5 space-y-4">
              <h3 className="font-semibold text-sm">
                {editingId ? "Adresi Duzenle" : "Yeni Adres Ekle"}
              </h3>

              {/* Quick title selection */}
              <div className="flex gap-2">
                {quickTitles.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => setForm({ ...form, title: label })}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                      form.title === label
                        ? "border-primary bg-primary/5 text-primary"
                        : "hover:border-primary/30"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Acik adres (sokak, numara, daire)"
                className="w-full rounded-lg border bg-background p-3 text-sm outline-none focus:border-primary/50"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  placeholder="Ilce"
                  className="rounded-lg border bg-background p-3 text-sm outline-none focus:border-primary/50"
                />
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Sehir"
                  className="rounded-lg border bg-background p-3 text-sm outline-none focus:border-primary/50"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="accent-primary"
                />
                <span className="text-xs text-muted-foreground">Varsayilan adres olarak ayarla</span>
              </label>

              <div className="flex gap-2">
                <Button className="flex-1 rounded-xl" onClick={handleSave}>
                  <Check className="mr-1.5 h-4 w-4" />
                  {editingId ? "Guncelle" : "Kaydet"}
                </Button>
                <Button variant="outline" className="rounded-xl" onClick={resetForm}>
                  <X className="mr-1.5 h-4 w-4" />
                  Iptal
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : (
        <>
          {/* Address List */}
          <div className="space-y-3">
            <AnimatePresence>
              {addresses.map((addr) => (
                <motion.div
                  key={addr.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-xl border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{addr.title}</span>
                          {addr.isDefault && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              <Star className="mr-0.5 h-2.5 w-2.5" />
                              Varsayilan
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                          {addr.address}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {addr.district}, {addr.city}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {!addr.isDefault && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => {
                            setDefault(addr.id);
                            toast.success("Varsayilan adres degistirildi");
                          }}
                        >
                          <Star className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => handleEdit(addr)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(addr.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {addresses.length === 0 && !showForm && (
              <div className="text-center py-12">
                <MapPin className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                <h3 className="font-semibold">Henuz adres eklenmemis</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Teslimat adresi ekleyerek siparis vermeye baslayabilirsiniz
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
