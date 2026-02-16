import {
  collection,
  getDocs,
  query,
  where,
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

  const q = query(
    collection(db, "categories"),
    where("isActive", "==", true)
  );
  const snapshot = await getDocs(q);
  const categories = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Category);

  // Client-side sort by order
  categories.sort((a, b) => a.order - b.order);
  return categories;
}
