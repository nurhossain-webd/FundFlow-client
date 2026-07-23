import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type BadgeVariant =
  "neutral" | "brand" | "success" | "warning" | "error" | "info";

interface BadgeProps extends ComponentProps<"span"> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  neutral: "border-border bg-canvas-muted text-ink",
  brand: "border-flow-200 bg-flow-100 text-flow-800",
  success: "border-[#A9DFC7] bg-[#EAF8F1] text-[#167451]",
  warning: "border-[#EDD48A] bg-[#FFF8E5] text-[#9A6508]",
  error: "border-[#F1B6BE] bg-[#FFF0F2] text-error",
  info: "border-[#B8D7F2] bg-[#EDF6FF] text-[#2867A2]",
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
