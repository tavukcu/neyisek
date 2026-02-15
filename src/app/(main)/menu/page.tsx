"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import { CATEGORIES } from "@/lib/constants";
import { mockRestaurants } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";

type SortOption = "rating" | "delivery" | "minOrder" | "name";

export default function MenuPage() {
  return (
    <Suspense>
      <MenuContent />
    </Suspense>
  );
}

function MenuContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [showFilters, setShowFilters] = useState(false);

  const filteredRestaurants = useMemo(() => {
    let result = [...mockRestaurants];

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisine.some((c) => c.toLowerCase().includes(q)) ||
          r.description.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (selectedCategory) {
      const cat = CATEGORIES.find((c) => c.slug === selectedCategory);
      if (cat) {
        result = result.filter((r) =>
          r.cuisine.some((c) => c.toLowerCase().includes(cat.name.toLowerCase().split(" ")[0]))
        );
      }
    }

    // Sort
    switch (sortBy) {
      case "rating":
        result.sort((a, b) => b.rating.average - a.rating.average);
        break;
      case "delivery":
        result.sort((a, b) => a.delivery.estimatedTime - b.delivery.estimatedTime);
        break;
      case "minOrder":
        result.sort((a, b) => a.delivery.minOrder - b.delivery.minOrder);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name, "tr"));
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">Restoranlar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {filteredRestaurants.length} restoran bulundu
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Restoran veya mutfak ara..."
            className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[160px] rounded-xl">
              <SelectValue placeholder="Sirala" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">En Yuksek Puan</SelectItem>
              <SelectItem value="delivery">En Hizli Teslimat</SelectItem>
              <SelectItem value="minOrder">En Dusuk Minimum</SelectItem>
              <SelectItem value="name">Isme Gore</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="rounded-xl shrink-0"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Badge
          variant={selectedCategory === "" ? "default" : "outline"}
          className="cursor-pointer shrink-0 rounded-full px-4 py-1.5 text-sm"
          onClick={() => setSelectedCategory("")}
        >
          Tumu
        </Badge>
        {CATEGORIES.map((cat) => (
          <Badge
            key={cat.id}
            variant={selectedCategory === cat.slug ? "default" : "outline"}
            className="cursor-pointer shrink-0 rounded-full px-4 py-1.5 text-sm"
            onClick={() =>
              setSelectedCategory(selectedCategory === cat.slug ? "" : cat.slug)
            }
          >
            {cat.name}
          </Badge>
        ))}
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden rounded-xl border bg-card p-4"
          >
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="cursor-pointer rounded-full px-3 py-1"
              >
                Ucretsiz Teslimat
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer rounded-full px-3 py-1"
              >
                Kredi Karti
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer rounded-full px-3 py-1"
              >
                4.5+ Puan
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer rounded-full px-3 py-1"
              >
                30 dk Alti
              </Badge>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Restaurant Grid */}
      {filteredRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRestaurants.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <RestaurantCard restaurant={restaurant} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <SearchX className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold">Restoran bulunamadi</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Farkli bir arama terimi veya filtre deneyin
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("");
            }}
          >
            Filtreleri Temizle
          </Button>
        </div>
      )}
    </div>
  );
}
