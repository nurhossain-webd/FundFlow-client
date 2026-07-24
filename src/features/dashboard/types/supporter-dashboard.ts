import type { ContributionStatus } from "@/features/contributions/types/creator-contribution";

export interface SupporterDashboardData {
  statistics: {
    totalContributions: number;
    pendingContributions: number;
    totalApprovedAmount: number;
    currentAvailableCredits: number;
  };
  contributionsByCampaign: Array<{
    campaignId: string;
    campaignTitle: string;
    approvedAmount: number;
    contributionCount: number;
  }>;
  contributionStatusDistribution: Array<{
    status: ContributionStatus;
    count: number;
    totalCredits: number;
  }>;
  approvedContributions: Array<{
    contributionId: string;
    campaignId: string;
    campaignTitle: string;
    creatorName?: string;
    creatorEmail: string;
    amount: number;
    createdAt: string;
  }>;
}
