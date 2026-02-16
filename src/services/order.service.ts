import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Order, OrderStatus } from "@/types";

const COLLECTION = "orders";

let orderCounter = 842;

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  return `NY-${year}-${String(++orderCounter).padStart(4, "0")}`;
}

export async function createOrder(
  data: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt" | "statusHistory"> & {
    restaurantName?: string;
  }
): Promise<string> {
  if (!db) throw new Error("Database not initialized");

  const orderNumber = generateOrderNumber();
  const now = serverTimestamp();

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    orderNumber,
    status: data.status || "pending",
    statusHistory: [
      {
        status: data.status || "pending",
        timestamp: Timestamp.now(),
      },
    ],
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

export async function getOrdersByCustomer(customerId: string): Promise<Order[]> {
  if (!db) return [];

  const q = query(
    collection(db, COLLECTION),
    where("customerId", "==", customerId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  if (!db) return null;

  const docRef = doc(db, COLLECTION, orderId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Order;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string
) {
  if (!db) return;

  const entry: Record<string, unknown> = {
    status,
    timestamp: Timestamp.now(),
  };
  if (note) entry.note = note;

  await updateDoc(doc(db, COLLECTION, orderId), {
    status,
    statusHistory: arrayUnion(entry),
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToOrder(
  orderId: string,
  callback: (order: Order | null) => void
): () => void {
  if (!db) {
    callback(null);
    return () => {};
  }

  return onSnapshot(doc(db, COLLECTION, orderId), (docSnap) => {
    if (!docSnap.exists()) {
      callback(null);
      return;
    }
    callback({ id: docSnap.id, ...docSnap.data() } as Order);
  });
}

export function subscribeToCustomerOrders(
  customerId: string,
  callback: (orders: Order[]) => void
): () => void {
  if (!db) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, COLLECTION),
    where("customerId", "==", customerId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
    callback(orders);
  });
}
