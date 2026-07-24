"use client";

import { format, formatDistanceToNowStrict } from "date-fns";
import {
  CalendarDays,
  CircleAlert,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { campaignCategories } from "@/features/campaigns/schemas/campaign-form.schema";

import { useExploreCampaigns } from "../hooks/use-explore-campaigns";
import type {
  CampaignDeadlineFilter,
  CampaignGoalFilter,
  CampaignSort,
  ExploreCampaign,
  ExploreCampaignFilters,
} from "../types/explore-campaign";

const validDeadlines = new Set<CampaignDeadlineFilter>(["7d", "30d", "90d"]);
const validGoals = new Set<CampaignGoalFilter>([
  "under-1000",
  "1000-5000",
  "over-5000",
]);
const validSorts = new Set<CampaignSort>([
  "newest",
  "deadline",
  "highest-funded",
  "progress",
]);

const formatCredits = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

const getFilters = (parameters: URLSearchParams): ExploreCampaignFilters => {
  const deadline = parameters.get("deadline");
  const goal = parameters.get("goal");
  const sort = parameters.get("sort");
  const requestedPage = Number(parameters.get("page"));
  const search = parameters.get("search")?.trim();
  const category = parameters.get("category");

  return {
    ...(search ? { search } : {}),
    ...(category && campaignCategories.some((item) => item === category)
      ? { category }
      : {}),
    ...(deadline && validDeadlines.has(deadline as CampaignDeadlineFilter)
      ? { deadline: deadline as CampaignDeadlineFilter }
      : {}),
    ...(goal && validGoals.has(goal as CampaignGoalFilter)
      ? { goal: goal as CampaignGoalFilter }
      : {}),
    sort:
      sort && validSorts.has(sort as CampaignSort)
        ? (sort as CampaignSort)
        : "newest",
    page:
      Number.isSafeInteger(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1,
  };
};

function CampaignCard({ campaign }: { campaign: ExploreCampaign }) {
  const progress = Math.min(
    100,
    Math.round((campaign.amountRaised / campaign.fundingGoal) * 100),
  );
  const deadline = new Date(campaign.deadline);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-[0_8px_30px_rgba(6,47,53,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(6,47,53,0.11)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-flow-100">
        <Image
          src={campaign.imageURL}
          alt={`${campaign.title} campaign`}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-flow-800 shadow-sm backdrop-blur">
          {campaign.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="line-clamp-2 font-display text-xl leading-7 font-bold text-ink-strong">
          {campaign.title}
        </h2>
        <p className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
          <UserRound aria-hidden="true" className="size-4 text-flow-600" />
          <span className="truncate">By {campaign.creatorName}</span>
        </p>
        <p
          className="mt-2 flex items-center gap-2 text-sm text-ink-muted"
          title={format(deadline, "PPPP")}
        >
          <CalendarDays aria-hidden="true" className="size-4 text-flow-600" />
          Ends in {formatDistanceToNowStrict(deadline)}
        </p>

        <div className="mt-5 flex items-end justify-between gap-3">
          <p className="text-sm text-ink-muted">
            <strong className="block text-lg text-ink-strong">
              {formatCredits(campaign.amountRaised)}
            </strong>
            credits raised
          </p>
          <p className="text-right text-sm text-ink-muted">
            Goal
            <strong className="block text-ink-strong">
              {formatCredits(campaign.fundingGoal)}
            </strong>
          </p>
        </div>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-canvas-muted"
          role="progressbar"
          aria-label={`${progress}% funded`}
          aria-valuenow={Math.min(campaign.amountRaised, campaign.fundingGoal)}
          aria-valuemin={0}
          aria-valuemax={campaign.fundingGoal}
        >
          <div
            className="h-full rounded-full bg-flow-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs font-semibold">
          <span className="text-flow-700">{progress}% funded</span>
          <span className="text-ink-muted">
            {format(deadline, "MMM d, yyyy")}
          </span>
        </div>

        <Link
          href={`/campaigns/${campaign._id}`}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-[10px] border border-border bg-white text-sm font-semibold text-flow-700 transition hover:border-flow-600 hover:bg-flow-50"
        >
          View details
        </Link>
      </div>
    </article>
  );
}

function CampaignGridSkeleton() {
  return (
    <div
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Loading campaigns"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-border-subtle bg-surface"
        >
          <Skeleton className="aspect-[16/10] w-full rounded-none" />
          <div className="space-y-4 p-5">
            <Skeleton className="h-7 w-4/5" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ExploreCampaigns() {
  const router = useRouter();
  const searchParameters = useSearchParams();
  const [isNavigating, startTransition] = useTransition();
  const filters = getFilters(searchParameters);
  const campaignQuery = useExploreCampaigns(filters);

  const updateParameters = (
    updates: Record<string, string | undefined>,
    resetPage = true,
  ) => {
    const nextParameters = new URLSearchParams(searchParameters.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        nextParameters.set(key, value);
      } else {
        nextParameters.delete(key);
      }
    }

    if (resetPage) {
      nextParameters.delete("page");
    }

    const query = nextParameters.toString();
    startTransition(() => {
      router.replace(query ? `/campaigns?${query}` : "/campaigns", {
        scroll: false,
      });
    });
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const search = String(form.get("search") ?? "")
      .trim()
      .slice(0, 100);
    updateParameters({ search: search || undefined });
  };

  const pagination = campaignQuery.data?.pagination;
  const campaigns = campaignQuery.data?.campaigns ?? [];
  const hasFilters = Boolean(
    filters.search || filters.category || filters.deadline || filters.goal,
  );

  return (
    <main className="flex-1 bg-canvas">
      <section className="border-b border-border-subtle bg-flow-950 px-4 py-12 text-white sm:px-6 sm:py-16">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-xs font-bold tracking-[0.14em] text-flow-300 uppercase">
            Fund ideas that matter
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
            Explore active campaigns
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-flow-100">
            Discover approved community projects that are still accepting
            support, compare their progress, and choose where your credits can
            make an impact.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 lg:py-14">
        <div className="rounded-2xl border border-border-subtle bg-surface p-4 shadow-[0_10px_35px_rgba(6,47,53,0.05)] sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-ink-strong">
            <SlidersHorizontal
              aria-hidden="true"
              className="size-5 text-flow-600"
            />
            Search and filters
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <form onSubmit={submitSearch} className="flex gap-2 md:col-span-2">
              <label className="relative flex-1">
                <span className="sr-only">
                  Search by campaign title or creator
                </span>
                <Search
                  aria-hidden="true"
                  className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-subtle"
                />
                <input
                  key={filters.search ?? ""}
                  name="search"
                  type="search"
                  defaultValue={filters.search}
                  maxLength={100}
                  placeholder="Search title or creator"
                  className="h-11 w-full rounded-[10px] border border-border bg-white pr-3 pl-10 text-sm text-ink-strong outline-none focus:border-flow-600 focus:ring-4 focus:ring-flow-100"
                />
              </label>
              <Button type="submit" size="sm">
                Search
              </Button>
            </form>

            <label>
              <span className="sr-only">Category</span>
              <select
                value={filters.category ?? ""}
                onChange={(event) =>
                  updateParameters({
                    category: event.target.value || undefined,
                  })
                }
                className="h-11 w-full rounded-[10px] border border-border bg-white px-3 text-sm text-ink-strong outline-none focus:border-flow-600 focus:ring-4 focus:ring-flow-100"
              >
                <option value="">All categories</option>
                {campaignCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Deadline</span>
              <select
                value={filters.deadline ?? ""}
                onChange={(event) =>
                  updateParameters({
                    deadline: event.target.value || undefined,
                  })
                }
                className="h-11 w-full rounded-[10px] border border-border bg-white px-3 text-sm text-ink-strong outline-none focus:border-flow-600 focus:ring-4 focus:ring-flow-100"
              >
                <option value="">Any deadline</option>
                <option value="7d">Ending in 7 days</option>
                <option value="30d">Ending in 30 days</option>
                <option value="90d">Ending in 90 days</option>
              </select>
            </label>

            <label>
              <span className="sr-only">Funding goal</span>
              <select
                value={filters.goal ?? ""}
                onChange={(event) =>
                  updateParameters({ goal: event.target.value || undefined })
                }
                className="h-11 w-full rounded-[10px] border border-border bg-white px-3 text-sm text-ink-strong outline-none focus:border-flow-600 focus:ring-4 focus:ring-flow-100"
              >
                <option value="">Any funding goal</option>
                <option value="under-1000">Under 1,000 credits</option>
                <option value="1000-5000">1,000–5,000 credits</option>
                <option value="over-5000">Over 5,000 credits</option>
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-col justify-between gap-3 border-t border-border-subtle pt-4 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
              Sort by
              <select
                value={filters.sort}
                onChange={(event) =>
                  updateParameters({ sort: event.target.value })
                }
                className="h-10 rounded-[10px] border border-border bg-white px-3 text-sm text-ink-strong outline-none focus:border-flow-600 focus:ring-4 focus:ring-flow-100"
              >
                <option value="newest">Newest</option>
                <option value="deadline">Deadline</option>
                <option value="highest-funded">Highest funded</option>
                <option value="progress">Progress</option>
              </select>
            </label>
            {hasFilters ? (
              <button
                type="button"
                onClick={() =>
                  startTransition(() => router.replace("/campaigns"))
                }
                className="self-start text-sm font-semibold text-flow-700 hover:text-flow-900 sm:self-auto"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink-strong">
              Campaigns
            </h2>
            {pagination ? (
              <p className="mt-1 text-sm text-ink-muted">
                {pagination.total.toLocaleString()} active campaign
                {pagination.total === 1 ? "" : "s"} found
              </p>
            ) : null}
          </div>
          {isNavigating || campaignQuery.isFetching ? (
            <span className="text-sm text-ink-muted" role="status">
              Updating results…
            </span>
          ) : null}
        </div>

        <div className="mt-5">
          {campaignQuery.isLoading ? (
            <CampaignGridSkeleton />
          ) : campaignQuery.isError ? (
            <EmptyState
              icon={CircleAlert}
              title="Campaigns could not be loaded"
              description={
                campaignQuery.error instanceof Error
                  ? campaignQuery.error.message
                  : "FundFlow could not reach the campaign service."
              }
              action={
                <Button onClick={() => void campaignQuery.refetch()}>
                  Try again
                </Button>
              }
            />
          ) : campaigns.length === 0 ? (
            <EmptyState
              icon={hasFilters ? Search : Sparkles}
              title={
                hasFilters
                  ? "No campaigns match these filters"
                  : "Approved campaigns are on their way"
              }
              description={
                hasFilters
                  ? "Try a broader search, another category, or a wider deadline and funding range."
                  : "New approved campaigns will appear here while they are accepting support."
              }
              action={
                hasFilters ? (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      startTransition(() => router.replace("/campaigns"))
                    }
                  >
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign._id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>

        {pagination && pagination.totalPages > 1 ? (
          <nav
            aria-label="Campaign pages"
            className="mt-8 flex items-center justify-between gap-4 border-t border-border-subtle pt-6"
          >
            <p className="text-sm text-ink-muted">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={filters.page <= 1 || campaignQuery.isFetching}
                onClick={() =>
                  updateParameters(
                    { page: String(Math.max(1, filters.page - 1)) },
                    false,
                  )
                }
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={
                  filters.page >= pagination.totalPages ||
                  campaignQuery.isFetching
                }
                onClick={() =>
                  updateParameters({ page: String(filters.page + 1) }, false)
                }
              >
                Next
              </Button>
            </div>
          </nav>
        ) : null}
      </section>
    </main>
  );
}
