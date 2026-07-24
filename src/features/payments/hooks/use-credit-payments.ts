"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import {
  createCheckoutSession,
  getCreditPackages,
  getCreditPaymentStatus,
} from "../services/credit-payment.service";

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
