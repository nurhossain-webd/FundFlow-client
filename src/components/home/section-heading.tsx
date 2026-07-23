import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  centered?: boolean;
  className?: string;
}

export function SectionHeading({
  action,
  centered = false,
  className,
  description,
  eyebrow,
  title,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-9 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between",
        centered && "mx-auto max-w-3xl text-center md:block",
        className,
      )}
    >
      <div className="max-w-2xl">
        <p className="text-xs font-bold tracking-[0.16em] text-flow-700 uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-3xl leading-tight font-bold tracking-[-0.035em] text-ink-strong sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-base leading-7 text-ink-muted">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
