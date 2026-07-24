export interface CreditPackage {
  id: "credits_100" | "credits_300" | "credits_800" | "credits_1500";
  credits: number;
  amountInCents: number;
  currency: "usd";
}

export interface CreditPaymentStatus {
  paymentId: string;
  packageId: CreditPackage["id"];
  creditsPurchased: number;
  amountInCents: number;
  currency: string;
  status: "created" | "pending" | "completed" | "failed" | "refunded";
  completedAt: string | null;
}

export type PaymentHistoryStatus = CreditPaymentStatus["status"];

export interface PaymentHistoryItem {
  transactionId: string;
  creditsPurchased: number;
  amountInCents: number;
  currency: string;
  paymentMethod: string;
  status: PaymentHistoryStatus;
  createdAt: string;
}

export interface PaymentHistoryPage {
  payments: PaymentHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaymentHistoryFilters {
  page: number;
  limit: 10 | 20 | 50;
}
