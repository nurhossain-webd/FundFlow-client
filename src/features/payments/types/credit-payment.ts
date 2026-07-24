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
