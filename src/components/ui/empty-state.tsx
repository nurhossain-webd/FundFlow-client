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
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-10 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-flow-100 text-flow-700">
        <Icon aria-hidden="true" className="size-6" />
      </span>
      <h2 className="font-display text-lg font-bold text-ink-strong">
        {title}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
