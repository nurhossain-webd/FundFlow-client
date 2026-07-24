export type WithdrawalPaymentSystem = "stripe" | "bkash" | "rocket" | "nagad";
export type WithdrawalStatus =
  "pending" | "approved" | "processing" | "completed" | "rejected" | "failed";

export interface WithdrawalSummary {
  currentRaisedCredits: number;
  reservedRaisedCredits: number;
  withdrawableCredits: number;
  equivalentAmountInCents: number;
  minimumWithdrawalCredits: number;
  creditsPerDollar: number;
}

export interface WithdrawalRequest {
  id: string;
  creatorName: string;
  creatorEmail: string;
  withdrawalCredits: number;
  amountInCents: number;
  creditsPerDollar: number;
  paymentSystem: WithdrawalPaymentSystem;
  accountNumber: string;
  status: WithdrawalStatus;
  date: string;
}

export interface CreateWithdrawalInput {
  credits: number;
  paymentSystem: WithdrawalPaymentSystem;
  accountNumber: string;
}

export interface WithdrawalHistoryPage {
  withdrawals: WithdrawalRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WithdrawalHistoryFilters {
  page: number;
  limit: 10 | 20 | 50;
  status?: WithdrawalStatus;
}
