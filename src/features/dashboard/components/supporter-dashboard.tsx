"use client";

import { format } from "date-fns";
import {
  CircleAlert,
  Coins,
  ExternalLink,
  HandCoins,
  HeartHandshake,
  Hourglass,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useSupporterDashboard } from "../hooks/use-supporter-dashboard";
import type { SupporterDashboardData } from "../types/supporter-dashboard";

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

function DashboardLoadingState() {
  return (
    <main className="flex-1 bg-canvas px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-3 h-11 w-80 max-w-full" />
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="mt-7 grid gap-6 xl:grid-cols-2">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
        <Skeleton className="mt-7 h-80 rounded-2xl" />
      </div>
    </main>
  );
}

function MobileApprovedContribution({
  contribution,
}: {
  contribution: SupporterDashboardData["approvedContributions"][number];
}) {
  return (
    <article className="rounded-2xl border border-l-4 border-border-subtle border-l-[#167451] bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg leading-6 font-bold text-ink-strong">
          {contribution.campaignTitle}
        </h3>
        <Badge variant="success">Approved</Badge>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-ink-muted">Creator</dt>
          <dd className="mt-1 font-semibold text-ink-strong">
            {contribution.creatorName ?? contribution.creatorEmail}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Amount</dt>
          <dd className="mt-1 font-semibold text-ink-strong">
            {formatCredits(contribution.amount)} credits
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Date</dt>
          <dd className="mt-1 font-semibold text-ink-strong">
            {format(new Date(contribution.createdAt), "MMM d, yyyy")}
          </dd>
        </div>
      </dl>
      <Link
        href={`/campaigns/${contribution.campaignId}`}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-flow-700 hover:text-flow-900"
      >
        View campaign
        <ExternalLink aria-hidden="true" className="size-4" />
      </Link>
    </article>
  );
}

export function SupporterDashboard() {
  const dashboardQuery = useSupporterDashboard();

  if (dashboardQuery.isLoading) {
    return <DashboardLoadingState />;
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <main className="flex-1 bg-canvas px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <EmptyState
            icon={CircleAlert}
            title="Supporter analytics could not be loaded"
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
      </main>
    );
  }

  const dashboard = dashboardQuery.data;
  const statistics = dashboard.statistics;
  const contributionDistribution = dashboard.contributionStatusDistribution
    .filter((item) => item.count > 0)
    .map((item) => ({
      ...item,
      label: statusLabels[item.status],
      fill: statusColors[item.status],
    }));

  const statisticCards = [
    {
      label: "Total contributions",
      value: statistics.totalContributions.toLocaleString(),
      detail: "Every submitted contribution",
      icon: HeartHandshake,
    },
    {
      label: "Pending contributions",
      value: statistics.pendingContributions.toLocaleString(),
      detail: "Awaiting creator review",
      icon: Hourglass,
    },
    {
      label: "Total approved amount",
      value: `${formatCredits(statistics.totalApprovedAmount)} cr`,
      detail: "Credits accepted by creators",
      icon: HandCoins,
    },
    {
      label: "Available credits",
      value: `${formatCredits(statistics.currentAvailableCredits)} cr`,
      detail: "Ready for future support",
      icon: Coins,
    },
  ];

  return (
    <main className="flex-1 bg-canvas px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-flow-700 uppercase">
              Supporter dashboard
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.035em] text-ink-strong sm:text-4xl">
              Your funding impact
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-ink-muted">
              Follow your approved support, pending decisions, and available
              FundFlow credits from one place.
            </p>
          </div>
          <Link
            href="/campaigns"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-flow-600 px-5 text-sm font-semibold text-white hover:bg-flow-700"
          >
            <HeartHandshake aria-hidden="true" className="size-4" />
            Explore campaigns
          </Link>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                <p className="mt-3 font-display text-3xl font-bold text-ink-strong">
                  {statistic.value}
                </p>
                <p className="mt-2 text-xs text-ink-muted">
                  {statistic.detail}
                </p>
              </section>
            );
          })}
        </div>

        <div className="mt-7 grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-[0_8px_30px_rgba(6,47,53,0.05)] sm:p-6">
            <h2 className="font-display text-xl font-bold text-ink-strong">
              Contributions by campaign
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Your approved credits grouped by the campaigns they support.
            </p>
            {dashboard.contributionsByCampaign.length === 0 ? (
              <div className="flex h-72 flex-col items-center justify-center text-center">
                <span className="flex size-11 items-center justify-center rounded-xl bg-flow-100 text-flow-700">
                  <HandCoins aria-hidden="true" className="size-5" />
                </span>
                <p className="mt-4 font-semibold text-ink-strong">
                  No approved contributions yet
                </p>
                <p className="mt-1 max-w-xs text-sm text-ink-muted">
                  Campaign totals will appear after a Creator approves your
                  support.
                </p>
              </div>
            ) : (
              <div
                className="mt-5 w-full"
                style={{
                  height: Math.max(
                    300,
                    dashboard.contributionsByCampaign.length * 48,
                  ),
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboard.contributionsByCampaign}
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
                      dataKey="campaignTitle"
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
                        "Approved",
                      ]}
                      cursor={{ fill: "#F1F7F6" }}
                    />
                    <Bar
                      dataKey="approvedAmount"
                      name="Approved credits"
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
              Contribution-status distribution
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Server-counted statuses across your complete contribution history.
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
                  Your contribution statuses will appear after you support a
                  campaign.
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
                Approved contributions
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Your ten most recently approved campaign contributions.
              </p>
            </div>
            <Link
              href="/dashboard/supporter/contributions?status=approved&page=1&limit=10"
              className="text-sm font-semibold text-flow-700 hover:text-flow-900"
            >
              View complete history →
            </Link>
          </div>

          {dashboard.approvedContributions.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-border p-8 text-center">
              <p className="font-semibold text-ink-strong">
                No approved contributions yet
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                Contributions appear here after Creator approval.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-5 hidden md:block">
                <Table className="min-w-[760px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Link</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.approvedContributions.map((contribution) => (
                      <TableRow key={contribution.contributionId}>
                        <TableCell className="font-semibold text-ink-strong">
                          {contribution.campaignTitle}
                        </TableCell>
                        <TableCell>
                          {contribution.creatorName ??
                            contribution.creatorEmail}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCredits(contribution.amount)} credits
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(contribution.createdAt),
                            "MMM d, yyyy",
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="success">Approved</Badge>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/campaigns/${contribution.campaignId}`}
                            className="inline-flex items-center gap-1.5 font-semibold text-flow-700 hover:text-flow-900"
                          >
                            View
                            <ExternalLink
                              aria-hidden="true"
                              className="size-3.5"
                            />
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-5 grid gap-4 md:hidden">
                {dashboard.approvedContributions.map((contribution) => (
                  <MobileApprovedContribution
                    key={contribution.contributionId}
                    contribution={contribution}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
