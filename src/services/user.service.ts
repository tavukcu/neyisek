import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User, UserPreferences } from "@/types";

const COLLECTION = "users";

export async function getUserById(userId: string): Promise<User | null> {
  if (!db) return null;

  const docRef = doc(db, COLLECTION, userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as User;
}

export async function updateUserProfile(
  userId: string,
  data: Partial<Pick<User, "displayName" | "phoneNumber" | "photoURL">>
): Promise<void> {
  if (!db) return;

  await updateDoc(doc(db, COLLECTION, userId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserPreferences(
  userId: string,
  prefs: Partial<UserPreferences>
): Promise<void> {
  if (!db) return;

  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(prefs)) {
    updates[`preferences.${key}`] = value;
  }
  updates.updatedAt = serverTimestamp();

  await updateDoc(doc(db, COLLECTION, userId), updates);
}
