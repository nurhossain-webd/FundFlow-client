import axios from "axios";

import { publicApiClient } from "@/lib/public-api-client";

import type {
  CampaignDeadlineFilter,
  CampaignGoalFilter,
  CampaignSort,
  ExploreCampaignFilters,
  ExploreCampaignPage,
} from "../types/explore-campaign";

interface ExploreCampaignResponse {
  success: true;
  data: ExploreCampaignPage;
}

const deadlineDays: Record<CampaignDeadlineFilter, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

const goalRanges: Record<
  CampaignGoalFilter,
  { fundingGoalMin?: number; fundingGoalMax?: number }
> = {
  "under-1000": { fundingGoalMax: 999 },
  "1000-5000": { fundingGoalMin: 1000, fundingGoalMax: 5000 },
  "over-5000": { fundingGoalMin: 5001 },
};

const sortOptions: Record<
  CampaignSort,
  {
    sortBy: "createdAt" | "deadline" | "amountRaised" | "progress";
    sortOrder: "asc" | "desc";
  }
> = {
  newest: { sortBy: "createdAt", sortOrder: "desc" },
  deadline: { sortBy: "deadline", sortOrder: "asc" },
  "highest-funded": { sortBy: "amountRaised", sortOrder: "desc" },
  progress: { sortBy: "progress", sortOrder: "desc" },
};

export const getExploreCampaigns = async (
  filters: ExploreCampaignFilters,
): Promise<ExploreCampaignPage> => {
  const deadlineBefore = filters.deadline
    ? new Date(
        Date.now() + deadlineDays[filters.deadline] * 24 * 60 * 60 * 1000,
      ).toISOString()
    : undefined;
  const goalRange = filters.goal ? goalRanges[filters.goal] : {};

  try {
    const response = await publicApiClient.get<ExploreCampaignResponse>(
      "/campaigns",
      {
        params: {
          search: filters.search,
          category: filters.category,
          deadlineBefore,
          ...goalRange,
          ...sortOptions[filters.sort],
          page: filters.page,
          limit: 12,
        },
      },
    );

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      throw new Error(
        error.response?.data.message ?? "Unable to load campaigns",
      );
    }

    throw new Error("Unable to load campaigns");
  }
};
