"use client";

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

import {
  createCheckoutSession,
  getCreditPackages,
  getCreditPaymentStatus,
  getPaymentHistory,
} from "../services/credit-payment.service";
import type { PaymentHistoryFilters } from "../types/credit-payment";

export const creditPackagesQueryKey = ["credit-packages"] as const;

export const useCreditPackages = () =>
  useQuery({
    queryKey: creditPackagesQueryKey,
    queryFn: getCreditPackages,
    staleTime: 10 * 60 * 1_000,
  });

export const useCreateCheckoutSession = () =>
  useMutation({ mutationFn: createCheckoutSession });

export const useCreditPaymentStatus = (checkoutSessionId: string | null) =>
  useQuery({
    queryKey: ["credit-payment", checkoutSessionId],
    queryFn: () => getCreditPaymentStatus(checkoutSessionId!),
    enabled: Boolean(checkoutSessionId),
    retry: 3,
    retryDelay: 1_500,
    refetchInterval: (query) =>
      query.state.data?.status === "pending" ? 2_000 : false,
  });

export const usePaymentHistory = (filters: PaymentHistoryFilters) =>
  useQuery({
    queryKey: ["credit-payments", "supporter", filters],
    queryFn: () => getPaymentHistory(filters),
    placeholderData: keepPreviousData,
  });
