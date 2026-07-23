"use client";

import {
  CircleAlert,
  HandHeart,
  Lightbulb,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePlatformStatistics } from "@/features/home/hooks/use-home-data";

import { Reveal } from "./reveal";

const numberFormatter = new Intl.NumberFormat("en-US");

interface ImpactStatistic {
  label: string;
  value: number;
  icon: LucideIcon;
}

export function PlatformImpact() {
  const { data, isError, isLoading, refetch } = usePlatformStatistics();

  const statistics: ImpactStatistic[] = data
    ? [
        {
          label: "Credits raised",
          value: data.totalRaisedCredits,
          icon: TrendingUp,
        },
        {
          label: "Approved campaigns",
          value: data.approvedCampaigns,
          icon: Lightbulb,
        },
        {
          label: "Contributing supporters",
          value: data.contributingSupporters,
          icon: HandHeart,
        },
        {
          label: "Active creators",
          value: data.activeCreators,
          icon: Users,
        },
      ]
    : [];
  const displayedStatistics: Array<ImpactStatistic | null> = isLoading
    ? Array.from({ length: 4 }, () => null)
    : statistics;

  return (
    <section className="relative overflow-hidden bg-flow-800 py-16 text-white sm:py-20">
      <div
        aria-hidden="true"
        className="absolute -top-24 -right-20 size-80 rounded-full bg-flow-300/10 blur-3xl"
      />
      <div className="relative mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-bold tracking-[0.16em] text-flow-200 uppercase">
              Community momentum
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              Impact you can measure
            </h2>
            <p className="mt-3 leading-7 text-flow-100">
              Live totals built from approved campaigns and contributions—not
              inflated promises.
            </p>
          </div>
        </Reveal>

        {isError ? (
          <div className="flex flex-col items-center rounded-2xl border border-white/15 bg-white/[0.07] px-6 py-9 text-center">
            <CircleAlert aria-hidden="true" className="size-8 text-flow-200" />
            <p className="mt-3 font-semibold">Impact totals are unavailable.</p>
            <p className="mt-1 text-sm text-flow-100">
              Please try loading the latest platform statistics again.
            </p>
            <Button
              variant="secondary"
              className="mt-5"
              onClick={() => void refetch()}
            >
              Try again
            </Button>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/15 lg:grid-cols-4"
            aria-busy={isLoading}
          >
            {displayedStatistics.map((statistic, index) => {
              if (!statistic) {
                return (
                  <div
                    key={index}
                    className="min-h-40 animate-pulse bg-flow-900/80 p-6"
                  >
                    <div className="size-10 rounded-xl bg-white/10" />
                    <div className="mt-6 h-8 w-24 rounded bg-white/10" />
                    <div className="mt-3 h-4 w-32 rounded bg-white/10" />
                  </div>
                );
              }

              const Icon = statistic.icon;

              return (
                <Reveal key={statistic.label} delay={index * 0.07}>
                  <div className="min-h-40 bg-flow-900/80 p-5 sm:p-6">
                    <Icon aria-hidden="true" className="size-7 text-flow-300" />
                    <p className="mt-5 font-display text-2xl font-bold sm:text-3xl">
                      {numberFormatter.format(statistic.value)}
                    </p>
                    <p className="mt-1 text-sm text-flow-100 sm:text-base">
                      {statistic.label}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
