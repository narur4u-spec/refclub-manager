import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Calendar,
  ChevronDown,
  ClipboardCheck,
  FileText,
  Handshake,
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageSquare,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { useAppContext } from "../hooks/useAppContext";
import { useAuth } from "../hooks/useAuth";
import { useChapters } from "../hooks/useBackend";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/members", label: "Members", icon: Users },
  { to: "/meetings", label: "Meetings", icon: Calendar },
  { to: "/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/referrals", label: "Referrals", icon: Handshake },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/attendance-report", label: "Att. Report", icon: FileText },
  { to: "/messages", label: "Messages", icon: MessageSquare },
];

const CHAPTER_LABELS: Record<string, string> = {
  all: "All Chapters",
  downtown: "Downtown",
  techhub: "Tech Hub",
  westside: "Westside",
  "innovation-park": "Innovation Park",
  "business-bay": "Business Bay",
};

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const { isAuthenticated, login, logout, principalId } = useAuth();
  const { selectedChapter, setSelectedChapter } = useAppContext();
  const { data: chapters = [] } = useChapters();
  const location = useLocation();

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-card border-r border-border transition-smooth",
        collapsed ? "w-16" : "w-64",
      )}
      data-ocid="sidebar"
    >
      {/* App Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <Handshake className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-display font-bold text-sm text-foreground leading-tight">
              RefClub
            </p>
            <p className="text-xs text-muted-foreground leading-tight">
              Manager
            </p>
          </div>
        )}
      </div>

      {/* Chapter Filter */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Chapter
          </p>
          <div className="relative">
            <select
              className="w-full appearance-none bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-smooth cursor-pointer pr-8"
              value={selectedChapter}
              onChange={(e) =>
                setSelectedChapter(e.target.value as typeof selectedChapter)
              }
              data-ocid="chapter.select"
            >
              <option value="all">All Chapters</option>
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          {selectedChapter !== "all" && (
            <p className="text-xs text-primary mt-1 font-medium">
              {CHAPTER_LABELS[selectedChapter]}
            </p>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav
        className="flex-1 px-3 py-3 space-y-1 overflow-y-auto"
        data-ocid="sidebar.nav"
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const isActive =
            to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth group",
                collapsed && "justify-center",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              data-ocid={`nav.${label.toLowerCase()}.link`}
            >
              <Icon
                className={cn(
                  "w-5 h-5 shrink-0",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User / Auth */}
      <div className="px-3 py-3 border-t border-border">
        {isAuthenticated ? (
          <div className="space-y-1">
            {!collapsed && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">
                    {principalId ? `${principalId.slice(0, 8)}…` : "Admin"}
                  </p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={logout}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth",
                collapsed && "justify-center",
              )}
              data-ocid="sidebar.logout_button"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={login}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-smooth",
              collapsed && "justify-center",
            )}
            data-ocid="sidebar.login_button"
          >
            <LogIn className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign In</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
