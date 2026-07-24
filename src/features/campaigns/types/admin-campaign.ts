export interface AdminPendingCampaign {
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
  status: "pending";
  createdAt: string;
  updatedAt: string;
}

export interface AdminPendingCampaignPage {
  campaigns: AdminPendingCampaign[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
