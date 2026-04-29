import { useActor } from "@caffeineai/core-infrastructure";
import { Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { createActor } from "../backend";
import { EmptyState } from "../components/EmptyState";
import { Layout } from "../components/Layout";
import { PageLoader } from "../components/LoadingSpinner";
import { useChapters, useLeaderboard } from "../hooks/useBackend";
import type { LeaderboardEntry } from "../types";

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEED_LEADERBOARD: LeaderboardEntry[] = [
  {
    memberId: "m1",
    memberName: "Sarah Mitchell",
    businessName: "Mitchell & Partners PR",
    chapterId: "downtown",
    referralCount: 14,
  },
  {
    memberId: "m2",
    memberName: "Alex Chen",
    businessName: "Chen Technology Group",
    chapterId: "techhub",
    referralCount: 12,
  },
  {
    memberId: "m3",
    memberName: "Priya Sharma",
    businessName: "Sharma Legal Advisory",
    chapterId: "westside",
    referralCount: 11,
  },
  {
    memberId: "m4",
    memberName: "Marcus Williams",
    businessName: "Williams Wealth Management",
    chapterId: "business-bay",
    referralCount: 9,
  },
  {
    memberId: "m5",
    memberName: "Emily Ross",
    businessName: "Ross Interior Design",
    chapterId: "innovation-park",
    referralCount: 8,
  },
  {
    memberId: "m6",
    memberName: "James Thornton",
    businessName: "Thornton Consulting",
    chapterId: "downtown",
    referralCount: 7,
  },
  {
    memberId: "m7",
    memberName: "Aisha Patel",
    businessName: "Patel Digital Marketing",
    chapterId: "techhub",
    referralCount: 7,
  },
  {
    memberId: "m8",
    memberName: "Raj Kumar",
    businessName: "Kumar Construction Ltd",
    chapterId: "westside",
    referralCount: 6,
  },
  {
    memberId: "m9",
    memberName: "Natalie Brooks",
    businessName: "Brooks Recruitment",
    chapterId: "business-bay",
    referralCount: 5,
  },
  {
    memberId: "m10",
    memberName: "Daniel Osei",
    businessName: "Osei Accounting Services",
    chapterId: "innovation-park",
    referralCount: 4,
  },
];

const CHAPTER_NAMES: Record<string, string> = {
  downtown: "Downtown",
  techhub: "Tech Hub",
  westside: "Westside",
  "innovation-park": "Innovation Park",
  "business-bay": "Business Bay",
};

// ── Medal helpers ─────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span
        role="img"
        aria-label="Gold medal"
        className="text-xl leading-none"
        title="1st place"
      >
        🥇
      </span>
    );
  if (rank === 2)
    return (
      <span
        role="img"
        aria-label="Silver medal"
        className="text-xl leading-none"
        title="2nd place"
      >
        🥈
      </span>
    );
  if (rank === 3)
    return (
      <span
        role="img"
        aria-label="Bronze medal"
        className="text-xl leading-none"
        title="3rd place"
      >
        🥉
      </span>
    );
  return (
    <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
      {rank}
    </span>
  );
}

// ── Chapter tabs ──────────────────────────────────────────────────────────────

interface Chapter {
  id: string;
  name: string;
}

interface ChapterTabsProps {
  chapters: Chapter[];
  selected: string | undefined;
  onSelect: (id: string | undefined) => void;
}

