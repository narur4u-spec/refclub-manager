import { Handshake, MessageSquare, TrendingUp, Users } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const FEATURES = [
  {
    icon: Users,
    title: "Member Directory",
    description:
      "200 members across 5 chapters. Track profiles, industries, and engagement.",
  },
  {
    icon: TrendingUp,
    title: "Referral Tracking",
    description:
      "Log and monitor every business referral from submission to conversion.",
  },
  {
    icon: MessageSquare,
    title: "Chapter Messaging",
    description:
      "Send announcements to individual chapters or broadcast to all members.",
  },
];

export default function LoginPage() {
  const { login, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Branding Panel */}
      <div className="lg:w-1/2 bg-primary flex flex-col justify-between p-10 lg:p-16 min-h-64">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
            <Handshake className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="font-display font-bold text-xl text-primary-foreground leading-tight">
              RefClub
            </p>
            <p className="text-xs text-primary-foreground/70">Manager</p>
          </div>
        </div>

        <div className="mt-12 lg:mt-0">
          <h1 className="font-display font-bold text-3xl lg:text-4xl text-primary-foreground leading-tight mb-4">
            Where Business
            <br />
            Relationships Grow
          </h1>
          <p className="text-primary-foreground/80 text-base leading-relaxed max-w-sm">
            Manage your referral club's members, meetings, attendance, and
            business introductions — all in one place.
          </p>

          <div className="mt-8 space-y-4">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-foreground/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary-foreground">
                    {title}
                  </p>
                  <p className="text-xs text-primary-foreground/70 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-primary-foreground/50 mt-12 lg:mt-0">
          5 Active Chapters · 200 Members · Secure on Internet Computer
        </p>
      </div>

      {/* Login Panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-10 lg:p-16">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">
              Sign in to your account
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              RefClub Manager uses Internet Identity for secure, passwordless
              authentication. Your identity is private and decentralized.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 elevation-subtle space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                <Handshake className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  RefClub Manager
                </p>
                <p className="text-xs text-muted-foreground">
                  Business Referral Club Platform
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={login}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-60 transition-smooth"
              data-ocid="login.primary_button"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <Handshake className="w-4 h-4" />
                  Sign in with Internet Identity
                </>
              )}
            </button>

            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              No password needed. Your identity is secured by Internet Identity
              — a decentralized authentication system.
            </p>
          </div>

          <p className="mt-6 text-xs text-muted-foreground text-center">
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
        </div>
      </div>
    </div>
  );
}
