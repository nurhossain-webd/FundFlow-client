import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div
      role="region"
      aria-label="Scrollable data table"
      tabIndex={0}
      className="block w-full max-w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-border-subtle bg-surface focus-visible:ring-4 focus-visible:ring-flow-100"
    >
      <table
        className={cn("w-full min-w-[640px] border-collapse", className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return (
    <thead className={cn("bg-canvas-muted text-left", className)} {...props} />
  );
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return (
    <tbody
      className={cn("divide-y divide-border-subtle", className)}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={cn("transition-colors hover:bg-flow-50/70", className)}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={cn(
        "h-12 px-4 text-xs font-semibold tracking-wide text-ink-muted",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return (
    <td className={cn("px-4 py-4 text-sm text-ink", className)} {...props} />
  );
}
