export interface CampaignDetail {
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
  status: "approved";
  createdAt: string;
  updatedAt: string;
  updates?: Array<{
    _id: string;
    title: string;
    message: string;
    createdAt: string;
  }>;
}

export type CampaignReportReason =
  | "fraud"
  | "misleading_information"
  | "prohibited_content"
  | "harassment"
  | "spam"
  | "other";

export interface CampaignReportInput {
  reason: CampaignReportReason;
  details: string;
}
