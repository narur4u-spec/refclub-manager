import { cn } from "@/lib/utils";
import type { MemberBadge } from "../types";

type BadgeVariant =
  | "default"
  | "primary"
  | "accent"
  | "success"
  | "warning"
  | "destructive"
  | "outline"
  | "muted";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: "bg-primary/15 text-primary border-primary/25",
  primary: "bg-primary text-primary-foreground border-primary",
  accent: "bg-accent/20 text-accent-foreground border-accent/30",
  success:
    "bg-green-500/15 text-green-700 border-green-500/25 dark:text-green-400",
  warning:
    "bg-amber-400/15 text-amber-700 border-amber-400/25 dark:text-amber-400",
  destructive: "bg-destructive/15 text-destructive border-destructive/25",
  outline: "bg-transparent text-foreground border-border",
  muted: "bg-muted text-muted-foreground border-border",
};

const MEMBER_BADGE_MAP: Record<
  MemberBadge,
  { label: string; variant: BadgeVariant }
> = {
  "active-giver": { label: "Active Giver", variant: "success" },
  "top-performer": { label: "Top Performer", variant: "accent" },
  "rising-star": { label: "Rising Star", variant: "default" },
  connector: { label: "Connector", variant: "primary" },
  ambassador: { label: "Ambassador", variant: "warning" },
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function AppBadge({
  variant = "default",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function MemberBadgeChip({ badge }: { badge: MemberBadge }) {
  const { label, variant } = MEMBER_BADGE_MAP[badge];
  return <AppBadge variant={variant}>{label}</AppBadge>;
}
