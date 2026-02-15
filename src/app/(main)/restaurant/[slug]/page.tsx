"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Star,
  Clock,
  Bike,
  MapPin,
  Phone,
  Heart,
  Share2,
  ArrowLeft,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ProductCard from "@/components/restaurant/ProductCard";
import ProductDetailModal from "@/components/restaurant/ProductDetailModal";
import { mockRestaurants, getMockProducts } from "@/lib/mock-data";
import { useCartStore } from "@/stores/cart.store";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { Product } from "@/types";

export default function RestaurantDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [selectedProduct, setSelectedProduct] = useState<
    (Product & { id: string }) | null
  >(null);
  const [isFav, setIsFav] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const restaurant = mockRestaurants.find((r) => r.slug === slug);
  const products = restaurant ? getMockProducts(restaurant.id) : [];

  const productsByCategory = useMemo(() => {
    const grouped: Record<string, (Product & { id: string })[]> = {};
    products.forEach((p) => {
      if (!grouped[p.categoryId]) grouped[p.categoryId] = [];
      grouped[p.categoryId].push(p);
    });
    return grouped;
  }, [products]);

  const categoryNames: Record<string, string> = {
    burger: "Burgerler",
    kebap: "Kebaplar",
    "yan-urunler": "Yan Ürünler",
    icecekler: "İçecekler",
    pizza: "Pizzalar",
    pide: "Pideler",
    tatli: "Tatlılar",
  };

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="text-5xl mb-4">🔍</span>
        <h2 className="text-xl font-semibold">Restoran bulunamadı</h2>
        <Link href="/menu">
          <Button variant="outline" className="mt-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Restoranlara Dön
          </Button>
        </Link>
      </div>
    );
  }

  const handleQuickAdd = (product: Product & { id: string }) => {
    addItem({
      productId: product.id,
      restaurantId: product.restaurantId,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0],
      extras: [],
    });
    toast.success(`${product.name} sepete eklendi!`);
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Back button */}
        <Link
          href="/menu"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Restoranlar
        </Link>

        {/* Restaurant Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border bg-card overflow-hidden"
        >
          {/* Cover */}
          <div className="relative h-40 md:h-56 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <span className="text-7xl opacity-30">
              {restaurant.cuisine[0] === "Burger" ? "🍔" : restaurant.cuisine[0] === "Pizza" ? "🍕" : restaurant.cuisine[0] === "Kebap" ? "🥙" : "🍽️"}
            </span>
            <div className="absolute right-4 top-4 flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full h-9 w-9 bg-background/80 backdrop-blur"
                onClick={() => {
                  setIsFav(!isFav);
                  toast.success(isFav ? "Favorilerden çıkarıldı" : "Favorilere eklendi");
                }}
              >
                <Heart
                  className={`h-4 w-4 ${isFav ? "fill-red-500 text-red-500" : ""}`}
                />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full h-9 w-9 bg-background/80 backdrop-blur"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{restaurant.name}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {restaurant.cuisine.join(" • ")}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {restaurant.description}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0 rounded-xl bg-primary/10 px-3 py-2">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-bold">{restaurant.rating.average}</span>
                <span className="text-xs text-muted-foreground">
                  ({restaurant.rating.count})
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                <span>{restaurant.delivery.estimatedTime} dk</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bike className="h-4 w-4 text-primary" />
                <span>
                  {restaurant.delivery.fee === 0
                    ? "Ücretsiz Teslimat"
                    : `₺${restaurant.delivery.fee.toFixed(2)} teslimat`}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{restaurant.address.district}, {restaurant.address.city}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-primary" />
                <span>{restaurant.contact.phone}</span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {restaurant.features.hasDelivery && (
                <Badge variant="secondary">Paket Servis</Badge>
              )}
              {restaurant.features.hasPickup && (
                <Badge variant="secondary">Gel Al</Badge>
              )}
              {restaurant.features.acceptsCard && (
                <Badge variant="secondary">Kredi Kartı</Badge>
              )}
              <Badge variant="outline">Min. ₺{restaurant.delivery.minOrder}</Badge>
            </div>
          </div>
        </motion.div>

        {/* Menu */}
        <div className="mt-6">
          <Tabs defaultValue="menu">
            <TabsList className="w-full justify-start rounded-xl bg-muted/50">
              <TabsTrigger value="menu" className="rounded-lg">
                Menü
              </TabsTrigger>
              <TabsTrigger value="info" className="rounded-lg">
                Bilgiler
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-lg">
                Yorumlar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="menu" className="mt-4 space-y-6">
              {Object.entries(productsByCategory).map(([categoryId, items]) => (
                <div key={categoryId}>
                  <h2 className="text-lg font-semibold mb-3">
                    {categoryNames[categoryId] || categoryId}
                  </h2>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {items.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleQuickAdd}
                        onOpenDetail={setSelectedProduct}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <span className="text-4xl block mb-2">📋</span>
                  Henüz menü eklenmemiş
                </div>
              )}
            </TabsContent>

            <TabsContent value="info" className="mt-4">
              <div className="rounded-xl border bg-card p-6 space-y-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    Çalışma Saatleri
                  </h3>
                  <div className="mt-2 space-y-1 text-sm">
                    {Object.entries(restaurant.hours).map(([day, hours]) => {
                      const dayNames: Record<string, string> = {
                        monday: "Pazartesi",
                        tuesday: "Salı",
                        wednesday: "Çarşamba",
                        thursday: "Perşembe",
                        friday: "Cuma",
                        saturday: "Cumartesi",
                        sunday: "Pazar",
                      };
                      return (
                        <div
                          key={day}
                          className="flex justify-between items-center py-1"
                        >
                          <span className="text-muted-foreground">
                            {dayNames[day] || day}
                          </span>
                          <span className={hours.isOpen ? "" : "text-destructive"}>
                            {hours.isOpen
                              ? `${hours.open} - ${hours.close}`
                              : "Kapalı"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Adres</h3>
                  <p className="text-sm text-muted-foreground">
                    {restaurant.address.full}
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">İletişim</h3>
                  <p className="text-sm text-muted-foreground">
                    {restaurant.contact.phone}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {restaurant.contact.email}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              <div className="rounded-xl border bg-card p-6 text-center">
                <span className="text-4xl block mb-2">⭐</span>
                <h3 className="font-semibold">Henüz yorum yok</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  İlk yorumu sen yap!
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