function ChapterTabs({ chapters, selected, onSelect }: ChapterTabsProps) {
  const tabs = [{ id: undefined, name: "All Chapters" }, ...chapters];
  return (
    <div
      className="flex items-center gap-1 flex-wrap"
      role="tablist"
      aria-label="Filter by chapter"
      data-ocid="leaderboard.chapter_filter"
    >
      {tabs.map((tab) => {
        const isActive = selected === tab.id;
        return (
          <button
            key={tab.id ?? "all"}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(tab.id)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-smooth ${
              isActive
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
            }`}
            data-ocid={`leaderboard.tab.${tab.id ?? "all"}`}
          >
            {tab.name}
          </button>
        );
      })}
    </div>
  );
}

// ── Leaderboard table row ─────────────────────────────────────────────────────

interface RowProps {
  entry: LeaderboardEntry;
  rank: number;
  index: number;
}

function LeaderboardRow({ entry, rank, index }: RowProps) {
  const isTop3 = rank <= 3;
  const chapterName = CHAPTER_NAMES[entry.chapterId] ?? entry.chapterId;

  return (
    <tr
      className={`border-b border-border/60 last:border-0 transition-colors hover:bg-muted/40 ${
        isTop3 ? "bg-accent/4" : ""
      }`}
      data-ocid={`leaderboard.item.${index + 1}`}
    >
      {/* Rank */}
      <td className="py-3.5 pl-4 pr-3 w-16">
        <div className="flex items-center justify-center">
          <RankBadge rank={rank} />
        </div>
      </td>

      {/* Member Name */}
      <td className="py-3.5 px-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              isTop3 ? "bg-accent/20 text-accent" : "bg-primary/12 text-primary"
            }`}
          >
            {entry.memberName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <span className="font-semibold text-sm text-foreground leading-tight">
            {entry.memberName}
          </span>
        </div>
      </td>

      {/* Business Name */}
      <td className="py-3.5 px-3 hidden sm:table-cell">
        <span className="text-sm text-muted-foreground">
          {entry.businessName}
        </span>
      </td>

      {/* Chapter */}
      <td className="py-3.5 px-3 hidden md:table-cell">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
          {chapterName}
        </span>
      </td>

      {/* Referrals */}
      <td className="py-3.5 pl-3 pr-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <span
            className={`text-lg font-bold tabular-nums ${
              isTop3 ? "text-accent" : "text-foreground"
            }`}
          >
            {Number(entry.referralCount)}
          </span>
          <span className="text-xs text-muted-foreground">given</span>
        </div>
      </td>
    </tr>
  );
}

// ── Top 3 podium cards ────────────────────────────────────────────────────────

interface PodiumProps {
  entries: LeaderboardEntry[];
}

function TopPodium({ entries }: PodiumProps) {
  if (entries.length === 0) return null;

  const top3 = entries.slice(0, 3);
  // Reorder for visual podium: 2nd, 1st, 3rd
  const podiumOrder =
    top3.length >= 3
      ? [top3[1], top3[0], top3[2]]
      : top3.length === 2
        ? [top3[1], top3[0]]
        : [top3[0]];

  const heights = ["h-20", "h-28", "h-16"];

  return (
    <div className="flex items-end justify-center gap-3 mb-8 px-4">
      {podiumOrder.map((entry, i) => {
        const originalRank =
          top3.length >= 3 ? [2, 1, 3][i] : top3.length === 2 ? [2, 1][i] : 1;
        const isFirst = originalRank === 1;
        const chapterName = CHAPTER_NAMES[entry.chapterId] ?? entry.chapterId;

        return (
          <div
            key={entry.memberId}
            className={`flex flex-col items-center gap-2 flex-1 max-w-[160px] ${
              isFirst ? "scale-105" : ""
            }`}
            data-ocid={`leaderboard.podium.${originalRank}`}
          >
            {/* Avatar */}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold border-2 ${
                isFirst
                  ? "bg-accent/20 border-accent text-accent"
                  : "bg-primary/12 border-primary/30 text-primary"
              }`}
            >
              {entry.memberName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            {/* Medal */}
            <span className="text-2xl">
              {originalRank === 1 ? "🥇" : originalRank === 2 ? "🥈" : "🥉"}
            </span>

            {/* Name + count */}
            <div className="text-center min-w-0 w-full">
              <p className="text-xs font-semibold text-foreground truncate">
                {entry.memberName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {chapterName}
              </p>
              <p
                className={`text-base font-bold mt-0.5 ${isFirst ? "text-accent" : "text-foreground"}`}
              >
                {Number(entry.referralCount)}
              </p>
            </div>

            {/* Podium base */}
            <div
              className={`w-full rounded-t-md ${heights[i]} ${
                isFirst
                  ? "bg-accent/15 border border-accent/30"
                  : "bg-primary/8 border border-primary/20"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const { actor } = useActor(createActor);
  const [selectedChapterId, setSelectedChapterId] = useState<
    string | undefined
  >(undefined);

  const { data: chapters = [] } = useChapters();
  const { data: backendData, isLoading } = useLeaderboard(selectedChapterId);

  // Sorted entries: descending referralCount, ties alphabetical by name
  const entries: LeaderboardEntry[] = useMemo(() => {
    const base: LeaderboardEntry[] = actor
      ? (backendData ?? [])
      : SEED_LEADERBOARD;

    const filtered = selectedChapterId
      ? base.filter((e) => e.chapterId === selectedChapterId)
      : base;

    return [...filtered].sort((a, b) => {
      const diff = Number(b.referralCount) - Number(a.referralCount);
      if (diff !== 0) return diff;
      return a.memberName.localeCompare(b.memberName);
    });
  }, [actor, backendData, selectedChapterId]);

  // Compute display ranks (ties share the same rank)
  const ranked = useMemo(() => {
    let rank = 1;
    return entries.map((entry, i) => {
      if (
        i > 0 &&
        Number(entry.referralCount) < Number(entries[i - 1].referralCount)
      ) {
        rank = i + 1;
      }
      return { entry, rank };
    });
  }, [entries]);

  const showLoader = actor && isLoading;

  return (
    <Layout title="Leaderboard">
      <div className="space-y-6 max-w-4xl mx-auto" data-ocid="leaderboard.page">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground leading-tight">
                Referral Leaderboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Top referral givers across all chapters
              </p>
            </div>
          </div>

          {/* Chapter filter tabs */}
          <ChapterTabs
            chapters={chapters}
            selected={selectedChapterId}
            onSelect={setSelectedChapterId}
          />
        </div>

        {/* Loading */}
        {showLoader ? (
          <PageLoader />
        ) : entries.length === 0 ? (
          <EmptyState
            icon={<Trophy className="w-7 h-7 text-muted-foreground" />}
            title="No leaderboard data yet"
            description="Referral data will appear here once members start giving referrals."
            data-ocid="leaderboard.empty_state"
          />
        ) : (
          <>
            {/* Podium for top 3 */}
            {ranked.length >= 2 && <TopPodium entries={entries} />}

            {/* Full table */}
            <div
              className="bg-card border border-border rounded-xl overflow-hidden elevation-base"
              data-ocid="leaderboard.table"
            >
              {/* Table header */}
              <div className="bg-muted/40 border-b border-border px-4 py-2.5 flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {selectedChapterId
                    ? `${CHAPTER_NAMES[selectedChapterId] ?? selectedChapterId} · ${entries.length} members`
                    : `All Chapters · ${entries.length} members`}
                </p>
                <p className="text-xs text-muted-foreground">Referrals Given</p>
              </div>

              <table className="w-full">
                <thead className="sr-only">
                  <tr>
                    <th>Rank</th>
                    <th>Member Name</th>
                    <th>Business Name</th>
                    <th>Chapter</th>
                    <th>Referrals Given</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map(({ entry, rank }, index) => (
                    <LeaderboardRow
                      key={entry.memberId}
                      entry={entry}
                      rank={rank}
                      index={index}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary footer */}
            <p
              className="text-xs text-muted-foreground text-right"
              data-ocid="leaderboard.summary"
            >
              {entries.length} member{entries.length !== 1 ? "s" : ""} ·{" "}
              {entries.reduce((s, e) => s + Number(e.referralCount), 0)} total
              referrals
            </p>
          </>
        )}
      </div>
    </Layout>
  );
}
