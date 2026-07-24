import axios from "axios";

import { apiClient } from "@/lib/api-client";

import type {
  CreateWithdrawalInput,
  WithdrawalRequest,
  WithdrawalHistoryFilters,
  WithdrawalHistoryPage,
  WithdrawalSummary,
} from "../types/withdrawal";

interface WithdrawalSummaryResponse {
  success: true;
  data: { summary: WithdrawalSummary };
}

interface CreateWithdrawalResponse {
  success: true;
  data: {
    withdrawal: WithdrawalRequest;
    created: boolean;
  };
}

interface WithdrawalHistoryResponse {
  success: true;
  data: WithdrawalHistoryPage;
}

export const getWithdrawalSummary = async (): Promise<WithdrawalSummary> => {
  try {
    const response = await apiClient.get<WithdrawalSummaryResponse>(
      "/withdrawals/summary",
    );
    return response.data.data.summary;
  } catch (error) {
    throw new Error(getWithdrawalErrorMessage(error));
  }
};

export const createWithdrawal = async (
  input: CreateWithdrawalInput,
  idempotencyKey: string,
): Promise<WithdrawalRequest> => {
  try {
    const response = await apiClient.post<CreateWithdrawalResponse>(
      "/withdrawals",
      input,
      { headers: { "Idempotency-Key": idempotencyKey } },
    );
    return response.data.data.withdrawal;
  } catch (error) {
    throw new Error(getWithdrawalErrorMessage(error));
  }
};

export const getCreatorWithdrawalHistory = async (
  filters: WithdrawalHistoryFilters,
): Promise<WithdrawalHistoryPage> => {
  try {
    const response = await apiClient.get<WithdrawalHistoryResponse>(
      "/withdrawals/mine",
      { params: filters },
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getWithdrawalErrorMessage(error));
  }
};

export const getWithdrawalErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return (
      error.response?.data.message ??
      "The withdrawal service is temporarily unavailable."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "The withdrawal service is temporarily unavailable.";
};
