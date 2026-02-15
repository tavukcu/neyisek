"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart.store";
import { DELIVERY_FEE_DEFAULT, SERVICE_FEE_RATE, MIN_ORDER_AMOUNT } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getSubtotal } =
    useCartStore();

  const subtotal = getSubtotal();
  const deliveryFee = subtotal > 0 ? DELIVERY_FEE_DEFAULT : 0;
  const serviceFee = subtotal * SERVICE_FEE_RATE;
  const total = subtotal + deliveryFee + serviceFee;
  const canOrder = subtotal >= MIN_ORDER_AMOUNT;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold">Sepetiniz Boş</h1>
        <p className="mt-2 text-muted-foreground">
          Lezzetli yemekleri keşfedin ve sepetinize ekleyin
        </p>
        <Link href="/menu">
          <Button className="mt-6">Restoranları Keşfet</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sepetim</h1>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={clearCart}>
          <Trash2 className="mr-1 h-4 w-4" />
          Temizle
        </Button>
      </div>

      {/* Items */}
      <div className="rounded-xl border bg-card">
        <AnimatePresence>
          {items.map((item, index) => {
            const extrasTotal = item.extras.reduce((sum, e) => sum + e.price, 0);
            const itemTotal = (item.price + extrasTotal) * item.quantity;

            return (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {index > 0 && <Separator />}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm">{item.name}</h3>
                      {item.extras.length > 0 && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          +{item.extras.map((e) => e.name).join(", ")}
                        </p>
                      )}
                      {item.notes && (
                        <p className="mt-0.5 text-xs text-muted-foreground italic">
                          Not: {item.notes}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-semibold shrink-0">
                      ₺{itemTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 rounded-lg border">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          item.quantity === 1
                            ? removeItem(item.productId)
                            : updateQuantity(item.productId, item.quantity - 1)
                        }
                      >
                        {item.quantity === 1 ? (
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        ) : (
                          <Minus className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ₺{item.price.toFixed(2)} / adet
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Summary */}
      <div className="mt-4 rounded-xl border bg-card p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Ara Toplam</span>
          <span>₺{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Teslimat Ücreti</span>
          <span>₺{deliveryFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Hizmet Bedeli</span>
          <span>₺{serviceFee.toFixed(2)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Toplam</span>
          <span className="text-primary">₺{total.toFixed(2)}</span>
        </div>

        {!canOrder && (
          <p className="text-xs text-destructive text-center pt-1">
            Minimum sipariş tutarı ₺{MIN_ORDER_AMOUNT}. Sepetinize ₺
            {(MIN_ORDER_AMOUNT - subtotal).toFixed(2)} daha eklemeniz gerekiyor.
          </p>
        )}
      </div>

      {/* Checkout Button */}
      <Link href={canOrder ? "/checkout" : "#"}>
        <Button
          className="mt-4 w-full h-12 rounded-xl text-base gap-2"
          disabled={!canOrder}
        >
          Siparişi Onayla
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
