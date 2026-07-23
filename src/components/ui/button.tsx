import { LoaderCircle } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant =
  "primary" | "secondary" | "dark" | "accent" | "ghost" | "destructive";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-flow-600 text-white shadow-sm hover:bg-flow-700 active:bg-flow-800",
  secondary:
    "border border-border bg-white text-flow-700 hover:border-flow-600 hover:bg-flow-50",
  dark: "bg-flow-950 text-white hover:bg-flow-900",
  accent: "bg-coral-600 text-white hover:bg-coral-700",
  ghost: "bg-transparent text-ink hover:bg-flow-50 hover:text-flow-700",
  destructive: "bg-error text-white hover:bg-[#9F3340]",
};

const sizes = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "size-11 p-0",
} as const;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled,
      isLoading = false,
      leftIcon,
      loadingText,
      size = "md",
      type = "button",
      variant = "primary",
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-[10px] font-semibold transition duration-200 ease-out hover:-translate-y-px disabled:pointer-events-none disabled:translate-y-0 disabled:bg-[#E3ECEB] disabled:text-[#9AAAAA] disabled:shadow-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : (
        leftIcon
      )}
      {isLoading && loadingText ? loadingText : children}
    </button>
  ),
);

Button.displayName = "Button";
