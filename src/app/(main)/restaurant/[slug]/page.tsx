"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  Search,
  MessageSquare,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ProductCard from "@/components/restaurant/ProductCard";
import ProductDetailModal from "@/components/restaurant/ProductDetailModal";
import { mockRestaurants, getMockProducts } from "@/lib/mock-data";
import { getCuisineIcon } from "@/lib/icons";
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
    "yan-urunler": "Yan Urunler",
    icecekler: "Icecekler",
    pizza: "Pizzalar",
    pide: "Pideler",
    tatli: "Tatlilar",
  };

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold">Restoran bulunamadi</h2>
        <Link href="/menu">
          <Button variant="outline" className="mt-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Restoranlara Don
          </Button>
        </Link>
      </div>
    );
  }

  const CoverIcon = getCuisineIcon(restaurant.cuisine[0]);
  const hasCover = !!restaurant.images.cover;

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
          <div className="relative h-48 md:h-64 bg-muted overflow-hidden">
            {hasCover ? (
              <Image
                src={restaurant.images.cover}
                alt={restaurant.name}
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 1280px"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/[0.08] to-muted">
                <CoverIcon className="h-20 w-20 text-primary/10" strokeWidth={0.8} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute right-4 top-4 flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full h-9 w-9 bg-white/80 backdrop-blur hover:bg-white"
                onClick={() => {
                  setIsFav(!isFav);
                  toast.success(isFav ? "Favorilerden cikarildi" : "Favorilere eklendi");
                }}
              >
                <Heart
                  className={`h-4 w-4 ${isFav ? "fill-red-500 text-red-500" : "text-gray-700"}`}
                />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full h-9 w-9 bg-white/80 backdrop-blur hover:bg-white"
              >
                <Share2 className="h-4 w-4 text-gray-700" />
              </Button>
            </div>
            <div className="absolute left-6 bottom-4 flex items-center gap-1 rounded-lg bg-black/50 backdrop-blur-sm px-2.5 py-1.5">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-white">{restaurant.rating.average}</span>
              <span className="text-xs text-white/70">({restaurant.rating.count})</span>
            </div>
          </div>

          {/* Info */}
          <div className="p-6">
            <h1 className="text-2xl font-bold">{restaurant.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {restaurant.cuisine.join(" \u2022 ")}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {restaurant.description}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                <span>{restaurant.delivery.estimatedTime} dk</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bike className="h-4 w-4 text-primary" />
                <span>
                  {restaurant.delivery.fee === 0
                    ? "Ucretsiz Teslimat"
                    : `\u20BA${restaurant.delivery.fee.toFixed(2)} teslimat`}
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
                <Badge variant="secondary">Kredi Karti</Badge>
              )}
              <Badge variant="outline">Min. {"\u20BA"}{restaurant.delivery.minOrder}</Badge>
            </div>
          </div>
        </motion.div>

        {/* Menu */}
        <div className="mt-6">
          <Tabs defaultValue="menu">
            <TabsList className="w-full justify-start rounded-xl bg-muted/50">
              <TabsTrigger value="menu" className="rounded-lg">
                Menu
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
                  <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm">Henuz menu eklenmemis</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="info" className="mt-4">
              <div className="rounded-xl border bg-card p-6 space-y-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    Calisma Saatleri
                  </h3>
                  <div className="mt-2 space-y-1 text-sm">
                    {Object.entries(restaurant.hours).map(([day, hours]) => {
                      const dayNames: Record<string, string> = {
                        monday: "Pazartesi",
                        tuesday: "Sali",
                        wednesday: "Carsamba",
                        thursday: "Persembe",
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
                              : "Kapali"}
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
                  <h3 className="font-semibold mb-2">Iletisim</h3>
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
                <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
                <h3 className="font-semibold">Henuz yorum yok</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Ilk yorumu sen yap!
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
