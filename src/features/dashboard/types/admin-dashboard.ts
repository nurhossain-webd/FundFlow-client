export interface AdminDashboardData {
  statistics: {
    totalSupporters: number;
    totalCreators: number;
    totalAvailableUserCredits: number;
    totalPaymentsProcessed: number;
    totalPaymentAmountInCents: number;
    paymentCurrency: "usd";
  };
  userRoleDistribution: Array<{
    role: "supporter" | "creator" | "admin";
    count: number;
    availableCredits: number;
  }>;
  campaignStatusDistribution: Array<{
    status: "pending" | "approved" | "rejected" | "suspended";
    count: number;
  }>;
  recentPaymentTotals: Array<{
    date: string;
    paymentCount: number;
    amountInCents: number;
  }>;
  newestPendingCampaigns: Array<{
    campaignId: string;
    title: string;
    creatorName: string;
    fundingGoal: number;
    createdAt: string;
  }>;
  newestPendingWithdrawals: Array<{
    withdrawalId: string;
    creatorName: string;
    creatorEmail: string;
    requestedCredits: number;
    amountInCents: number;
    createdAt: string;
  }>;
}
