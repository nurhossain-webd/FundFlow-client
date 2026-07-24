export type ContributionStatus =
  "pending" | "approved" | "rejected" | "refunded";

export interface CreatorContribution {
  _id: string;
  campaignId: string;
  campaignTitle: string;
  supporterName: string;
  supporterEmail: string;
  amount: number;
  message?: string;
  status: ContributionStatus;
  reviewedAt?: string;
  rejectionReason?: string;
  refundedAt?: string;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorContributionPage {
  contributions: CreatorContribution[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreatorContributionStatistics {
  totalContributions: number;
  totalCredits: number;
  pendingCount: number;
  pendingCredits: number;
  approvedCount: number;
  approvedCredits: number;
  rejectedCount: number;
  rejectedCredits: number;
  refundedCount: number;
  refundedCredits: number;
}
