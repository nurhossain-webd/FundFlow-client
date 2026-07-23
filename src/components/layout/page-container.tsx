import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

interface PageContainerProps extends ComponentProps<"div"> {
  size?: "reading" | "default" | "wide";
}

const sizeClasses = {
  reading: "max-w-[760px]",
  default: "max-w-[1200px]",
  wide: "max-w-[1320px]",
} as const;

export function PageContainer({
  className,
  size = "default",
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
