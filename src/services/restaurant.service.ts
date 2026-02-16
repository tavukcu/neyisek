import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  documentId,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Restaurant } from "@/types";

const COLLECTION = "restaurants";

export async function getRestaurants(options?: {
  cuisine?: string;
  city?: string;
  sortBy?: "rating" | "deliveryTime" | "minOrder";
  limitCount?: number;
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
}): Promise<{ restaurants: Restaurant[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
  if (!db) return { restaurants: [], lastDoc: null };

  // Simple query without orderBy to avoid composite index requirement
  const q = query(
    collection(db, COLLECTION),
    where("status", "==", "active"),
    limit(options?.limitCount || 50)
  );
  const snapshot = await getDocs(q);

  let restaurants = snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Restaurant
  );

  // Client-side cuisine filter
  if (options?.cuisine) {
    restaurants = restaurants.filter((r) =>
      r.cuisine.some((c) => c.toLowerCase().includes(options.cuisine!.toLowerCase()))
    );
  }

  // Client-side city filter
  if (options?.city) {
    restaurants = restaurants.filter((r) => r.address.city === options.city);
  }

  // Client-side sort
  if (options?.sortBy === "deliveryTime") {
    restaurants.sort((a, b) => a.delivery.estimatedTime - b.delivery.estimatedTime);
  } else if (options?.sortBy === "minOrder") {
    restaurants.sort((a, b) => a.delivery.minOrder - b.delivery.minOrder);
  } else {
    restaurants.sort((a, b) => b.rating.average - a.rating.average);
  }

  const lastDocument = snapshot.docs[snapshot.docs.length - 1] || null;
  return { restaurants, lastDoc: lastDocument };
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  if (!db) return null;

  const q = query(
    collection(db, COLLECTION),
    where("slug", "==", slug),
    limit(1)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;
  const restaurant = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Restaurant;
  if (restaurant.status !== "active") return null;
  return restaurant;
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  if (!db) return null;

  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Restaurant;
}

export async function getPopularRestaurants(count = 6): Promise<Restaurant[]> {
  if (!db) return [];

  const q = query(
    collection(db, COLLECTION),
    where("status", "==", "active"),
    limit(50)
  );
  const snapshot = await getDocs(q);

  const restaurants = snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Restaurant
  );

  // Client-side sort by rating
  restaurants.sort((a, b) => b.rating.average - a.rating.average);
  return restaurants.slice(0, count);
}

export async function getRestaurantsByIds(ids: string[]): Promise<Restaurant[]> {
  if (!db || ids.length === 0) return [];

  const results: Restaurant[] = [];

  for (let i = 0; i < ids.length; i += 30) {
    const chunk = ids.slice(i, i + 30);
    const q = query(
      collection(db, COLLECTION),
      where(documentId(), "in", chunk)
    );
    const snapshot = await getDocs(q);
    results.push(
      ...snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Restaurant)
    );
  }

  return results;
}

export async function searchRestaurants(searchTerm: string): Promise<Restaurant[]> {
  if (!db || !searchTerm.trim()) return [];

  const q = query(
    collection(db, COLLECTION),
    where("status", "==", "active"),
    limit(50)
  );
  const snapshot = await getDocs(q);

  const term = searchTerm.toLowerCase();
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Restaurant)
    .filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.cuisine.some((c) => c.toLowerCase().includes(term)) ||
        r.description.toLowerCase().includes(term)
    );
}
