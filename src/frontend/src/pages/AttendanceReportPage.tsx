import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
} from "lucide-react";
import { type CSSProperties, useMemo, useState } from "react";
import { AppSelect } from "../components/AppSelect";
import { EmptyState } from "../components/EmptyState";
import { Layout } from "../components/Layout";
import { PageLoader } from "../components/LoadingSpinner";
import { useAttendanceReport, useChapters } from "../hooks/useBackend";
import type { AttendanceReportRow } from "../types";

// ── Seed data fallback ───────────────────────────────────────────────────────

const SEED_REPORT: AttendanceReportRow[] = [
  {
    meetingId: "m1",
    meetingTitle: "Downtown Weekly Networking",
    meetingDate: Date.now() - 7 * 86400000,
    chapterId: "downtown",
    chapterName: "Downtown",
    totalAttendees: 18,
    absentCount: 4,
    attendanceRate: 81.8,
    memberDetails: [
      { memberId: "u1", memberName: "Sarah Mitchell", status: "present" },
      { memberId: "u2", memberName: "James Kowalski", status: "present" },
      { memberId: "u3", memberName: "Priya Anand", status: "absent" },
      { memberId: "u4", memberName: "Carlos Rivera", status: "present" },
      { memberId: "u5", memberName: "Linda Park", status: "absent" },
      { memberId: "u6", memberName: "Tom Brennan", status: "present" },
    ],
  },
  {
    meetingId: "m2",
    meetingTitle: "Tech Hub Monthly Mixer",
    meetingDate: Date.now() - 14 * 86400000,
    chapterId: "techhub",
    chapterName: "Tech Hub",
    totalAttendees: 14,
    absentCount: 6,
    attendanceRate: 70.0,
    memberDetails: [
      { memberId: "u7", memberName: "Nina Okafor", status: "present" },
      { memberId: "u8", memberName: "Derek Shen", status: "absent" },
      { memberId: "u9", memberName: "Amelia Torres", status: "present" },
      { memberId: "u10", memberName: "Leo Marchetti", status: "absent" },
      { memberId: "u11", memberName: "Sofia Grant", status: "present" },
    ],
  },
  {
    meetingId: "m3",
    meetingTitle: "Westside Power Lunch",
    meetingDate: Date.now() - 21 * 86400000,
    chapterId: "westside",
    chapterName: "Westside",
    totalAttendees: 11,
    absentCount: 7,
    attendanceRate: 44.0,
    memberDetails: [
      { memberId: "u12", memberName: "Raj Patel", status: "present" },
      { memberId: "u13", memberName: "Hannah Weiss", status: "absent" },
      { memberId: "u14", memberName: "Marcus Bell", status: "absent" },
      { memberId: "u15", memberName: "Yuki Tanaka", status: "present" },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(ts: number, style: "display" | "iso" = "display"): string {
  const d = new Date(ts);
  if (style === "iso") return d.toISOString().slice(0, 10);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type RateBadge = { label: string; style: CSSProperties };

function rateBadge(rate: number): RateBadge {
  // Uses inline OKLCH styles to stay within the design system (no raw Tailwind palette classes)
  if (rate >= 80)
    return {
      label: `${rate.toFixed(1)}%`,
      style: {
        background: "oklch(0.95 0.05 160 / 0.5)",
        color: "oklch(0.38 0.12 160)",
        borderColor: "oklch(0.78 0.1 160 / 0.6)",
      },
    };
  if (rate >= 60)
    return {
      label: `${rate.toFixed(1)}%`,
      style: {
        background: "oklch(0.96 0.06 75 / 0.5)",
        color: "oklch(0.45 0.14 65)",
        borderColor: "oklch(0.82 0.12 65 / 0.6)",
      },
    };
  return {
    label: `${rate.toFixed(1)}%`,
    style: {
      background: "oklch(0.96 0.05 25 / 0.5)",
      color: "oklch(0.42 0.18 25)",
      borderColor: "oklch(0.78 0.14 25 / 0.6)",
    },
  };
}

function buildCSV(rows: AttendanceReportRow[]): string {
  const summaryHeader = "Meeting Title,Date,Chapter,Attendees,Absent,Rate (%)";
  const summaryRows = rows.map((r) =>
    [
      `"${r.meetingTitle.replace(/"/g, '""')}"`,
      formatDate(r.meetingDate, "iso"),
      `"${r.chapterName}"`,
      r.totalAttendees,
      r.absentCount,
      r.attendanceRate.toFixed(1),
    ].join(","),
  );

  const detailHeader = "Meeting Title,Member Name,Status";
  const detailRows = rows.flatMap((r) =>
    r.memberDetails.map((d) =>
      [
        `"${r.meetingTitle.replace(/"/g, '""')}"`,
        `"${d.memberName.replace(/"/g, '""')}"`,
        d.status,
      ].join(","),
    ),
  );

  return [summaryHeader, ...summaryRows, "", detailHeader, ...detailRows].join(
    "\r\n",
  );
}

function downloadCSV(
  content: string,
  fromLabel: string,
  toLabel: string,
): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `attendance_report_${fromLabel}_to_${toLabel}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

// ── Expanded member sub-table ─────────────────────────────────────────────────

function MemberDetailTable({
  members,
}: { members: AttendanceReportRow["memberDetails"] }) {
  return (
    <div className="border-t border-border bg-muted/30">
      <div className="px-6 py-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Member Attendance
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-1.5">
          {members.map((m, idx) => (
            <div
              key={m.memberId}
              className="flex items-center gap-2 min-w-0"
              data-ocid={`attendance_report.member_detail.${idx + 1}`}
            >
              <span
                style={{
                  background:
                    m.status === "present"
                      ? "oklch(0.55 0.14 160)"
                      : "oklch(0.58 0.18 25)",
                }}
                className="flex-shrink-0 w-2 h-2 rounded-full"
              />
              <span className="text-sm text-foreground truncate">
                {m.memberName}
              </span>
              <span
                style={{
                  color:
                    m.status === "present"
                      ? "oklch(0.45 0.12 160)"
                      : "oklch(0.48 0.18 25)",
                }}
                className="ml-auto text-xs font-medium flex-shrink-0"
              >
                {m.status === "present" ? "Present" : "Absent"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AttendanceReportPage() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [fromDate, setFromDate] = useState<string>(
    thirtyDaysAgo.toISOString().slice(0, 10),
  );
  const [toDate, setToDate] = useState<string>(
    today.toISOString().slice(0, 10),
  );
  const [chapterId, setChapterId] = useState<string>("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { data: chapters = [] } = useChapters();
  const fromTs = fromDate ? new Date(fromDate).getTime() : undefined;
  const toTs = toDate ? new Date(`${toDate}T23:59:59`).getTime() : undefined;

  const { data: backendRows = [], isLoading } = useAttendanceReport(
    chapterId || undefined,
    fromTs,
    toTs,
  );

  const rows: AttendanceReportRow[] = useMemo(() => {
    const source = backendRows.length > 0 ? backendRows : SEED_REPORT;
    return source.filter((r) => {
      const matchChapter = !chapterId || r.chapterId === chapterId;
      const matchFrom = !fromTs || r.meetingDate >= fromTs;
      const matchTo = !toTs || r.meetingDate <= toTs;
      return matchChapter && matchFrom && matchTo;
    });
  }, [backendRows, chapterId, fromTs, toTs]);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleExport() {
    if (!rows.length) return;
    const csv = buildCSV(rows);
    downloadCSV(csv, fromDate || "start", toDate || "end");
  }

  const chapterOptions = chapters.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <Layout
      title="Attendance Report"
      actions={
        <Button
          onClick={handleExport}
          disabled={!rows.length}
          className="gap-2"
          data-ocid="attendance_report.export_button"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      }
    >
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        {/* Page header */}
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Attendance Report
          </h1>
          <p className="text-sm text-muted-foreground">
            Export attendance records by date range and chapter
          </p>
        </div>

        {/* Filters */}
        <div
          className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-4 items-end"
          data-ocid="attendance_report.filters"
        >
          {/* Start date */}
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label
              htmlFor="from-date"
              className="text-sm font-medium text-foreground flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              Start Date
            </label>
            <input
              id="from-date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={cn(
                "px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors",
              )}
              data-ocid="attendance_report.from_date_input"
            />
          </div>

          {/* End date */}
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label
              htmlFor="to-date"
              className="text-sm font-medium text-foreground flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              End Date
            </label>
            <input
              id="to-date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className={cn(
                "px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors",
              )}
              data-ocid="attendance_report.to_date_input"
            />
          </div>

          {/* Chapter filter */}
          <div className="min-w-[180px]">
            <AppSelect
              label="Chapter"
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value)}
              placeholder="All Chapters"
              options={chapterOptions}
              data-ocid="attendance_report.chapter_select"
            />
          </div>

          {/* Summary pill */}
          {rows.length > 0 && (
            <div className="ml-auto flex items-center gap-2 bg-muted/60 px-3 py-2 rounded-lg">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {rows.length}
                </span>{" "}
                {rows.length === 1 ? "meeting" : "meetings"}
              </span>
            </div>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <PageLoader />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-7 h-7 text-muted-foreground" />}
            title="No meetings found"
            description="Adjust the date range or chapter filter to see attendance records."
            data-ocid="attendance_report.empty_state"
          />
        ) : (
          <div
            className="bg-card border border-border rounded-xl overflow-hidden"
            data-ocid="attendance_report.table"
          >
            {/* Table header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.2fr_40px] gap-x-4 px-4 py-2.5 bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span>Meeting</span>
              <span>Date</span>
              <span>Chapter</span>
              <span>Attendees</span>
              <span>Rate</span>
              <span />
            </div>

            {/* Rows */}
            {rows.map((row, idx) => {
              const expanded = expandedIds.has(row.meetingId);
              const badge = rateBadge(row.attendanceRate);
              const present = row.totalAttendees - row.absentCount;

              return (
                <div
                  key={row.meetingId}
                  className="border-b border-border last:border-b-0"
                  data-ocid={`attendance_report.item.${idx + 1}`}
                >
                  {/* Summary row */}
                  <button
                    type="button"
                    className={cn(
                      "w-full grid grid-cols-[2fr_1fr_1fr_1fr_1.2fr_40px] gap-x-4 px-4 py-3 items-center text-left",
                      "cursor-pointer hover:bg-muted/30 transition-colors",
                      expanded && "bg-muted/20",
                    )}
                    onClick={() => toggleExpand(row.meetingId)}
                    aria-expanded={expanded}
                  >
                    {/* Meeting name */}
                    <span className="text-sm font-medium text-foreground truncate">
                      {row.meetingTitle}
                    </span>

                    {/* Date */}
                    <span className="text-sm text-muted-foreground">
                      {formatDate(row.meetingDate)}
                    </span>

                    {/* Chapter */}
                    <span className="text-sm text-muted-foreground truncate">
                      {row.chapterName}
                    </span>

                    {/* Attendees */}
                    <span className="text-sm text-foreground tabular-nums">
                      {present}
                      <span className="text-muted-foreground">
                        /{row.totalAttendees}
                      </span>
                    </span>

                    {/* Rate badge */}
                    <span>
                      <Badge
                        variant="outline"
                        className="text-xs font-semibold border"
                        style={badge.style}
                      >
                        {badge.label}
                      </Badge>
                    </span>

                    {/* Expand chevron */}
                    <span className="flex items-center justify-center text-muted-foreground">
                      {expanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </span>
                  </button>

                  {/* Expanded member detail */}
                  {expanded && (
                    <MemberDetailTable members={row.memberDetails} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: "oklch(0.55 0.14 160)" }}
            />
            ≥ 80% — On track
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: "oklch(0.72 0.19 65)" }}
            />
            60–79% — Needs attention
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: "oklch(0.58 0.18 25)" }}
            />
            &lt; 60% — Low attendance
          </span>
        </div>
      </div>
    </Layout>
  );
}
