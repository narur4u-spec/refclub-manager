import { cn } from "@/lib/utils";
import { Bell, Menu, X } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
}

export function Layout({ children, title, actions }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setMobileOpen(false)}
            role="button"
            tabIndex={0}
            aria-label="Close menu"
          />
          <div className="relative z-10 flex">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-4 lg:px-6 py-4 bg-card border-b border-border shrink-0 elevation-subtle">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-smooth"
            aria-label="Open menu"
            data-ocid="header.mobile_menu_button"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="flex-1 min-w-0">
            {title && (
              <h1 className="font-display font-bold text-lg text-foreground truncate">
                {title}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            {actions}
            <button
              type="button"
              className="relative p-2 rounded-lg hover:bg-muted transition-smooth"
              aria-label="Notifications"
              data-ocid="header.notifications_button"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main
          className={cn("flex-1 overflow-y-auto px-4 lg:px-6 py-6")}
          data-ocid="main.content"
        >
          {children}
        </main>

        {/* Footer */}
        <footer className="shrink-0 px-6 py-3 bg-muted/40 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
