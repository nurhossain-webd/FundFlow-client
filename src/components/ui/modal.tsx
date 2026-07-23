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
        "m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl border border-border-subtle bg-surface p-0 text-ink shadow-[0_24px_80px_rgba(6,47,53,0.24)] backdrop:bg-[rgba(6,47,53,0.56)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-6 py-5">
        <div>
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
      <div className="px-6 py-5">{children}</div>
      {footer ? (
        <div className="flex flex-wrap justify-end gap-3 border-t border-border-subtle px-6 py-4">
          {footer}
        </div>
      ) : null}
    </dialog>
  );
}
