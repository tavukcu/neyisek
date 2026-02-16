import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
}

export async function getCategories(): Promise<Category[]> {
  if (!db) return [];

  try {
    const q = query(
      collection(db, "categories"),
      where("isActive", "==", true),
      orderBy("order")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Category);
  } catch (err) {
    if (String(err).includes("index")) {
      // Fallback: get all, filter + sort client-side
      const snapshot = await getDocs(collection(db, "categories"));
      const categories = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Category)
        .filter((c) => c.isActive);
      categories.sort((a, b) => a.order - b.order);
      return categories;
    }
    throw err;
  }
}
