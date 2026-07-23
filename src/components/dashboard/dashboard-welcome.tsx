import type { LucideIcon } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";

interface DashboardWelcomeProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export function DashboardWelcome({
  description,
  eyebrow,
  icon: Icon,
  title,
}: DashboardWelcomeProps) {
  return (
    <main className="flex-1 bg-canvas py-10 sm:py-14">
      <PageContainer>
        <section className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-[0_14px_45px_rgba(6,47,53,0.06)] sm:p-9">
          <span className="flex size-12 items-center justify-center rounded-xl bg-flow-100 text-flow-700">
            <Icon aria-hidden="true" className="size-6" />
          </span>
          <p className="mt-6 text-xs font-bold tracking-[0.14em] text-flow-700 uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.035em] text-ink-strong sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-ink-muted">
            {description}
          </p>
        </section>
      </PageContainer>
    </main>
  );
}
