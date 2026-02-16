import { NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { mockRestaurants, mockProducts } from "@/lib/mock-data";
import { CATEGORIES } from "@/lib/constants";

function getDb() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  const app = getApps().length === 0 ? initializeApp(config) : getApp();
  return getFirestore(app);
}

// Products for restaurants that don't have mock data
function generateProducts(restaurantId: string, cuisine: string[]) {
  const productSets: Record<string, Array<{ name: string; description: string; price: number; categoryId: string; image: string; tags: string[] }>> = {
    Pizza: [
      { name: "Margarita Pizza", description: "Domates sosu, mozzarella, fesleğen", price: 129.99, categoryId: "pizza", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop&auto=format", tags: ["pizza", "klasik"] },
      { name: "Karışık Pizza", description: "Sucuk, sosis, biber, mısır, zeytin, mantar", price: 169.99, categoryId: "pizza", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop&auto=format", tags: ["pizza", "karisik"] },
      { name: "Pepperoni Pizza", description: "Bol pepperoni, mozzarella", price: 149.99, categoryId: "pizza", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=400&fit=crop&auto=format", tags: ["pizza", "pepperoni"] },
    ],
    Pide: [
      { name: "Kiymali Pide", description: "Kıymalı kapalı pide", price: 119.99, categoryId: "pide", image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=400&h=400&fit=crop&auto=format", tags: ["pide", "kiyma"] },
      { name: "Karisik Pide", description: "Karışık malzemeli açık pide", price: 139.99, categoryId: "pide", image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=400&h=400&fit=crop&auto=format", tags: ["pide", "karisik"] },
      { name: "Lahmacun", description: "İnce hamurlu lahmacun (3 adet)", price: 89.99, categoryId: "pide", image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=400&h=400&fit=crop&auto=format", tags: ["lahmacun"] },
    ],
    Tavuk: [
      { name: "Citir Tavuk Bucket", description: "8 parça çıtır tavuk", price: 189.99, categoryId: "tavuk", image: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&h=400&fit=crop&auto=format", tags: ["tavuk", "citir"] },
      { name: "Tavuk Kanat", description: "Baharatlı tavuk kanatları (10 adet)", price: 129.99, categoryId: "tavuk", image: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&h=400&fit=crop&auto=format", tags: ["tavuk", "kanat"] },
      { name: "Izgara Tavuk", description: "Özel soslu ızgara but", price: 149.99, categoryId: "tavuk", image: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&h=400&fit=crop&auto=format", tags: ["tavuk", "izgara"] },
    ],
    Balik: [
      { name: "Balik Ekmek", description: "Taze ızgara balık, marul, soğan", price: 89.99, categoryId: "balik", image: "https://images.unsplash.com/photo-1534604973-16b21c525822?w=400&h=400&fit=crop&auto=format", tags: ["balik", "ekmek"] },
      { name: "Balik Tabagi", description: "Günlük taze levrek, pilav, salata", price: 199.99, categoryId: "balik", image: "https://images.unsplash.com/photo-1534604973-16b21c525822?w=400&h=400&fit=crop&auto=format", tags: ["balik", "levrek"] },
      { name: "Karides Tava", description: "Tereyağlı karides", price: 179.99, categoryId: "balik", image: "https://images.unsplash.com/photo-1534604973-16b21c525822?w=400&h=400&fit=crop&auto=format", tags: ["karides", "deniz"] },
    ],
    "Ev Yemekleri": [
      { name: "Kuru Fasulye", description: "Ev yapımı kuru fasulye, pilav ile", price: 79.99, categoryId: "ev-yemekleri", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop&auto=format", tags: ["ev yemegi", "fasulye"] },
      { name: "Mercimek Corbasi", description: "Geleneksel mercimek çorbası", price: 49.99, categoryId: "ev-yemekleri", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop&auto=format", tags: ["corba", "mercimek"] },
      { name: "Izmir Kofte", description: "Fırında patatesli İzmir köfte", price: 109.99, categoryId: "ev-yemekleri", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop&auto=format", tags: ["kofte", "ev yemegi"] },
    ],
    Doner: [
      { name: "Et Doner Durum", description: "Özel baharatlarla marine et döner", price: 109.99, categoryId: "doner", image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=400&fit=crop&auto=format", tags: ["doner", "durum"] },
      { name: "Tavuk Doner", description: "Lavaş ekmekli tavuk döner", price: 89.99, categoryId: "doner", image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=400&fit=crop&auto=format", tags: ["doner", "tavuk"] },
      { name: "Iskender Doner", description: "Tereyağlı yoğurtlu döner", price: 159.99, categoryId: "doner", image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=400&fit=crop&auto=format", tags: ["doner", "iskender"] },
    ],
  };

  const products: Array<Record<string, unknown>> = [];
  let counter = 0;

  for (const c of cuisine) {
    const items = productSets[c];
    if (!items) continue;
    for (const item of items) {
      counter++;
      products.push({
        name: item.name,
        description: item.description,
        price: item.price,
        categoryId: item.categoryId,
        restaurantId,
        images: [item.image],
        variants: [],
        extras: [],
        tags: item.tags,
        allergens: [],
        isActive: true,
        isPopular: counter <= 2,
        isFeatured: counter === 1,
        stock: 100,
        preparationTime: 15,
        rating: { average: Math.round((4.0 + Math.random() * 0.9) * 10) / 10, count: Math.floor(50 + Math.random() * 200) },
      });
    }
  }

  // Add drinks for every restaurant
  products.push({
    name: "Coca Cola",
    description: "330ml kutu",
    price: 24.99,
    categoryId: "icecekler",
    restaurantId,
    images: ["https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=400&fit=crop&auto=format"],
    variants: [{ id: "v1", name: "500ml", price: 29.99 }],
    extras: [],
    tags: ["icecek", "kola"],
    allergens: [],
    isActive: true,
    isPopular: false,
    isFeatured: false,
    stock: 200,
    preparationTime: 1,
    rating: { average: 4.5, count: 100 },
  });
  products.push({
    name: "Ayran",
    description: "Taze yayık ayranı",
    price: 19.99,
    categoryId: "icecekler",
    restaurantId,
    images: ["https://images.unsplash.com/photo-1588710929895-a4bd84e9e7c5?w=400&h=400&fit=crop&auto=format"],
    variants: [],
    extras: [],
    tags: ["icecek", "ayran"],
    allergens: ["sut"],
    isActive: true,
    isPopular: false,
    isFeatured: false,
    stock: 200,
    preparationTime: 1,
    rating: { average: 4.6, count: 80 },
  });

  return products;
}

export async function POST(request: Request) {
  const secret = request.headers.get("x-seed-secret");
  if (secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const now = new Date();

    // Firestore writeBatch has a 500 operation limit, so we split into multiple batches
    const batches: Array<{ ref: ReturnType<typeof doc>; data: Record<string, unknown> }> = [];

    // 1. Restaurants
    for (const r of mockRestaurants) {
      const { id, createdAt: _c, updatedAt: _u, ...data } = r as unknown as Record<string, unknown> & { id: string; createdAt: unknown; updatedAt: unknown };
      batches.push({
        ref: doc(db, "restaurants", id),
        data: { ...data, createdAt: now, updatedAt: now },
      });
    }

    // 2. Products with mock data
    for (const [restaurantId, products] of Object.entries(mockProducts)) {
      for (const p of products) {
        const { id, createdAt: _c, updatedAt: _u, ...data } = p as unknown as Record<string, unknown> & { id: string; createdAt: unknown; updatedAt: unknown };
        batches.push({
          ref: doc(db, "restaurants", restaurantId, "products", id),
          data: { ...data, createdAt: now, updatedAt: now },
        });
      }
    }

    // 3. Generated products for restaurants without mock products
    const restaurantsWithProducts = new Set(Object.keys(mockProducts));
    for (const r of mockRestaurants) {
      if (restaurantsWithProducts.has(r.id)) continue;
      const generated = generateProducts(r.id, r.cuisine);
      generated.forEach((p, i) => {
        batches.push({
          ref: doc(db, "restaurants", r.id, "products", `gen-${r.id}-${i}`),
          data: { ...p, createdAt: now, updatedAt: now },
        });
      });
    }

    // 4. Categories
    CATEGORIES.forEach((cat, i) => {
      batches.push({
        ref: doc(db, "categories", cat.id),
        data: {
          name: cat.name,
          slug: cat.slug,
          order: i,
          isActive: true,
          createdAt: now,
        },
      });
    });

    // Commit in chunks of 500
    for (let i = 0; i < batches.length; i += 499) {
      const chunk = batches.slice(i, i + 499);
      const batch = writeBatch(db);
      for (const { ref, data } of chunk) {
        batch.set(ref, data);
      }
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      restaurants: mockRestaurants.length,
      categories: CATEGORIES.length,
      totalOperations: batches.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Seed failed", details: String(error) },
      { status: 500 }
    );
  }
}
