import axios from "axios";

import { apiClient } from "@/lib/api-client";

import type {
  CreditPackage,
  CreditPaymentStatus,
} from "../types/credit-payment";

interface CreditPackagesResponse {
  success: true;
  data: { packages: CreditPackage[] };
}

interface CheckoutSessionResponse {
  success: true;
  data: {
    checkoutSessionId: string;
    checkoutURL: string;
  };
}

interface CreditPaymentStatusResponse {
  success: true;
  data: { payment: CreditPaymentStatus };
}

export const getCreditPackages = async (): Promise<CreditPackage[]> => {
  const response =
    await apiClient.get<CreditPackagesResponse>("/payments/packages");
  return response.data.data.packages;
};

export const createCheckoutSession = async (packageId: CreditPackage["id"]) => {
  const response = await apiClient.post<CheckoutSessionResponse>(
    "/payments/checkout-session",
    { packageId },
  );
  return response.data.data;
};

export const getCreditPaymentStatus = async (
  checkoutSessionId: string,
): Promise<CreditPaymentStatus> => {
  const response = await apiClient.get<CreditPaymentStatusResponse>(
    `/payments/checkout-session/${encodeURIComponent(checkoutSessionId)}`,
  );
  return response.data.data.payment;
};

export const getCreditPaymentErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return (
      error.response?.data.message ??
      "The payment service is temporarily unavailable."
    );
  }

  return "The payment service is temporarily unavailable.";
};
