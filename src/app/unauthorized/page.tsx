import { ShieldX } from "lucide-react";
import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-[60vh] flex-1 items-center bg-canvas py-16">
      <PageContainer size="reading">
        <section className="rounded-3xl border border-border-subtle bg-surface p-7 text-center shadow-[0_18px_55px_rgba(6,47,53,0.08)] sm:p-10">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#FFF0F2] text-error">
            <ShieldX aria-hidden="true" className="size-7" />
          </span>
          <p className="mt-6 text-xs font-bold tracking-[0.14em] text-error uppercase">
            Access denied
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.035em] text-ink-strong">
            You cannot open this dashboard
          </h1>
          <p className="mx-auto mt-3 max-w-lg leading-7 text-ink-muted">
            This route belongs to another FundFlow role, or your account cannot
            currently perform protected actions.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-[10px] bg-flow-600 px-5 font-semibold text-white transition hover:bg-flow-700"
            >
              Go to my dashboard
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-[10px] border border-border bg-white px-5 font-semibold text-flow-700 transition hover:bg-flow-50"
            >
              Return home
            </Link>
          </div>
        </section>
      </PageContainer>
    </main>
  );
}
