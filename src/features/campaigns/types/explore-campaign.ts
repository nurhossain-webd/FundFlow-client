export interface ExploreCampaign {
  _id: string;
  title: string;
  creatorName: string;
  category: string;
  imageURL: string;
  deadline: string;
  fundingGoal: number;
  amountRaised: number;
}

export interface ExploreCampaignPage {
  campaigns: ExploreCampaign[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type CampaignDeadlineFilter = "7d" | "30d" | "90d";
export type CampaignGoalFilter = "under-1000" | "1000-5000" | "over-5000";
export type CampaignSort =
  "newest" | "deadline" | "highest-funded" | "progress";

export interface ExploreCampaignFilters {
  search?: string;
  category?: string;
  deadline?: CampaignDeadlineFilter;
  goal?: CampaignGoalFilter;
  sort: CampaignSort;
  page: number;
}
