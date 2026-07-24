"use client";

import { X } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  type PropsWithChildren,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

import { Button } from "./button";

interface ModalProps extends PropsWithChildren {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  footer?: ReactNode;
  className?: string;
}

export function Modal({
  children,
  className,
  description,
  footer,
  isOpen,
  onClose,
  title,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className={cn(
        "m-auto max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-lg flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface p-0 text-ink shadow-[0_24px_80px_rgba(6,47,53,0.24)] backdrop:bg-[rgba(6,47,53,0.56)] open:flex sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100%-2rem)] sm:rounded-3xl",
        className,
      )}
    >
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border-subtle px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
        <div className="min-w-0">
          <h2
            id={titleId}
            className="font-display text-xl font-bold text-ink-strong"
          >
            {title}
          </h2>
          {description ? (
            <p
              id={descriptionId}
              className="mt-1 text-sm leading-6 text-ink-muted"
            >
              {description}
            </p>
          ) : null}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close dialog"
          className="-mr-2 -mt-2"
        >
          <X aria-hidden="true" className="size-5" />
        </Button>
      </div>
      <div className="min-h-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
        {children}
      </div>
      {footer ? (
        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-border-subtle px-4 py-4 [&>button]:w-full sm:flex-row sm:flex-wrap sm:justify-end sm:px-6 sm:[&>button]:w-auto">
          {footer}
        </div>
      ) : null}
    </dialog>
  );
}
