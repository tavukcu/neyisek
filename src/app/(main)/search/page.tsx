"use client";

import { useState, useMemo } from "react";
import { Search, X, TrendingUp, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import { mockRestaurants } from "@/lib/mock-data";
import { CATEGORIES } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

const trendingSearches = [
  "Burger",
  "Pizza",
  "Kebap",
  "Döner",
  "Tavuk",
  "Lahmacun",
  "Çorba",
  "Tatlı",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [recentSearches] = useState(["Burger King", "Pizza", "Kebap"]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return mockRestaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.cuisine.some((c) => c.toLowerCase().includes(q)) ||
        r.description.toLowerCase().includes(q)
    );
  }, [query]);

  const showSuggestions = !query.trim();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Restoran, yemek veya mutfak ara..."
          autoFocus
          className="w-full rounded-2xl border-2 bg-background py-4 pl-12 pr-12 text-base outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showSuggestions ? (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <Clock className="h-4 w-4" />
                  Son Aramalar
                </h2>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="cursor-pointer rounded-full px-4 py-1.5"
                      onClick={() => setQuery(s)}
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Trending */}
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold mb-3">
                <TrendingUp className="h-4 w-4" />
                Popüler Aramalar
              </h2>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((s) => (
                  <Badge
                    key={s}
                    variant="secondary"
                    className="cursor-pointer rounded-full px-4 py-1.5"
                    onClick={() => setQuery(s)}
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Quick Categories */}
            <div>
              <h2 className="text-sm font-semibold mb-3">Kategoriler</h2>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {CATEGORIES.slice(0, 6).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setQuery(cat.name)}
                    className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    <span className="text-3xl">{cat.icon}</span>
                    <span className="text-xs font-medium">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="mb-4 text-sm text-muted-foreground">
              {results.length > 0
                ? `"${query}" için ${results.length} sonuç`
                : `"${query}" için sonuç bulunamadı`}
            </p>

            {results.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-5xl mb-4">🤷</span>
                <h3 className="text-lg font-semibold">Sonuç bulunamadı</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Farklı bir arama terimi deneyin
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
