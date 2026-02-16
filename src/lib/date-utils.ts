import { Timestamp } from "firebase/firestore";

type DateLike = Timestamp | Date | string | number | null | undefined;

export function toDate(value: DateLike): Date {
  if (!value) return new Date();
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  return new Date(value);
}

export function formatDate(value: DateLike): string {
  return toDate(value).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(value: DateLike): string {
  return toDate(value).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
