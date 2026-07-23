export interface TopFundedCampaign {
  id: string;
  title: string;
  category: string;
  imageURL: string;
  amountRaised: number;
  fundingGoal: number;
  deadline: string;
}

export interface PlatformStatistics {
  totalRaisedCredits: number;
  approvedCampaigns: number;
  activeCreators: number;
  contributingSupporters: number;
}

export interface TopCampaignsResponse {
  success: true;
  data: {
    campaigns: TopFundedCampaign[];
  };
}

export interface PlatformStatisticsResponse {
  success: true;
  data: {
    statistics: PlatformStatistics;
  };
}
