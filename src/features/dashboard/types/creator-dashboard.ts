import type { ContributionStatus } from "@/features/contributions/types/creator-contribution";

export interface CreatorDashboardData {
  statistics: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalAmountRaised: number;
    currentRaisedCredits: number;
    estimatedWithdrawalCents: number;
    withdrawalRate: {
      creditsPerDollar: number;
      centsPerDollar: number;
    };
  };
  raisedByCampaign: Array<{
    campaignId: string;
    title: string;
    amountRaised: number;
    status: string;
  }>;
  contributionStatusDistribution: Array<{
    status: ContributionStatus;
    count: number;
    totalCredits: number;
  }>;
  latestPendingContributions: Array<{
    contributionId: string;
    supporterName: string;
    campaignTitle: string;
    amount: number;
    createdAt: string;
  }>;
}
