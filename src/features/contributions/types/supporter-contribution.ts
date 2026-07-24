import type { ContributionStatus } from "./creator-contribution";

export type SupporterContributionFilter = Extract<
  ContributionStatus,
  "pending" | "approved" | "rejected"
>;

export interface SupporterContribution {
  _id: string;
  campaignId: string;
  campaignTitle: string;
  creatorName?: string;
  creatorEmail: string;
  amount: number;
  status: ContributionStatus;
  createdAt: string;
}

export interface SupporterContributionPage {
  contributions: SupporterContribution[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SupporterContributionFilters {
  page: number;
  limit: 10 | 20 | 50;
  status?: SupporterContributionFilter;
}
