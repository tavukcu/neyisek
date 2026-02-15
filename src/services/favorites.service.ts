import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function addFavorite(userId: string, restaurantId: string) {
  if (!db) return;
  const ref = doc(db, "users", userId, "favorites", restaurantId);
  await setDoc(ref, { restaurantId, createdAt: serverTimestamp() });
}

export async function removeFavorite(userId: string, restaurantId: string) {
  if (!db) return;
  const ref = doc(db, "users", userId, "favorites", restaurantId);
  await deleteDoc(ref);
}

export async function getFavorites(userId: string): Promise<string[]> {
  if (!db) return [];
  const q = query(collection(db, "users", userId, "favorites"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.id);
}

export async function isFavorite(userId: string, restaurantId: string): Promise<boolean> {
  if (!db) return false;
  const q = query(
    collection(db, "users", userId, "favorites"),
    where("restaurantId", "==", restaurantId)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}
