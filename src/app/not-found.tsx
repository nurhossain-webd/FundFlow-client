import { SearchX } from "lucide-react";
import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center py-16">
      <PageContainer size="reading">
        <Card className="text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-flow-100 text-flow-700">
            <SearchX aria-hidden="true" className="size-6" />
          </span>
          <p className="mt-5 text-sm font-semibold text-flow-700">Error 404</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink-strong">
            This page has not found its flow
          </h1>
          <p className="mx-auto mt-3 max-w-md text-ink-muted">
            The link may be outdated, or the page may have moved somewhere else.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex h-11 items-center justify-center rounded-[10px] bg-flow-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px hover:bg-flow-800"
          >
            Return home
          </Link>
        </Card>
      </PageContainer>
    </main>
  );
}
