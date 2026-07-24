import { Inbox, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

export function EmptyState({
  action,
  description,
  icon: Icon = Inbox,
  title,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-52 w-full min-w-0 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-4 py-8 text-center sm:min-h-64 sm:px-6 sm:py-10">
      <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-flow-100 text-flow-700">
        <Icon aria-hidden="true" className="size-6" />
      </span>
      <h2 className="font-display text-lg font-bold text-ink-strong">
        {title}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">
        {description}
      </p>
      {action ? (
        <div className="mt-6 w-full max-w-xs [&>button]:w-full sm:w-auto sm:max-w-none sm:[&>button]:w-auto">
          {action}
        </div>
      ) : null}
    </div>
  );
}
