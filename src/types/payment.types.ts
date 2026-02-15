import { Timestamp } from "firebase/firestore";

export type PaymentMethodType = "credit_card" | "cash" | "bkm";
export type TransactionStatus = "pending" | "success" | "failed" | "refunded";

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  restaurantId: string;
  amount: number;
  method: PaymentMethodType;
  status: TransactionStatus;
  iyzicoPaymentId?: string;
  iyzicoConversationId?: string;
  cardDetails?: {
    lastFour: string;
    brand: string;
  };
  createdAt: Timestamp;
}
