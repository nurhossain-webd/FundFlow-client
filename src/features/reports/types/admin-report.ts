export type CampaignReportReason =
  | "fraud"
  | "misleading_information"
  | "prohibited_content"
  | "harassment"
  | "spam"
  | "other";

export type CampaignReportStatus =
  "pending" | "under_review" | "resolved" | "dismissed";

export interface AdminCampaignReport {
  id: string;
  campaignId: string;
  campaignTitle: string;
  creatorName: string;
  creatorEmail: string;
  reporterName: string;
  reporterEmail: string;
  reason: CampaignReportReason;
  details: string;
  status: CampaignReportStatus;
  reportDate: string;
  resolutionNote: string | null;
  resolvedAt: string | null;
}

export interface AdminCampaignReportPage {
  reports: AdminCampaignReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminCampaignReportFilters {
  page: number;
  limit: number;
  search?: string;
  status?: CampaignReportStatus;
}
