import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { value: number; label: string };
  className?: string;
}

export function StatsCard({
  label,
  value,
  icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl p-5 elevation-subtle",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className="font-display font-bold text-2xl text-foreground leading-none">
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                "text-xs mt-1.5",
                trend.value >= 0 ? "text-accent" : "text-destructive",
              )}
            >
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%{" "}
              {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

interface InfoCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export function InfoCard({
  title,
  children,
  className,
  actions,
}: InfoCardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl elevation-subtle",
        className,
      )}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          {title && (
            <h3 className="font-display font-semibold text-sm text-foreground">
              {title}
            </h3>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
