import type { Metadata } from "next";

import { CreatorWithdrawalForm } from "@/features/withdrawals/components/creator-withdrawal-form";

export const metadata: Metadata = {
  title: "Withdraw Raised Credits | FundFlow",
  description: "Request a secure withdrawal of your raised campaign credits.",
};

export default function CreatorWithdrawalsPage() {
  return <CreatorWithdrawalForm />;
}
