import { cn } from "@/lib/utils";
import { AlertCircle, Inbox } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className,
      )}
      data-ocid="empty_state"
    >
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        {icon ?? <Inbox className="w-7 h-7 text-muted-foreground" />}
      </div>
      <h3 className="font-display font-semibold text-base text-foreground mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs mb-5">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

export function ErrorState({ message }: { message?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
      data-ocid="error_state"
    >
      <AlertCircle className="w-10 h-10 text-destructive mb-3" />
      <p className="text-sm text-muted-foreground">
        {message ?? "Something went wrong. Please try again."}
      </p>
    </div>
  );
}
