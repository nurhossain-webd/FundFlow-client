"use client";

import { ArrowRight, CircleAlert, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useTopFundedCampaigns } from "@/features/home/hooks/use-home-data";

import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const formatCredits = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

function CampaignCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-4 p-5">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-7 w-4/5" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </div>
    </div>
  );
}

export function TopFundedCampaigns() {
  const {
    data: campaigns,
    isError,
    isLoading,
    refetch,
  } = useTopFundedCampaigns();

  return (
    <section className="bg-canvas py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Leading the flow"
            title="Top funded campaigns"
            description="Meet the approved ideas earning the strongest support from the FundFlow community."
            action={
              <Link
                href="/campaigns"
                className="inline-flex items-center gap-2 font-semibold text-flow-700 transition hover:text-flow-900"
              >
                Explore all campaigns
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            }
          />
        </Reveal>

        {isLoading ? (
          <div
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Loading top funded campaigns"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <CampaignCardSkeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={CircleAlert}
            title="Campaigns could not be loaded"
            description="We could not reach FundFlow’s public campaign service. Please try again."
            action={<Button onClick={() => void refetch()}>Try again</Button>}
          />
        ) : campaigns?.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="The first featured campaigns are on their way"
            description="Approved campaigns will appear here as soon as the community begins supporting them."
            action={
              <Link
                href="/campaigns"
                className="font-semibold text-flow-700 hover:text-flow-900"
              >
                Browse all campaigns
              </Link>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns?.map((campaign, index) => {
              const progress = Math.min(
                Math.round(
                  (campaign.amountRaised / campaign.fundingGoal) * 100,
                ),
                100,
              );

              return (
                <Reveal key={campaign.id} delay={index * 0.06}>
                  <article className="group h-full overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-[0_8px_30px_rgba(6,47,53,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(6,47,53,0.11)]">
                    <Link
                      href={`/campaigns/${campaign.id}`}
                      className="block focus-visible:outline-offset-[-3px]"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-flow-100">
                        <Image
                          src={campaign.imageURL}
                          alt={`${campaign.title} campaign`}
                          fill
                          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                          className="object-cover transition duration-500 group-hover:scale-[1.04]"
                        />
                      </div>
                      <div className="p-5">
                        <span className="inline-flex rounded-full bg-flow-50 px-2.5 py-1 text-xs font-bold text-flow-700">
                          {campaign.category}
                        </span>
                        <h3 className="mt-3 line-clamp-2 min-h-14 font-display text-xl leading-7 font-bold text-ink-strong">
                          {campaign.title}
                        </h3>
                        <div className="mt-5 flex items-baseline justify-between gap-3">
                          <p className="text-sm text-ink-muted">
                            <strong className="text-lg font-bold text-ink-strong">
                              {formatCredits(campaign.amountRaised)}
                            </strong>{" "}
                            credits
                          </p>
                          <span className="text-sm font-semibold text-flow-700">
                            {progress}%
                          </span>
                        </div>
                        <div
                          className="mt-2 h-2 overflow-hidden rounded-full bg-canvas-muted"
                          role="progressbar"
                          aria-label={`${progress}% funded`}
                          aria-valuenow={Math.min(
                            campaign.amountRaised,
                            campaign.fundingGoal,
                          )}
                          aria-valuemin={0}
                          aria-valuemax={campaign.fundingGoal}
                        >
                          <div
                            className="h-full rounded-full bg-flow-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="mt-2 text-sm text-ink-muted">
                          Goal: {formatCredits(campaign.fundingGoal)} credits
                        </p>
                      </div>
                    </Link>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
