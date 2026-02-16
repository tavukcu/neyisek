"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  CreditCard,
  Banknote,
  ChevronRight,
  ArrowLeft,
  Plus,
  ShoppingBag,
  Shield,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart.store";
import { useAddresses } from "@/hooks/use-addresses";
import { useCreateOrder } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { DELIVERY_FEE_DEFAULT, SERVICE_FEE_RATE, MIN_ORDER_AMOUNT } from "@/lib/constants";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { PaymentMethod } from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, getSubtotal, clearCart, restaurantId } = useCartStore();
  const { addresses } = useAddresses();
  const createOrder = useCreateOrder();

  const [selectedAddressId, setSelectedAddressId] = useState(
    addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || ""
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [orderNote, setOrderNote] = useState("");

  const subtotal = getSubtotal();
  const deliveryFee = subtotal > 0 ? DELIVERY_FEE_DEFAULT : 0;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100;
  const discount = 0;
  const total = subtotal + deliveryFee + serviceFee - discount;
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold">Sepetiniz Bos</h1>
        <p className="mt-2 text-muted-foreground">
          Siparis vermek icin sepetinize urun ekleyin
        </p>
        <Link href="/menu">
          <Button className="mt-6">Restoranlari Kesfet</Button>
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Lutfen bir teslimat adresi secin");
      return;
    }
    if (subtotal < MIN_ORDER_AMOUNT) {
      toast.error(`Minimum siparis tutari \u20BA${MIN_ORDER_AMOUNT}`);
      return;
    }
    if (!user) {
      toast.error("Siparis vermek icin giris yapin");
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise((r) => setTimeout(r, 1500));

      const orderId = await createOrder.mutateAsync({
        customerId: user.id,
        restaurantId: restaurantId || "",
        restaurantName: "Restoran",
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          extras: item.extras.map((e) => ({ id: e.id || "", name: e.name, price: e.price })),
        })),
        pricing: { subtotal, deliveryFee, serviceFee, discount, total },
        payment: {
          method: paymentMethod,
          status: paymentMethod === "cash" ? "pending" : "paid",
        },
        delivery: {
          address: selectedAddress.address,
          lat: selectedAddress.lat,
          lng: selectedAddress.lng,
          estimatedTime: 30,
        },
        status: "pending",
      } as never);

      clearCart();
      toast.success("Siparisiniz alindi!");
      router.push(`/orders/${orderId}`);
    } catch {
      toast.error("Siparis olusturulamadi");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link
        href="/cart"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Sepete Don
      </Link>

      <h1 className="text-2xl font-bold mb-6">Siparis Onayla</h1>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* Left - Details */}
        <div className="space-y-5">
          {/* Address Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border bg-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Teslimat Adresi
              </h2>
              <Link href="/addresses" className="text-xs text-primary hover:underline">
                Duzenle
              </Link>
            </div>

            {addresses.length === 0 ? (
              <Link href="/addresses">
                <div className="flex items-center gap-3 rounded-lg border-2 border-dashed p-4 text-muted-foreground hover:border-primary/30 transition-colors cursor-pointer">
                  <Plus className="h-5 w-5" />
                  <span className="text-sm">Yeni adres ekle</span>
                </div>
              </Link>
            ) : (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-0.5 accent-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{addr.title}</span>
                        {addr.isDefault && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            Varsayilan
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {addr.address}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </motion.div>

          {/* Payment Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-xl border bg-card p-5"
          >
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <CreditCard className="h-4 w-4 text-primary" />
              Odeme Yontemi
            </h2>

            <div className="space-y-2">
              <label
                className={`flex items-center gap-3 rounded-lg border p-3.5 cursor-pointer transition-all ${
                  paymentMethod === "credit_card"
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/30"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "credit_card"}
                  onChange={() => setPaymentMethod("credit_card")}
                  className="accent-primary"
                />
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <span className="text-sm font-medium">Kredi / Banka Karti</span>
                  <p className="text-[11px] text-muted-foreground">iyzico guvenli odeme</p>
                </div>
                <Shield className="h-4 w-4 text-green-500" />
              </label>

              <label
                className={`flex items-center gap-3 rounded-lg border p-3.5 cursor-pointer transition-all ${
                  paymentMethod === "cash"
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/30"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                  className="accent-primary"
                />
                <Banknote className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <span className="text-sm font-medium">Kapida Odeme</span>
                  <p className="text-[11px] text-muted-foreground">Nakit veya kart ile</p>
                </div>
              </label>
            </div>

            {paymentMethod === "credit_card" && (
              <div className="mt-4 rounded-lg border bg-muted/30 p-4 space-y-3">
                <input
                  type="text"
                  placeholder="Kart numarasi"
                  className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50"
                  maxLength={19}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="AA/YY"
                    className="rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50"
                    maxLength={5}
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    className="rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50"
                    maxLength={4}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Kart uzerindeki isim"
                  className="w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus:border-primary/50"
                />
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Shield className="h-3.5 w-3.5 text-green-500" />
                  <span>256-bit SSL ile guvenli odeme | iyzico altyapisi</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Order Note */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border bg-card p-5"
          >
            <h2 className="font-semibold mb-3 text-sm">Siparis Notu (Opsiyonel)</h2>
            <textarea
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder="Teslimat icin ozel notunuz..."
              rows={2}
              className="w-full rounded-lg border bg-background p-3 text-sm outline-none focus:border-primary/50 resize-none"
            />
          </motion.div>
        </div>

        {/* Right - Summary */}
        <div className="lg:sticky lg:top-20 h-fit">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-xl border bg-card p-5"
          >
            <h2 className="font-semibold mb-4">Siparis Ozeti</h2>

            <div className="space-y-2.5 mb-4">
              {items.map((item) => {
                const extrasTotal = item.extras.reduce((s, e) => s + e.price, 0);
                return (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <div className="flex-1 min-w-0">
                      <span>{item.quantity}x {item.name}</span>
                      {item.extras.length > 0 && (
                        <p className="text-[10px] text-muted-foreground">
                          +{item.extras.map((e) => e.name).join(", ")}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 font-medium">
                      {"\u20BA"}{((item.price + extrasTotal) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            <Separator className="my-3" />

            {/* Promo Code */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Promosyon kodu"
                className="flex-1 rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary/50"
              />
              <Button variant="outline" size="sm" className="text-xs shrink-0">
                Uygula
              </Button>
            </div>

            <Separator className="my-3" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ara Toplam</span>
                <span>{"\u20BA"}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Teslimat Ucreti</span>
                <span>{"\u20BA"}{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hizmet Bedeli</span>
                <span>{"\u20BA"}{serviceFee.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Indirim</span>
                  <span>-{"\u20BA"}{discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <Separator className="my-3" />

            <div className="flex justify-between font-bold text-base">
              <span>Toplam</span>
              <span className="text-primary">{"\u20BA"}{total.toFixed(2)}</span>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Tahmini teslimat: 25-35 dk</span>
            </div>

            <Button
              className="mt-4 w-full h-12 rounded-xl text-base font-semibold shadow-md shadow-primary/20"
              disabled={isProcessing || !selectedAddress}
              onClick={handlePlaceOrder}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Isleniyor...
                </span>
              ) : (
                <>
                  Siparisi Onayla
                  <ChevronRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>

            <p className="mt-3 text-center text-[10px] text-muted-foreground">
              Siparisi onaylayarak Kullanim Kosullarini kabul etmis olursunuz.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
