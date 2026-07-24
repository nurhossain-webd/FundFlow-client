export type WithdrawalPaymentSystem = "stripe" | "bkash" | "rocket" | "nagad";

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
  status: string;
  date: string;
}

export interface CreateWithdrawalInput {
  credits: number;
  paymentSystem: WithdrawalPaymentSystem;
  accountNumber: string;
}
