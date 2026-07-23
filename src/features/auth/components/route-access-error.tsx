"use client";

import { CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

interface RouteAccessErrorProps {
  retry: () => void;
}

export function RouteAccessError({ retry }: RouteAccessErrorProps) {
  return (
    <main className="flex min-h-[60vh] flex-1 items-center justify-center bg-canvas px-4 py-16">
      <section className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface p-7 text-center shadow-[0_16px_45px_rgba(6,47,53,0.08)]">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#FFF0F2] text-error">
          <CircleAlert aria-hidden="true" className="size-6" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold text-ink-strong">
          We could not verify your access
        </h1>
        <p className="mt-2 leading-7 text-ink-muted">
          Your session is available, but the FundFlow profile service could not
          confirm your dashboard access.
        </p>
        <Button className="mt-6" onClick={retry}>
          Try again
        </Button>
      </section>
    </main>
  );
}
