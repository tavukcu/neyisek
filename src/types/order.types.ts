import { Timestamp } from "firebase/firestore";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "courier_assigned"
  | "picked_up"
  | "delivering"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "credit_card" | "cash" | "bkm";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  extras: { id: string; name: string; price: number }[];
  notes?: string;
}

export interface OrderPricing {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  total: number;
}

export interface OrderPayment {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  iyzicoPaymentId?: string;
}

export interface OrderDelivery {
  address: string;
  lat: number;
  lng: number;
  estimatedTime?: number;
  actualTime?: number;
}

export interface StatusHistory {
  status: OrderStatus;
  timestamp: Timestamp;
  note?: string;
}

export interface CourierLocation {
  lat: number;
  lng: number;
  updatedAt: Timestamp;
}

export interface OrderReview {
  rating: number;
  comment: string;
  createdAt: Timestamp;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  restaurantId: string;
  courierId?: string;
  items: OrderItem[];
  pricing: OrderPricing;
  payment: OrderPayment;
  delivery: OrderDelivery;
  status: OrderStatus;
  statusHistory: StatusHistory[];
  courierLocation?: CourierLocation;
  review?: OrderReview;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
