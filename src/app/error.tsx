"use client";

import { AlertTriangle } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 items-center py-16">
      <PageContainer size="reading">
        <Card className="text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#FFF0F2] text-error">
            <AlertTriangle aria-hidden="true" className="size-6" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold text-ink-strong">
            Something interrupted the flow
          </h1>
          <p className="mx-auto mt-2 max-w-md text-ink-muted">
            We could not load this part of FundFlow. Try the request again.
          </p>
          {error.digest ? (
            <p className="mt-3 text-xs text-ink-subtle">
              Reference: {error.digest}
            </p>
          ) : null}
          <Button onClick={reset} className="mt-6">
            Try again
          </Button>
        </Card>
      </PageContainer>
    </main>
  );
}
