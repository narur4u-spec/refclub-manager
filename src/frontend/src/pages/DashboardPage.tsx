import { Link } from "@tanstack/react-router";
import {
  Award,
  Calendar,
  Handshake,
  MessageSquare,
  Network,
  Plus,
  Send,
  TrendingUp,
  Users,
} from "lucide-react";
import { ErrorState } from "../components/EmptyState";
import { Layout } from "../components/Layout";
import { PageLoader } from "../components/LoadingSpinner";
import { InfoCard, StatsCard } from "../components/StatsCard";
import { useDashboardStats } from "../hooks/useBackend";

const QUICK_ACTIONS = [
  {
    label: "Add Member",
    description: "Register a new club member",
    href: "/members",
    icon: <Users className="w-6 h-6 text-primary" />,
    ocid: "dashboard.quick_action.members",
    accent: "bg-primary/8 border-primary/20 hover:bg-primary/14",
  },
  {
    label: "Schedule Meeting",
    description: "Create a chapter meeting",
    href: "/meetings",
    icon: <Calendar className="w-6 h-6 text-accent" />,
    ocid: "dashboard.quick_action.meetings",
    accent: "bg-accent/8 border-accent/20 hover:bg-accent/14",
  },
  {
    label: "Log Referral",
    description: "Record a business referral",
    href: "/referrals",
    icon: <Handshake className="w-6 h-6 text-primary" />,
    ocid: "dashboard.quick_action.referrals",
    accent: "bg-primary/8 border-primary/20 hover:bg-primary/14",
  },
  {
    label: "Send Message",
    description: "Broadcast to all members",
    href: "/messages",
    icon: <Send className="w-6 h-6 text-accent" />,
    ocid: "dashboard.quick_action.messages",
    accent: "bg-accent/8 border-accent/20 hover:bg-accent/14",
  },
];

const RECENT_ACTIVITY = [
  {
    icon: <Handshake className="w-3.5 h-3.5" />,
    text: "Sarah Mitchell gave a referral to Alex Chen (Downtown)",
    time: "2h ago",
    color: "bg-accent/15 text-accent",
  },
  {
    icon: <Calendar className="w-3.5 h-3.5" />,
    text: "Tech Hub chapter meeting — 18/22 members attended",
    time: "1d ago",
    color: "bg-primary/15 text-primary",
  },
  {
    icon: <MessageSquare className="w-3.5 h-3.5" />,
    text: "Monthly newsletter sent to all 200 members",
    time: "2d ago",
    color: "bg-muted text-muted-foreground",
  },
  {
    icon: <TrendingUp className="w-3.5 h-3.5" />,
    text: "Raj Patel converted referral from Emily Ross — £3,200 deal",
    time: "3d ago",
    color: "bg-accent/15 text-accent",
  },
  {
    icon: <Users className="w-3.5 h-3.5" />,
    text: "New member James Thornton joined Innovation Park chapter",
    time: "4d ago",
    color: "bg-primary/15 text-primary",
  },
];

const TOP_REFERRERS = [
  { name: "Sarah Mitchell", chapter: "Downtown", count: 14 },
  { name: "Alex Chen", chapter: "Tech Hub", count: 12 },
  { name: "Priya Sharma", chapter: "Westside", count: 11 },
  { name: "Marcus Williams", chapter: "Business Bay", count: 9 },
  { name: "Emily Ross", chapter: "Innovation Park", count: 8 },
];

export default function DashboardPage() {
  const { data: stats, isLoading, isError } = useDashboardStats();

  if (isLoading) {
    return (
      <Layout title="Dashboard">
        <PageLoader />
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout title="Dashboard">
        <ErrorState message="Failed to load dashboard stats. Please refresh." />
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="space-y-6" data-ocid="dashboard.page">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border elevation-base px-6 py-5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-accent/6 pointer-events-none" />
          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
                <Network className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-foreground leading-tight">
                  BizConnect Referral Club
                </h2>
                <p className="text-sm text-muted-foreground">
                  5 active chapters · {stats?.totalMembers ?? 200} members
                </p>
              </div>
            </div>
            <Link
              to="/members"
              data-ocid="dashboard.add_member_banner_button"
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-smooth"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </Link>
          </div>
        </div>

        {/* Stats Grid — 5 required stats */}
        <div
          className="grid grid-cols-2 lg:grid-cols-5 gap-4"
          data-ocid="dashboard.stats.section"
        >
          <StatsCard
            label="Total Members"
            value={stats?.totalMembers ?? 0}
            icon={<Users className="w-5 h-5 text-primary" />}
            trend={{ value: 4, label: "this month" }}
          />
          <StatsCard
            label="Active Chapters"
            value={5}
            icon={<Network className="w-5 h-5 text-accent" />}
          />
          <StatsCard
            label="Total Meetings"
            value={stats?.totalMeetings ?? 0}
            icon={<Calendar className="w-5 h-5 text-primary" />}
            trend={{ value: 6, label: "this quarter" }}
          />
          <StatsCard
            label="Total Referrals"
            value={stats?.totalReferrals ?? 0}
            icon={<Handshake className="w-5 h-5 text-accent" />}
            trend={{ value: 12, label: "this quarter" }}
          />
          <StatsCard
            label="Messages Sent"
            value={stats?.messagesSent ?? 0}
            icon={<MessageSquare className="w-5 h-5 text-primary" />}
            trend={{ value: 5, label: "this month" }}
          />
        </div>

        {/* Quick Actions */}
        <div data-ocid="dashboard.quick_actions.section">
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.href}
                to={action.href}
                data-ocid={action.ocid}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-smooth ${action.accent}`}
              >
                <div className="w-10 h-10 rounded-lg bg-card/70 flex items-center justify-center shrink-0">
                  {action.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-sm text-foreground">
                    {action.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Lower row: Recent Activity + Top Referrers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <InfoCard
              title="Recent Activity"
              data-ocid="dashboard.activity.section"
            >
              <div className="space-y-3">
                {RECENT_ACTIVITY.map((item, i) => (
                  <div
                    key={item.text}
                    className="flex items-start gap-3 pb-3 border-b border-border/50 last:border-0 last:pb-0"
                    data-ocid={`dashboard.activity.item.${i + 1}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${item.color}`}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">
                        {item.text}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </InfoCard>
          </div>

          {/* Top Referrers */}
          <div>
            <InfoCard
              title="Top Referrers"
              actions={<Award className="w-4 h-4 text-accent" />}
            >
              <div className="space-y-3">
                {TOP_REFERRERS.map((person, i) => (
                  <div
                    key={person.name}
                    className="flex items-center gap-3"
                    data-ocid={`dashboard.referrer.item.${i + 1}`}
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {person.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {person.chapter}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-accent">
                        {person.count}
                      </p>
                      <p className="text-xs text-muted-foreground">refs</p>
                    </div>
                  </div>
                ))}
              </div>
            </InfoCard>
          </div>
        </div>
      </div>
    </Layout>
  );
}
