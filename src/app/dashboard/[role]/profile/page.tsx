"use client";

import { format } from "date-fns";
import { Coins, Mail, ShieldCheck, TrendingUp, UserRound } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentProfile } from "@/features/auth/hooks/use-current-profile";
import { useAuth } from "@/providers/auth-provider";

const roleLabels = {
  supporter: "Supporter",
  creator: "Creator",
  admin: "Admin",
} as const;

export default function DashboardProfilePage() {
  const { user } = useAuth();
  const { data: profile } = useCurrentProfile();

  if (!profile) {
    return null;
  }

  const profileImage = profile.photoURL ?? user?.image;

  return (
    <div className="space-y-7">
      <header>
        <p className="text-xs font-bold tracking-[0.14em] text-flow-700 uppercase">
          Account
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.035em] text-ink-strong sm:text-4xl">
          Your profile
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-ink-muted">
          Review the verified identity, role, and platform balances connected to
          your FundFlow account.
        </p>
      </header>

      <Card className="overflow-hidden p-0">
        <div className="h-28 bg-[linear-gradient(120deg,#063B42,#08717A,#68D8D1)] sm:h-36" />
        <div className="px-5 pb-6 sm:px-7">
          <Avatar
            name={profile.displayName}
            src={profileImage}
            size={104}
            className="-mt-13 border-4 border-white text-2xl shadow-lg"
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink-strong">
                {profile.displayName}
              </h2>
              <p className="mt-1 text-ink-muted">{profile.email}</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-flow-100 px-3 py-1.5 text-sm font-bold text-flow-800">
              <ShieldCheck aria-hidden="true" className="size-4" />
              {roleLabels[profile.role]}
            </span>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-border-subtle">
              <Detail
                icon={UserRound}
                label="Display name"
                value={profile.displayName}
              />
              <Detail icon={Mail} label="Email address" value={profile.email} />
              <Detail
                icon={ShieldCheck}
                label="Platform role"
                value={roleLabels[profile.role]}
              />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform account</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-border-subtle">
              <Detail
                icon={Coins}
                label="Available credits"
                value={profile.credits.toLocaleString()}
              />
              <Detail
                icon={TrendingUp}
                label="Raised credits"
                value={profile.raisedCredits.toLocaleString()}
              />
              <Detail
                icon={ShieldCheck}
                label="Member since"
                value={format(new Date(profile.createdAt), "MMMM d, yyyy")}
              />
            </dl>
          </CardContent>
        </Card>
      </div>

      <p className="rounded-xl border border-flow-200 bg-flow-50 px-4 py-3 text-sm leading-6 text-flow-900">
        Your role and balances are managed by the FundFlow server and cannot be
        changed from browser-provided data.
      </p>
    </div>
  );
}

interface DetailProps {
  icon: typeof UserRound;
  label: string;
  value: string;
}

function Detail({ icon: Icon, label, value }: DetailProps) {
  return (
    <div className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-flow-50 text-flow-700">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-semibold tracking-wide text-ink-subtle uppercase">
          {label}
        </dt>
        <dd className="mt-0.5 truncate font-semibold text-ink-strong">
          {value}
        </dd>
      </div>
    </div>
  );
}
