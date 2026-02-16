import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/types";

export async function getProductsByRestaurant(restaurantId: string): Promise<Product[]> {
  if (!db) return [];

  const q = query(
    collection(db, "restaurants", restaurantId, "products"),
    where("isActive", "==", true)
  );
  const snapshot = await getDocs(q);
  const products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);

  // Client-side sort by category then name
  products.sort((a, b) => {
    const catComp = a.categoryId.localeCompare(b.categoryId);
    return catComp !== 0 ? catComp : a.name.localeCompare(b.name, "tr");
  });
  return products;
}

export async function getProductById(
  restaurantId: string,
  productId: string
): Promise<Product | null> {
  if (!db) return null;

  const docRef = doc(db, "restaurants", restaurantId, "products", productId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Product;
}

export async function getPopularProducts(
  restaurantId: string,
  count = 6
): Promise<Product[]> {
  if (!db) return [];

  const q = query(
    collection(db, "restaurants", restaurantId, "products"),
    where("isActive", "==", true),
    where("isPopular", "==", true),
    limit(count)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
}

export async function getFeaturedProducts(
  restaurantId: string,
  count = 4
): Promise<Product[]> {
  if (!db) return [];

  const q = query(
    collection(db, "restaurants", restaurantId, "products"),
    where("isActive", "==", true),
    where("isFeatured", "==", true),
    limit(count)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
}

export async function searchProducts(searchTerm: string): Promise<Product[]> {
  if (!db || !searchTerm.trim()) return [];

  // Search across all restaurants' products - in production use Algolia/Typesense
  const restaurantsSnap = await getDocs(
    query(collection(db, "restaurants"), where("status", "==", "active"), limit(50))
  );

  const allProducts: Product[] = [];
  const term = searchTerm.toLowerCase();

  for (const restDoc of restaurantsSnap.docs) {
    const productsSnap = await getDocs(
      query(
        collection(db, "restaurants", restDoc.id, "products"),
        where("isActive", "==", true)
      )
    );

    const matched = productsSnap.docs
      .map((d) => ({ id: d.id, restaurantId: restDoc.id, ...d.data() }) as Product)
      .filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.tags.some((t) => t.toLowerCase().includes(term)) ||
          p.description.toLowerCase().includes(term)
      );

    allProducts.push(...matched);
  }

  return allProducts.slice(0, 20);
}
