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

  const q = query(
    collection(db, "categories"),
    where("isActive", "==", true),
    orderBy("order")
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Category);
}
