export type AdminCampaignStatus =
  "pending" | "approved" | "rejected" | "suspended";

export interface AdminCampaign {
  _id: string;
  title: string;
  story: string;
  category: string;
  fundingGoal: number;
  minimumContribution: number;
  deadline: string;
  rewardInfo: string;
  imageURL: string;
  creatorName: string;
  creatorEmail: string;
  amountRaised: number;
  status: AdminCampaignStatus;
  createdAt: string;
  updatedAt: string;
}

export type AdminPendingCampaign = AdminCampaign & { status: "pending" };

export interface AdminCampaignPage {
  campaigns: AdminCampaign[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminCampaignFilters {
  page: number;
  limit: number;
  search?: string;
  status?: AdminCampaignStatus;
}

export type AdminPendingCampaignPage = Omit<AdminCampaignPage, "campaigns"> & {
  campaigns: AdminPendingCampaign[];
};
