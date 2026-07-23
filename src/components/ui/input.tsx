import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailingElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      error,
      hint,
      id,
      label,
      leadingIcon,
      required,
      trailingElement,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const descriptionId = `${inputId}-description`;

    return (
      <div className="w-full">
        {label ? (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-semibold text-ink-strong"
          >
            {label}
            {required ? (
              <span className="ml-1 text-error" aria-hidden="true">
                *
              </span>
            ) : null}
          </label>
        ) : null}
        <div className="relative">
          {leadingIcon ? (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-muted">
              {leadingIcon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={error || hint ? descriptionId : undefined}
            className={cn(
              "h-12 w-full rounded-[10px] border border-border bg-white px-4 text-base text-ink-strong placeholder:text-ink-subtle transition focus:border-flow-600 focus:outline-none focus:ring-4 focus:ring-flow-200/70 disabled:cursor-not-allowed disabled:bg-canvas-muted disabled:text-disabled",
              Boolean(leadingIcon) && "pl-10",
              Boolean(trailingElement) && "pr-11",
              error &&
                "border-error focus:border-error focus:ring-[#F1B6BE]/60",
              className,
            )}
            {...props}
          />
          {trailingElement ? (
            <span className="absolute inset-y-0 right-2 flex items-center">
              {trailingElement}
            </span>
          ) : null}
        </div>
        {error || hint ? (
          <p
            id={descriptionId}
            className={cn(
              "mt-2 text-sm",
              error ? "text-error" : "text-ink-muted",
            )}
            role={error ? "alert" : undefined}
          >
            {error ?? hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
