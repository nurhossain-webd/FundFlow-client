import { MoveUpRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  inverse?: boolean;
}

export function Logo({ className, inverse = false }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="FundFlow home"
      className={cn(
        "inline-flex items-center gap-2 rounded-lg font-display text-xl font-extrabold tracking-[-0.04em]",
        inverse ? "text-white" : "text-flow-950",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-[10px]",
          inverse ? "bg-white text-flow-800" : "bg-flow-700 text-white",
        )}
      >
        <MoveUpRight aria-hidden="true" className="size-4 stroke-[2.5]" />
      </span>
      <span>
        Fund
        <span className={inverse ? "text-flow-300" : "text-flow-600"}>
          Flow
        </span>
      </span>
    </Link>
  );
}
