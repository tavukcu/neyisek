import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  documentId,
  type QueryConstraint,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Restaurant } from "@/types";

const COLLECTION = "restaurants";

// Helper: try query with orderBy, fallback to client-side sort if index missing
async function safeQuery(
  constraints: QueryConstraint[],
  fallbackSort?: (a: Restaurant, b: Restaurant) => number
): Promise<Restaurant[]> {
  if (!db) return [];

  try {
    const q = query(collection(db, COLLECTION), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Restaurant);
  } catch (err) {
    if (String(err).includes("index")) {
      // Fallback: query without orderBy, sort client-side
      const simpleConstraints = constraints.filter(
        (c) => !String(c).includes("orderBy")
      );
      const q = query(
        collection(db, COLLECTION),
        where("status", "==", "active"),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as Restaurant
      );
      if (fallbackSort) results.sort(fallbackSort);
      return results;
    }
    throw err;
  }
}

export async function getRestaurants(options?: {
  cuisine?: string;
  city?: string;
  sortBy?: "rating" | "deliveryTime" | "minOrder";
  limitCount?: number;
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
}): Promise<{ restaurants: Restaurant[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
  if (!db) return { restaurants: [], lastDoc: null };

  const constraints: QueryConstraint[] = [where("status", "==", "active")];

  if (options?.cuisine) {
    constraints.push(where("cuisine", "array-contains", options.cuisine));
  }
  if (options?.city) {
    constraints.push(where("address.city", "==", options.city));
  }

  if (options?.sortBy === "rating") {
    constraints.push(orderBy("rating.average", "desc"));
  } else if (options?.sortBy === "deliveryTime") {
    constraints.push(orderBy("delivery.estimatedTime", "asc"));
  } else if (options?.sortBy === "minOrder") {
    constraints.push(orderBy("delivery.minOrder", "asc"));
  } else {
    constraints.push(orderBy("rating.average", "desc"));
  }

  constraints.push(limit(options?.limitCount || 12));

  if (options?.lastDoc) {
    constraints.push(startAfter(options.lastDoc));
  }

  try {
    const q = query(collection(db, COLLECTION), ...constraints);
    const snapshot = await getDocs(q);
    const restaurants = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as Restaurant
    );
    const lastDocument = snapshot.docs[snapshot.docs.length - 1] || null;
    return { restaurants, lastDoc: lastDocument };
  } catch (err) {
    if (String(err).includes("index")) {
      // Fallback: simple query + client sort
      const q = query(
        collection(db, COLLECTION),
        where("status", "==", "active"),
        limit(options?.limitCount || 50)
      );
      const snapshot = await getDocs(q);
      const restaurants = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as Restaurant
      );
      // Client-side sort
      if (options?.sortBy === "deliveryTime") {
        restaurants.sort((a, b) => a.delivery.estimatedTime - b.delivery.estimatedTime);
      } else if (options?.sortBy === "minOrder") {
        restaurants.sort((a, b) => a.delivery.minOrder - b.delivery.minOrder);
      } else {
        restaurants.sort((a, b) => b.rating.average - a.rating.average);
      }
      // Client-side cuisine filter
      if (options?.cuisine) {
        const filtered = restaurants.filter((r) =>
          r.cuisine.some((c) => c.toLowerCase().includes(options.cuisine!.toLowerCase()))
        );
        return { restaurants: filtered, lastDoc: null };
      }
      return { restaurants, lastDoc: null };
    }
    throw err;
  }
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

  try {
    const q = query(
      collection(db, COLLECTION),
      where("status", "==", "active"),
      orderBy("rating.average", "desc"),
      limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Restaurant);
  } catch (err) {
    if (String(err).includes("index")) {
      // Fallback: get all active, sort client-side
      const q = query(
        collection(db, COLLECTION),
        where("status", "==", "active"),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const restaurants = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as Restaurant
      );
      restaurants.sort((a, b) => b.rating.average - a.rating.average);
      return restaurants.slice(0, count);
    }
    throw err;
  }
}

export async function getRestaurantsByIds(ids: string[]): Promise<Restaurant[]> {
  if (!db || ids.length === 0) return [];

  const results: Restaurant[] = [];

  // Firestore 'in' query supports max 30 items
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

  try {
    const q = query(
      collection(db, COLLECTION),
      where("status", "==", "active"),
      orderBy("name"),
      limit(20)
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
  } catch (err) {
    if (String(err).includes("index")) {
      // Fallback
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
    throw err;
  }
}
