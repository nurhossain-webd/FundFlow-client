import type { Metadata } from "next";

import { PurchaseCredits } from "@/features/payments/components/purchase-credits";

export const metadata: Metadata = {
  title: "Purchase Credits | FundFlow",
  description: "Securely purchase FundFlow credits through Stripe Checkout.",
};

export default function PurchaseCreditsPage() {
  return <PurchaseCredits />;
}
