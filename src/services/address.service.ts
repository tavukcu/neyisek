import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Address } from "@/types";

function addressesRef(userId: string) {
  if (!db) return null;
  return collection(db, "users", userId, "addresses");
}

export async function getAddresses(userId: string): Promise<Address[]> {
  const ref = addressesRef(userId);
  if (!ref) return [];

  const snapshot = await getDocs(query(ref));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Address);
}

export async function addAddress(
  userId: string,
  address: Omit<Address, "id">
): Promise<string> {
  const ref = addressesRef(userId);
  if (!ref) throw new Error("Database not initialized");

  // If this is default, unset other defaults
  if (address.isDefault) {
    await clearDefaults(userId);
  }

  const docRef = await addDoc(ref, address);
  return docRef.id;
}

export async function updateAddress(
  userId: string,
  addressId: string,
  data: Partial<Address>
): Promise<void> {
  if (!db) return;

  // If setting as default, unset other defaults first
  if (data.isDefault) {
    await clearDefaults(userId);
  }

  const ref = doc(db, "users", userId, "addresses", addressId);
  await updateDoc(ref, data);
}

export async function removeAddress(
  userId: string,
  addressId: string
): Promise<void> {
  if (!db) return;

  const ref = doc(db, "users", userId, "addresses", addressId);
  await deleteDoc(ref);
}

async function clearDefaults(userId: string): Promise<void> {
  if (!db) return;

  const addresses = await getAddresses(userId);
  const batch = writeBatch(db);

  for (const addr of addresses) {
    if (addr.isDefault) {
      batch.update(doc(db, "users", userId, "addresses", addr.id), {
        isDefault: false,
      });
    }
  }

  await batch.commit();
}
