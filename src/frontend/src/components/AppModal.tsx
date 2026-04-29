import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import React, { useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const sizeClasses: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
      data-ocid="modal"
    >
      <dialog
        ref={ref}
        className={cn(
          "relative bg-card rounded-xl border border-border shadow-lg w-full elevation-base m-0 p-0",
          sizeClasses[size],
        )}
        open
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {(title ?? description) && (
          <div className="px-6 pt-5 pb-4 border-b border-border">
            {title && (
              <h2
                id="modal-title"
                className="font-display font-semibold text-base text-foreground"
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-smooth"
          aria-label="Close"
          data-ocid="modal.close_button"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="px-6 pb-5 flex items-center justify-end gap-3 border-t border-border pt-4">
            {footer}
          </div>
        )}
      </dialog>
    </div>
  );
}
