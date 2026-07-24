"use client";

import { useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNowStrict } from "date-fns";
import {
  CalendarDays,
  CircleAlert,
  Coins,
  Flag,
  Gift,
  Mail,
  ShieldCheck,
  Target,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  currentProfileQueryKey,
  useCurrentProfile,
} from "@/features/auth/hooks/use-current-profile";
import { useAuth } from "@/providers/auth-provider";

import {
  campaignDetailQueryKey,
  useCampaignDetail,
  useCreateContribution,
} from "../hooks/use-campaign-detail";
import {
  contributionFormSchema,
  type ContributionFormInput,
} from "../schemas/contribution-form.schema";
import type { CampaignDetail } from "../types/campaign-detail";
import { ReportCampaignModal } from "./report-campaign-modal";

const formatCredits = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

interface ContributionPanelProps {
  campaign: CampaignDetail;
}

function ContributionPanel({ campaign }: ContributionPanelProps) {
  const queryClient = useQueryClient();
  const { isAuthenticated, isPending: isSessionPending } = useAuth();
  const profileQuery = useCurrentProfile(isAuthenticated);
  const contributionMutation = useCreateContribution();
  const [requestIdentity, setRequestIdentity] = useState<{
    signature: string;
    key: string;
  }>();
  const [isExpired, setIsExpired] = useState(false);
  const [formError, setFormError] = useState<string>();
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<ContributionFormInput>({
    defaultValues: { amount: "" },
  });
  const profile = profileQuery.data;
  const deadlineTimestamp = Date.parse(campaign.deadline);

  useEffect(() => {
    const maximumDelay = 2_147_000_000;
    let timeout: ReturnType<typeof setTimeout>;

    const scheduleDeadlineCheck = () => {
      const remainingTime = deadlineTimestamp - Date.now();

      if (remainingTime <= 0) {
        setIsExpired(true);
        return;
      }

      timeout = setTimeout(
        scheduleDeadlineCheck,
        Math.min(remainingTime, maximumDelay),
      );
    };

    timeout = setTimeout(scheduleDeadlineCheck, 0);
    return () => clearTimeout(timeout);
  }, [deadlineTimestamp]);

  const submitContribution = handleSubmit(async (values) => {
    setFormError(undefined);
    const validation = contributionFormSchema.safeParse(values);

    if (!validation.success) {
      setError("amount", {
        message: validation.error.issues[0]?.message,
      });
      return;
    }

    if (!profile || profile.role !== "supporter") {
      setFormError("Only authenticated Supporters can contribute.");
      return;
    }

    if (isExpired) {
      setFormError("This campaign is no longer accepting contributions.");
      return;
    }

    if (validation.data.amount < campaign.minimumContribution) {
      setError("amount", {
        message: `Enter at least ${formatCredits(campaign.minimumContribution)} credits`,
      });
      return;
    }

    if (validation.data.amount > profile.credits) {
      setError("amount", {
        message: "Contribution exceeds your available credits",
      });
      return;
    }

    const confirmation = await Swal.fire({
      icon: "question",
      title: "Confirm contribution",
      text: `${formatCredits(validation.data.amount)} credits will be deducted now and held pending the creator’s review.`,
      showCancelButton: true,
      confirmButtonText: "Submit contribution",
      cancelButtonText: "Review amount",
      confirmButtonColor: "#098A91",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    const signature = `${campaign._id}:${validation.data.amount}`;
    const identity =
      requestIdentity?.signature === signature
        ? requestIdentity
        : {
            signature,
            key: `contribution:${crypto.randomUUID()}`,
          };

    if (requestIdentity?.signature !== signature) {
      setRequestIdentity(identity);
    }

    try {
      const result = await contributionMutation.mutateAsync({
        campaignId: campaign._id,
        amount: validation.data.amount,
        idempotencyKey: identity.key,
      });

      setRequestIdentity(undefined);
      reset();
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: campaignDetailQueryKey(campaign._id),
        }),
        queryClient.invalidateQueries({
          queryKey: currentProfileQueryKey,
        }),
      ]);
      toast.success(
        result.created
          ? "Contribution submitted for creator review"
          : "Your contribution was already submitted",
      );
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to submit contribution",
      );
    }
  });

  if (isSessionPending) {
    return (
      <div className="space-y-4" aria-label="Loading contribution options">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <h2 className="font-display text-xl font-bold text-ink-strong">
          Ready to support this campaign?
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          Sign in with a Supporter account to contribute credits securely.
        </p>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(`/campaigns/${campaign._id}`)}`}
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-[10px] bg-flow-600 px-5 text-sm font-semibold text-white hover:bg-flow-700"
        >
          Sign in to contribute
        </Link>
      </div>
    );
  }

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-4" aria-label="Loading supporter credits">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    );
  }

  if (profileQuery.isError || !profile) {
    return (
      <EmptyState
        icon={CircleAlert}
        title="Account details unavailable"
        description="Your verified FundFlow profile could not be loaded."
        action={
          <Button onClick={() => void profileQuery.refetch()}>Try again</Button>
        }
      />
    );
  }

  if (profile.role !== "supporter") {
    return (
      <div>
        <h2 className="font-display text-xl font-bold text-ink-strong">
          Supporter contributions only
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          {profile.role === "creator" ? "Creators" : "Administrators"} can
          review this campaign, but cannot submit contributions.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submitContribution} noValidate>
      <h2 className="font-display text-xl font-bold text-ink-strong">
        Support this campaign
      </h2>
      <div className="mt-4 flex items-center justify-between rounded-xl bg-flow-50 p-3 text-sm">
        <span className="text-ink-muted">Available credits</span>
        <strong className="flex items-center gap-1.5 text-flow-800">
          <Coins aria-hidden="true" className="size-4" />
          {formatCredits(profile.credits)}
        </strong>
      </div>
      <p className="mt-3 text-sm text-ink-muted">
        Minimum contribution:{" "}
        <strong className="text-ink-strong">
          {formatCredits(campaign.minimumContribution)} credits
        </strong>
      </p>

      <label className="mt-5 block text-sm font-semibold text-ink-strong">
        Contribution amount
        <input
          type="number"
          inputMode="numeric"
          min={campaign.minimumContribution}
          max={profile.credits}
          step={1}
          placeholder={`At least ${campaign.minimumContribution}`}
          aria-invalid={Boolean(errors.amount)}
          disabled={isExpired || contributionMutation.isPending}
          className="mt-2 h-12 w-full rounded-[10px] border border-border bg-white px-4 text-ink-strong outline-none focus:border-flow-600 focus:ring-4 focus:ring-flow-100 disabled:bg-canvas-muted"
          {...register("amount")}
        />
        {errors.amount?.message ? (
          <span className="mt-1.5 block font-normal text-error" role="alert">
            {errors.amount.message}
          </span>
        ) : null}
      </label>

      {formError ? (
        <p
          className="mt-4 rounded-xl bg-[#FFF0F2] p-3 text-sm text-error"
          role="alert"
        >
          {formError}
        </p>
      ) : null}

      <Button
        type="submit"
        className="mt-5 w-full"
        isLoading={contributionMutation.isPending}
        loadingText="Submitting contribution…"
        disabled={isExpired || profile.credits < campaign.minimumContribution}
      >
        {isExpired
          ? "Campaign ended"
          : profile.credits < campaign.minimumContribution
            ? "Not enough credits"
            : "Contribute credits"}
      </Button>
    </form>
  );
}

export function CampaignDetailView({ campaignId }: { campaignId: string }) {
  const { isAuthenticated } = useAuth();
  const profileQuery = useCurrentProfile(isAuthenticated);
  const campaignQuery = useCampaignDetail(campaignId);
  const [isReportOpen, setIsReportOpen] = useState(false);

  if (campaignQuery.isLoading) {
    return (
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="mt-5 aspect-[16/8] w-full rounded-3xl" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <Skeleton className="h-12 w-4/5" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
          </div>
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </main>
    );
  }

  if (campaignQuery.isError || !campaignQuery.data) {
    return (
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-16 sm:px-6">
        <EmptyState
          icon={CircleAlert}
          title="Campaign unavailable"
          description={
            campaignQuery.error instanceof Error
              ? campaignQuery.error.message
              : "This campaign could not be found or is no longer active."
          }
          action={
            <Link
              href="/campaigns"
              className="font-semibold text-flow-700 hover:text-flow-900"
            >
              Explore active campaigns
            </Link>
          }
        />
      </main>
    );
  }

  const campaign = campaignQuery.data;
  const deadline = new Date(campaign.deadline);
  const progress = Math.min(
    100,
    Math.round((campaign.amountRaised / campaign.fundingGoal) * 100),
  );
  const isSupporter = profileQuery.data?.role === "supporter";

  return (
    <main className="flex-1 bg-canvas">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/campaigns"
          className="text-sm font-semibold text-flow-700 hover:text-flow-900"
        >
          ← Back to campaigns
        </Link>

        <div className="mt-6 overflow-hidden rounded-3xl border border-border-subtle bg-surface shadow-[0_18px_60px_rgba(6,47,53,0.08)]">
          <div className="relative aspect-[16/8] max-h-[520px] bg-flow-100">
            <Image
              src={campaign.imageURL}
              alt=""
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-flow-950/55 via-transparent to-transparent" />
            <Badge className="absolute bottom-5 left-5 border-white/30 bg-white/95 text-flow-800">
              {campaign.category}
            </Badge>
          </div>

          <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-10">
            <div>
              <h1 className="font-display text-3xl leading-tight font-bold tracking-[-0.04em] text-ink-strong sm:text-5xl">
                {campaign.title}
              </h1>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-canvas-muted p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
                    <Target aria-hidden="true" className="size-4" />
                    Funding goal
                  </p>
                  <p className="mt-2 font-display text-xl font-bold text-ink-strong">
                    {formatCredits(campaign.fundingGoal)}
                  </p>
                </div>
                <div className="rounded-xl bg-canvas-muted p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
                    <Coins aria-hidden="true" className="size-4" />
                    Credits raised
                  </p>
                  <p className="mt-2 font-display text-xl font-bold text-ink-strong">
                    {formatCredits(campaign.amountRaised)}
                  </p>
                </div>
                <div className="rounded-xl bg-canvas-muted p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
                    <CalendarDays aria-hidden="true" className="size-4" />
                    Time remaining
                  </p>
                  <p className="mt-2 font-display text-xl font-bold text-ink-strong">
                    {formatDistanceToNowStrict(deadline)}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between gap-3 text-sm font-semibold">
                  <span className="text-flow-700">{progress}% funded</span>
                  <span className="text-ink-muted">
                    Ends {format(deadline, "MMM d, yyyy")}
                  </span>
                </div>
                <div
                  className="mt-2 h-3 overflow-hidden rounded-full bg-canvas-muted"
                  role="progressbar"
                  aria-label={`${progress}% funded`}
                  aria-valuenow={campaign.amountRaised}
                  aria-valuemin={0}
                  aria-valuemax={campaign.fundingGoal}
                >
                  <div
                    className="h-full rounded-full bg-flow-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <section className="mt-10">
                <h2 className="font-display text-2xl font-bold text-ink-strong">
                  Campaign story
                </h2>
                <p className="mt-4 whitespace-pre-line leading-8 text-ink">
                  {campaign.story}
                </p>
              </section>

              <section className="mt-10 rounded-2xl border border-coral-200 bg-coral-50 p-5">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink-strong">
                  <Gift aria-hidden="true" className="size-5 text-coral-600" />
                  Reward information
                </h2>
                <p className="mt-3 whitespace-pre-line leading-7 text-ink">
                  {campaign.rewardInfo}
                </p>
              </section>

              <section className="mt-8 rounded-2xl border border-border-subtle p-5">
                <p className="text-xs font-bold tracking-[0.12em] text-flow-700 uppercase">
                  Campaign creator
                </p>
                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-flow-100 text-flow-700">
                    <UserRound aria-hidden="true" className="size-6" />
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-bold text-ink-strong">
                      {campaign.creatorName}
                    </h2>
                    <p className="mt-1 flex items-center gap-2 text-sm text-ink-muted">
                      <Mail aria-hidden="true" className="size-4" />
                      {campaign.creatorEmail}
                    </p>
                  </div>
                  <span className="sm:ml-auto">
                    <Badge variant="success">
                      <ShieldCheck
                        aria-hidden="true"
                        className="mr-1 size-3.5"
                      />
                      Approved campaign
                    </Badge>
                  </span>
                </div>
              </section>

              {isSupporter ? (
                <button
                  type="button"
                  onClick={() => setIsReportOpen(true)}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-error hover:underline"
                >
                  <Flag aria-hidden="true" className="size-4" />
                  Report campaign
                </button>
              ) : null}
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-border-subtle bg-white p-5 shadow-[0_12px_40px_rgba(6,47,53,0.08)] sm:p-6">
                <ContributionPanel campaign={campaign} />
              </div>
            </aside>
          </div>
        </div>
      </div>

      <ReportCampaignModal
        campaignId={campaign._id}
        campaignTitle={campaign.title}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </main>
  );
}
