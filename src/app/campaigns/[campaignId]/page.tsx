import { CampaignDetailView } from "@/features/campaigns/components/campaign-detail-view";

interface CampaignDetailPageProps {
  params: Promise<{
    campaignId: string;
  }>;
}

export default async function CampaignDetailPage({
  params,
}: CampaignDetailPageProps) {
  const { campaignId } = await params;

  return <CampaignDetailView campaignId={campaignId} />;
}
