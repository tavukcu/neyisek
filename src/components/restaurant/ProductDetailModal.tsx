"use client";

import { useState } from "react";
import { Minus, Plus, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart.store";
import { getCategoryIcon } from "@/lib/icons";
import type { Product } from "@/types";
import { toast } from "sonner";

interface ProductDetailModalProps {
  product: (Product & { id: string }) | null;
  open: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({
  product,
  open,
  onClose,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const addItem = useCartStore((s) => s.addItem);

  if (!product) return null;

  const CategoryIcon = getCategoryIcon(product.categoryId);

  const basePrice = selectedVariant
    ? (product.variants.find((v) => v.id === selectedVariant)?.price || product.price)
    : product.price;

  const extrasTotal = product.extras
    .filter((e) => selectedExtras.includes(e.id))
    .reduce((sum, e) => sum + e.price, 0);

  const totalPrice = (basePrice + extrasTotal) * quantity;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      restaurantId: product.restaurantId,
      name: product.name,
      price: basePrice,
      quantity,
      image: product.images[0],
      extras: product.extras
        .filter((e) => selectedExtras.includes(e.id))
        .map((e) => ({ id: e.id, name: e.name, price: e.price })),
      notes: notes || undefined,
    });
    toast.success(`${product.name} sepete eklendi!`);
    onClose();
    setQuantity(1);
    setSelectedVariant(null);
    setSelectedExtras([]);
    setNotes("");
  };

  const toggleExtra = (extraId: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extraId)
        ? prev.filter((id) => id !== extraId)
        : [...prev, extraId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0">
        {/* Image */}
        <div className="relative aspect-video bg-gradient-to-br from-primary/[0.08] via-primary/[0.04] to-muted flex items-center justify-center">
          <CategoryIcon className="h-16 w-16 text-primary/15" strokeWidth={1} />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <DialogHeader className="p-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <DialogTitle className="text-xl">{product.name}</DialogTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {product.description}
                </p>
              </div>
              {product.rating.count > 0 && (
                <div className="flex items-center gap-1 shrink-0 rounded-lg bg-primary/10 px-2 py-1">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  <span className="text-xs font-semibold">
                    {product.rating.average}
                  </span>
                </div>
              )}
            </div>
          </DialogHeader>

          {/* Tags */}
          {product.allergens.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.allergens.map((a) => (
                <Badge key={a} variant="outline" className="text-[10px]">
                  {a}
                </Badge>
              ))}
            </div>
          )}

          {/* Variants */}
          {product.variants.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-2">Boyut Secin</h4>
                <div className="space-y-2">
                  <label className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="variant"
                        checked={!selectedVariant}
                        onChange={() => setSelectedVariant(null)}
                        className="accent-primary"
                      />
                      <span className="text-sm">Normal</span>
                    </div>
                    <span className="text-sm font-medium">
                      {"\u20BA"}{product.price.toFixed(2)}
                    </span>
                  </label>
                  {product.variants.map((variant) => (
                    <label
                      key={variant.id}
                      className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="variant"
                          checked={selectedVariant === variant.id}
                          onChange={() => setSelectedVariant(variant.id)}
                          className="accent-primary"
                        />
                        <span className="text-sm">{variant.name}</span>
                      </div>
                      <span className="text-sm font-medium">
                        {"\u20BA"}{variant.price.toFixed(2)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Extras */}
          {product.extras.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-2">
                  Ekstralar <span className="font-normal text-muted-foreground">(Istege bagli)</span>
                </h4>
                <div className="space-y-2">
                  {product.extras.map((extra) => (
                    <label
                      key={extra.id}
                      className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedExtras.includes(extra.id)}
                          onChange={() => toggleExtra(extra.id)}
                          className="accent-primary"
                        />
                        <span className="text-sm">{extra.name}</span>
                      </div>
                      <span className="text-sm font-medium">
                        +{"\u20BA"}{extra.price.toFixed(2)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          <Separator />
          <div>
            <h4 className="text-sm font-semibold mb-2">Siparis Notu</h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Orn: Acisiz olsun, sos az olsun..."
              rows={2}
              className="w-full rounded-lg border bg-background p-3 text-sm outline-none focus:border-primary/50 resize-none"
            />
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2 rounded-xl border">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              className="flex-1 rounded-xl h-11 text-base"
              onClick={handleAddToCart}
            >
              Sepete Ekle {"\u00B7"} {"\u20BA"}{totalPrice.toFixed(2)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
