"use client";

import { format } from "date-fns";
import {
  CalendarDays,
  CircleAlert,
  Coins,
  Mail,
  MessageSquareText,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";

import { useCreatorContributionDetail } from "../hooks/use-creator-contributions";

const formatCredits = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

interface ContributionDetailModalProps {
  contributionId?: string;
  onClose: () => void;
}

export function ContributionDetailModal({
  contributionId,
  onClose,
}: ContributionDetailModalProps) {
  const contributionQuery = useCreatorContributionDetail(contributionId);
  const contribution = contributionQuery.data;

  return (
    <Modal
      isOpen={Boolean(contributionId)}
      onClose={onClose}
      title="Contribution details"
      description="Review the supporter, campaign, amount, and message before making a decision."
      className="max-w-2xl"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {contributionQuery.isLoading ? (
        <div className="space-y-4" aria-label="Loading contribution details">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : contributionQuery.isError || !contribution ? (
        <div className="rounded-xl bg-[#FFF0F2] p-4 text-sm text-error">
          <p className="flex items-center gap-2 font-semibold">
            <CircleAlert aria-hidden="true" className="size-4" />
            Contribution details could not be loaded
          </p>
          <button
            type="button"
            onClick={() => void contributionQuery.refetch()}
            className="mt-3 font-semibold underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-xl bg-canvas-muted p-4">
              <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-ink-muted uppercase">
                <UserRound aria-hidden="true" className="size-4" />
                Supporter
              </p>
              <p className="mt-2 font-semibold text-ink-strong">
                {contribution.supporterName}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
                <Mail aria-hidden="true" className="size-3.5" />
                {contribution.supporterEmail}
              </p>
            </section>

            <section className="rounded-xl bg-canvas-muted p-4">
              <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-ink-muted uppercase">
                <Coins aria-hidden="true" className="size-4" />
                Contribution
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-flow-800">
                {formatCredits(contribution.amount)} credits
              </p>
              <Badge variant="warning" className="mt-2">
                Pending review
              </Badge>
            </section>
          </div>

          <section className="rounded-xl border border-border-subtle p-4">
            <p className="text-xs font-bold tracking-wide text-ink-muted uppercase">
              Campaign
            </p>
            <Link
              href={`/campaigns/${contribution.campaignId}`}
              className="mt-2 block font-semibold text-flow-700 hover:text-flow-900"
            >
              {contribution.campaignTitle}
            </Link>
            <p className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
              <CalendarDays aria-hidden="true" className="size-4" />
              Submitted{" "}
              {format(new Date(contribution.createdAt), "MMM d, yyyy 'at' p")}
            </p>
          </section>

          <section className="rounded-xl border border-border-subtle p-4">
            <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-ink-muted uppercase">
              <MessageSquareText aria-hidden="true" className="size-4" />
              Supporter message
            </p>
            <p className="mt-3 whitespace-pre-line leading-7 text-ink">
              {contribution.message || "No message was provided."}
            </p>
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <p className="rounded-xl bg-[#EAF8F1] p-4 text-sm leading-6 text-[#167451]">
              <strong className="block">If approved</strong>
              Credits are added to this campaign’s raised amount and your
              withdrawable raised-credit balance.
            </p>
            <p className="rounded-xl bg-[#FFF0F2] p-4 text-sm leading-6 text-error">
              <strong className="block">If rejected</strong>
              The full contribution is returned to the Supporter’s available
              credit balance.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
