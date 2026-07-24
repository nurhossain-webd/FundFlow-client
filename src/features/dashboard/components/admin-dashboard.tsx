"use client";

import { format } from "date-fns";
import {
  CircleAlert,
  Coins,
  CreditCard,
  FileClock,
  ShieldCheck,
  UserRound,
  UsersRound,
  WalletCards,
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

import { useAdminDashboard } from "../hooks/use-admin-dashboard";

const roleLabels = {
  supporter: "Supporters",
  creator: "Creators",
  admin: "Admins",
} as const;

const roleColors = {
  supporter: "#0C9FA6",
  creator: "#E46E50",
  admin: "#D6A22C",
} as const;

const campaignStatusLabels = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
} as const;

const campaignStatusColors = {
  pending: "#D6A22C",
  approved: "#16836A",
  rejected: "#B8404E",
  suspended: "#657D7D",
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
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="mt-7 grid gap-6 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-96 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const dashboardQuery = useAdminDashboard();

  if (dashboardQuery.isLoading) {
    return <DashboardLoadingState />;
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <div className="min-w-0 py-5">
        <div className="mx-auto max-w-7xl">
          <EmptyState
            icon={CircleAlert}
            title="Admin analytics could not be loaded"
            description={
              dashboardQuery.error instanceof Error
                ? dashboardQuery.error.message
                : "FundFlow could not reach the platform analytics service."
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
  const roleDistribution = dashboard.userRoleDistribution
    .filter((item) => item.count > 0)
    .map((item) => ({
      ...item,
      label: roleLabels[item.role],
      fill: roleColors[item.role],
    }));
  const campaignDistribution = dashboard.campaignStatusDistribution
    .filter((item) => item.count > 0)
    .map((item) => ({
      ...item,
      label: campaignStatusLabels[item.status],
      fill: campaignStatusColors[item.status],
    }));
  const recentPayments = dashboard.recentPaymentTotals.map((payment) => ({
    ...payment,
    label: format(new Date(`${payment.date}T00:00:00Z`), "MMM d"),
  }));

  const statisticCards = [
    {
      label: "Total supporters",
      value: statistics.totalSupporters.toLocaleString(),
      detail: "Registered Supporter profiles",
      icon: UsersRound,
    },
    {
      label: "Total creators",
      value: statistics.totalCreators.toLocaleString(),
      detail: "Registered Creator profiles",
      icon: UserRound,
    },
    {
      label: "Available user credits",
      value: `${formatCredits(statistics.totalAvailableUserCredits)} cr`,
      detail: "Current credits across all profiles",
      icon: Coins,
    },
    {
      label: "Payments processed",
      value: statistics.totalPaymentsProcessed.toLocaleString(),
      detail: `${formatCurrencyFromCents(statistics.totalPaymentAmountInCents)} completed`,
      icon: CreditCard,
    },
  ];

  return (
    <div className="min-w-0">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-flow-700 uppercase">
              Admin dashboard
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.035em] text-ink-strong sm:text-4xl">
              Platform operations
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-ink-muted">
              Monitor platform growth, campaign moderation, payment activity,
              and pending withdrawal obligations.
            </p>
          </div>
          <Link
            href="/dashboard/admin/campaigns"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-flow-600 px-5 text-sm font-semibold text-white hover:bg-flow-700"
          >
            <ShieldCheck aria-hidden="true" className="size-4" />
            Review campaigns
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

        <div className="mt-7 grid gap-6 xl:grid-cols-3">
          <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-[0_8px_30px_rgba(6,47,53,0.05)] sm:p-6">
            <h2 className="font-display text-xl font-bold text-ink-strong">
              User role distribution
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Verified platform profiles by role.
            </p>
            {roleDistribution.length === 0 ? (
              <ChartEmptyState message="No user profiles are available yet." />
            ) : (
              <DistributionChart
                data={roleDistribution}
                valueLabel="Profiles"
              />
            )}
          </section>

          <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-[0_8px_30px_rgba(6,47,53,0.05)] sm:p-6">
            <h2 className="font-display text-xl font-bold text-ink-strong">
              Campaign status distribution
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Campaigns across every moderation state.
            </p>
            {campaignDistribution.length === 0 ? (
              <ChartEmptyState message="No campaigns have been submitted yet." />
            ) : (
              <DistributionChart
                data={campaignDistribution}
                valueLabel="Campaigns"
              />
            )}
          </section>

          <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-[0_8px_30px_rgba(6,47,53,0.05)] sm:p-6">
            <h2 className="font-display text-xl font-bold text-ink-strong">
              Recent payment totals
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Completed USD payments during the last 30 days.
            </p>
            {recentPayments.length === 0 ? (
              <ChartEmptyState message="No completed payments were recorded in the last 30 days." />
            ) : (
              <div className="mt-5 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={recentPayments}
                    margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#DCE9E7"
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#657D7D", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(value: number) =>
                        formatCurrencyFromCents(value)
                      }
                      tick={{ fill: "#657D7D", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={58}
                    />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrencyFromCents(Number(value)),
                        "Processed",
                      ]}
                      cursor={{ fill: "#F1F7F6" }}
                    />
                    <Bar
                      dataKey="amountInCents"
                      fill="#0C9FA6"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>
        </div>

        <div className="mt-7 grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-[0_8px_30px_rgba(6,47,53,0.05)] sm:p-6">
            <QueueHeader
              title="Newest pending campaigns"
              description="The five latest campaigns awaiting moderation."
              href="/dashboard/admin/campaigns"
              linkLabel="Open campaign review"
            />
            {dashboard.newestPendingCampaigns.length === 0 ? (
              <QueueEmptyState message="No campaigns are waiting for review." />
            ) : (
              <div className="mt-5 divide-y divide-border-subtle">
                {dashboard.newestPendingCampaigns.map((campaign) => (
                  <article
                    key={campaign.campaignId}
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-ink-strong">
                          {campaign.title}
                        </p>
                        <Badge variant="warning">Pending</Badge>
                      </div>
                      <p className="mt-1 text-sm text-ink-muted">
                        By {campaign.creatorName}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="font-semibold text-ink-strong">
                        {formatCredits(campaign.fundingGoal)} credit goal
                      </p>
                      <p className="text-xs text-ink-muted">
                        {format(new Date(campaign.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-[0_8px_30px_rgba(6,47,53,0.05)] sm:p-6">
            <QueueHeader
              title="Newest withdrawal requests"
              description="The five latest Creator withdrawals requiring action."
              href="/dashboard/admin/withdrawals"
              linkLabel="Open withdrawals"
            />
            {dashboard.newestPendingWithdrawals.length === 0 ? (
              <QueueEmptyState message="No withdrawals are waiting for review." />
            ) : (
              <div className="mt-5 divide-y divide-border-subtle">
                {dashboard.newestPendingWithdrawals.map((withdrawal) => (
                  <article
                    key={withdrawal.withdrawalId}
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-ink-strong">
                          {withdrawal.creatorName}
                        </p>
                        <Badge variant="warning">Pending</Badge>
                      </div>
                      <p className="mt-1 truncate text-sm text-ink-muted">
                        {withdrawal.creatorEmail}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="font-semibold text-ink-strong">
                        {formatCredits(withdrawal.requestedCredits)} credits
                      </p>
                      <p className="text-xs text-ink-muted">
                        {formatCurrencyFromCents(withdrawal.amountInCents)} ·{" "}
                        {format(new Date(withdrawal.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-72 flex-col items-center justify-center text-center">
      <span className="flex size-11 items-center justify-center rounded-xl bg-flow-100 text-flow-700">
        <FileClock aria-hidden="true" className="size-5" />
      </span>
      <p className="mt-4 max-w-xs text-sm text-ink-muted">{message}</p>
    </div>
  );
}

interface DistributionChartItem {
  label: string;
  fill: string;
  count: number;
}

function DistributionChart({
  data,
  valueLabel,
}: {
  data: DistributionChartItem[];
  valueLabel: string;
}) {
  return (
    <div className="mt-5 h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            innerRadius="50%"
            outerRadius="76%"
            paddingAngle={3}
          >
            {data.map((item) => (
              <Cell key={item.label} fill={item.fill} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [Number(value).toLocaleString(), valueLabel]}
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
  );
}

interface QueueHeaderProps {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}

function QueueHeader({
  description,
  href,
  linkLabel,
  title,
}: QueueHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <h2 className="font-display text-xl font-bold text-ink-strong">
          {title}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">{description}</p>
      </div>
      <Link
        href={href}
        className="text-sm font-semibold text-flow-700 hover:text-flow-900"
      >
        {linkLabel} →
      </Link>
    </div>
  );
}

function QueueEmptyState({ message }: { message: string }) {
  return (
    <div className="mt-5 rounded-xl border border-dashed border-border p-8 text-center">
      <span className="mx-auto flex size-10 items-center justify-center rounded-xl bg-flow-100 text-flow-700">
        <WalletCards aria-hidden="true" className="size-5" />
      </span>
      <p className="mt-3 text-sm text-ink-muted">{message}</p>
    </div>
  );
}
