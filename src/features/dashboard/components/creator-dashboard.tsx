"use client";

import { format } from "date-fns";
import {
  Activity,
  CircleAlert,
  Coins,
  FolderKanban,
  HandCoins,
  Landmark,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

import { useCreatorDashboard } from "../hooks/use-creator-dashboard";

const statusLabels = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  refunded: "Refunded",
} as const;

const statusColors = {
  pending: "#D6A22C",
  approved: "#16836A",
  rejected: "#B8404E",
  refunded: "#347FB5",
} as const;

const formatCredits = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

const formatCurrencyFromCents = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value / 100);

function DashboardLoadingState() {
  return (
    <div className="min-w-0">
      <div className="mx-auto max-w-7xl">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="mt-3 h-11 w-80 max-w-full" />
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="mt-7 grid gap-6 xl:grid-cols-2">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function CreatorDashboard() {
  const dashboardQuery = useCreatorDashboard();

  if (dashboardQuery.isLoading) {
    return <DashboardLoadingState />;
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <div className="min-w-0 py-5">
        <div className="mx-auto max-w-7xl">
          <EmptyState
            icon={CircleAlert}
            title="Creator analytics could not be loaded"
            description={
              dashboardQuery.error instanceof Error
                ? dashboardQuery.error.message
                : "FundFlow could not reach the dashboard analytics service."
            }
            action={
              <Button onClick={() => void dashboardQuery.refetch()}>
                Try again
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const dashboard = dashboardQuery.data;
  const statistics = dashboard.statistics;
  const hasRaisedCredits = dashboard.raisedByCampaign.some(
    (campaign) => campaign.amountRaised > 0,
  );
  const contributionDistribution = dashboard.contributionStatusDistribution
    .filter((item) => item.count > 0)
    .map((item) => ({
      ...item,
      label: statusLabels[item.status],
      fill: statusColors[item.status],
    }));

  const statisticCards = [
    {
      label: "Total campaigns",
      value: statistics.totalCampaigns.toLocaleString(),
      detail: "All submitted campaigns",
      icon: FolderKanban,
    },
    {
      label: "Active campaigns",
      value: statistics.activeCampaigns.toLocaleString(),
      detail: "Approved and accepting support",
      icon: Activity,
    },
    {
      label: "Total amount raised",
      value: `${formatCredits(statistics.totalAmountRaised)} cr`,
      detail: "Across current campaigns",
      icon: HandCoins,
    },
    {
      label: "Current raised credits",
      value: `${formatCredits(statistics.currentRaisedCredits)} cr`,
      detail: "Available before withdrawals",
      icon: Coins,
    },
    {
      label: "Estimated withdrawal",
      value: formatCurrencyFromCents(statistics.estimatedWithdrawalCents),
      detail: `${statistics.withdrawalRate.creditsPerDollar} credits per $1`,
      icon: Landmark,
    },
  ];

  return (
    <div className="min-w-0">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-flow-700 uppercase">
              Creator dashboard
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.035em] text-ink-strong sm:text-4xl">
              Campaign performance
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-ink-muted">
              Monitor campaign momentum, contribution decisions, and your
              server-calculated raised-credit position.
            </p>
          </div>
          <Link
            href="/dashboard/creator/campaigns/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-flow-600 px-5 text-sm font-semibold text-white hover:bg-flow-700"
          >
            <Megaphone aria-hidden="true" className="size-4" />
            Create campaign
          </Link>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {statisticCards.map((statistic) => {
            const Icon = statistic.icon;

            return (
              <section
                key={statistic.label}
                className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-[0_8px_30px_rgba(6,47,53,0.05)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-ink-muted">
                    {statistic.label}
                  </p>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-flow-100 text-flow-700">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                </div>
                <p className="mt-3 font-display text-2xl font-bold text-ink-strong">
                  {statistic.value}
                </p>
                <p className="mt-2 text-xs leading-5 text-ink-muted">
                  {statistic.detail}
                </p>
              </section>
            );
          })}
        </div>

        <div className="mt-7 grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-[0_8px_30px_rgba(6,47,53,0.05)] sm:p-6">
            <h2 className="font-display text-xl font-bold text-ink-strong">
              Raised credits by campaign
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Approved credit totals recorded against each campaign.
            </p>
            {dashboard.raisedByCampaign.length === 0 || !hasRaisedCredits ? (
              <div className="flex h-72 flex-col items-center justify-center text-center">
                <span className="flex size-11 items-center justify-center rounded-xl bg-flow-100 text-flow-700">
                  <HandCoins aria-hidden="true" className="size-5" />
                </span>
                <p className="mt-4 font-semibold text-ink-strong">
                  No raised credits yet
                </p>
                <p className="mt-1 max-w-xs text-sm text-ink-muted">
                  Approved contributions will create the first campaign data
                  point.
                </p>
              </div>
            ) : (
              <div
                className="mt-5 w-full"
                style={{
                  height: Math.max(300, dashboard.raisedByCampaign.length * 48),
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboard.raisedByCampaign}
                    layout="vertical"
                    margin={{ top: 5, right: 12, bottom: 5, left: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#DCE9E7"
                    />
                    <XAxis
                      type="number"
                      tick={{ fill: "#657D7D", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="title"
                      width={120}
                      tick={{ fill: "#415B5B", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(title: string) =>
                        title.length > 18 ? `${title.slice(0, 18)}…` : title
                      }
                    />
                    <Tooltip
                      formatter={(value) => [
                        `${formatCredits(Number(value))} credits`,
                        "Raised",
                      ]}
                      cursor={{ fill: "#F1F7F6" }}
                    />
                    <Bar
                      dataKey="amountRaised"
                      name="Raised credits"
                      fill="#0C9FA6"
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-[0_8px_30px_rgba(6,47,53,0.05)] sm:p-6">
            <h2 className="font-display text-xl font-bold text-ink-strong">
              Contribution status distribution
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Server-counted contribution decisions across your campaigns.
            </p>
            {contributionDistribution.length === 0 ? (
              <div className="flex h-72 flex-col items-center justify-center text-center">
                <span className="flex size-11 items-center justify-center rounded-xl bg-flow-100 text-flow-700">
                  <Coins aria-hidden="true" className="size-5" />
                </span>
                <p className="mt-4 font-semibold text-ink-strong">
                  No contribution activity yet
                </p>
                <p className="mt-1 max-w-xs text-sm text-ink-muted">
                  Pending and reviewed contributions will appear in this
                  distribution.
                </p>
              </div>
            ) : (
              <div className="mt-5 h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={contributionDistribution}
                      dataKey="count"
                      nameKey="label"
                      innerRadius="52%"
                      outerRadius="78%"
                      paddingAngle={3}
                    >
                      {contributionDistribution.map((item) => (
                        <Cell key={item.status} fill={item.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        Number(value).toLocaleString(),
                        "Contributions",
                      ]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      formatter={(value) => (
                        <span className="text-sm text-ink-muted">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>
        </div>

        <section className="mt-7 rounded-2xl border border-border-subtle bg-surface p-5 shadow-[0_8px_30px_rgba(6,47,53,0.05)] sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-xl font-bold text-ink-strong">
                Latest pending contributions
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                The five newest contributions requiring your decision.
              </p>
            </div>
            <Link
              href="/dashboard/creator/contributions"
              className="text-sm font-semibold text-flow-700 hover:text-flow-900"
            >
              Open review queue →
            </Link>
          </div>

          {dashboard.latestPendingContributions.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-border p-8 text-center">
              <p className="font-semibold text-ink-strong">
                No contributions are waiting for review
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                New pending contributions will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="mt-5 divide-y divide-border-subtle">
              {dashboard.latestPendingContributions.map((contribution) => (
                <article
                  key={contribution.contributionId}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink-strong">
                        {contribution.supporterName}
                      </p>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                    <p className="mt-1 truncate text-sm text-ink-muted">
                      {contribution.campaignTitle}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-5 sm:justify-end">
                    <div className="text-right">
                      <p className="font-semibold text-ink-strong">
                        {formatCredits(contribution.amount)} credits
                      </p>
                      <p className="text-xs text-ink-muted">
                        {format(
                          new Date(contribution.createdAt),
                          "MMM d, yyyy",
                        )}
                      </p>
                    </div>
                    <Link
                      href="/dashboard/creator/contributions"
                      className="text-sm font-semibold text-flow-700 hover:text-flow-900"
                    >
                      Review
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
