import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  MapPin,
  Save,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppBadge } from "../components/AppBadge";
import { AppSelect } from "../components/AppSelect";
import { EmptyState } from "../components/EmptyState";
import { Layout } from "../components/Layout";
import { PageLoader } from "../components/LoadingSpinner";
import {
  useAttendance,
  useChapters,
  useMarkAttendance,
  useMeetings,
  useMemberAttendance,
  useMembers,
} from "../hooks/useBackend";
import type { AttendanceRecord, ChapterId, Meeting, Member } from "../types";

// ── Seed data (used when backend returns empty) ──────────────────────────────
const SEED_MEETINGS: Meeting[] = [
  {
    id: "m1",
    title: "Downtown Weekly Networking",
    chapterId: "downtown",
    date: Date.now() + 2 * 86400000,
    location: "Grand Ballroom, Marriott Hotel",
    description: "Weekly business networking and referral exchange session.",
    status: "upcoming",
  },
  {
    id: "m2",
    title: "Tech Hub Monthly Mixer",
    chapterId: "techhub",
    date: Date.now() + 5 * 86400000,
    location: "Innovation Lab, Tech Tower Floor 12",
    description: "Monthly deep-dive into tech-sector referrals and growth.",
    status: "upcoming",
  },
  {
    id: "m3",
    title: "Westside Power Lunch",
    chapterId: "westside",
    date: Date.now() - 3 * 86400000,
    location: "The Bistro, Westside Mall",
    description: "Lunch meeting focused on retail and hospitality referrals.",
    status: "completed",
  },
];

const SEED_MEMBERS: Member[] = [
  {
    id: "mbr1",
    name: "Sarah Chen",
    businessName: "Chen Consulting",
    industry: "Finance",
    email: "sarah@chenconsulting.com",
    phone: "+1 555 0101",
    chapterId: "downtown",
    joinedAt: Date.now() - 180 * 86400000,
    status: "active",
    badges: ["top-performer"],
  },
  {
    id: "mbr2",
    name: "Marcus Johnson",
    businessName: "Johnson Real Estate",
    industry: "Real Estate",
    email: "marcus@johnsonrealty.com",
    phone: "+1 555 0102",
    chapterId: "downtown",
    joinedAt: Date.now() - 90 * 86400000,
    status: "active",
    badges: ["active-giver"],
  },
  {
    id: "mbr3",
    name: "Priya Patel",
    businessName: "Patel Technologies",
    industry: "Technology",
    email: "priya@pateltec.com",
    phone: "+1 555 0103",
    chapterId: "downtown",
    joinedAt: Date.now() - 200 * 86400000,
    status: "active",
    badges: ["connector"],
  },
  {
    id: "mbr4",
    name: "David Kim",
    businessName: "Kim Architecture",
    industry: "Architecture",
    email: "david@kimarch.com",
    phone: "+1 555 0104",
    chapterId: "downtown",
    joinedAt: Date.now() - 120 * 86400000,
    status: "active",
    badges: [],
  },
  {
    id: "mbr5",
    name: "Lisa Torres",
    businessName: "Torres Marketing",
    industry: "Marketing",
    email: "lisa@torresmarketing.com",
    phone: "+1 555 0105",
    chapterId: "downtown",
    joinedAt: Date.now() - 60 * 86400000,
    status: "active",
    badges: ["rising-star"],
  },
  {
    id: "mbr6",
    name: "James Wright",
    businessName: "Wright Insurance",
    industry: "Insurance",
    email: "james@wrightins.com",
    phone: "+1 555 0106",
    chapterId: "techhub",
    joinedAt: Date.now() - 150 * 86400000,
    status: "active",
    badges: [],
  },
];

function formatDate(ts: number) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

// ── Attendance History Badge ─────────────────────────────────────────────────
function AttendanceBadge({
  memberId,
  totalMeetings,
}: {
  memberId: string;
  totalMeetings: number;
}) {
  const { data: records = [] } = useMemberAttendance(memberId);
  const attended = records.filter((r) => r.status === "present").length;
  const total = totalMeetings || records.length || 1;
  const pct = Math.round((attended / total) * 100);

  const variant = pct >= 80 ? "success" : pct >= 50 ? "warning" : "destructive";

  return (
    <AppBadge variant={variant}>
      {attended}/{total} meetings ({pct}%)
    </AppBadge>
  );
}

// ── Member Row ───────────────────────────────────────────────────────────────
function MemberAttendanceRow({
  member,
  index,
  status,
  totalMeetings,
  onChange,
}: {
  member: Member;
  index: number;
  status: AttendanceRecord["status"];
  totalMeetings: number;
  onChange: (status: AttendanceRecord["status"]) => void;
}) {
  const isPresent = status === "present";
  const isAbsent = status === "absent";

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border transition-smooth",
        isPresent
          ? "bg-green-500/5 border-green-500/20"
          : isAbsent
            ? "bg-destructive/5 border-destructive/20"
            : "bg-card border-border",
      )}
      data-ocid={`attendance.member.row.${index}`}
    >
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
        {member.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {member.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {member.businessName} · {member.industry}
        </p>
      </div>

      {/* History */}
      <div className="hidden sm:block shrink-0">
        <AttendanceBadge memberId={member.id} totalMeetings={totalMeetings} />
      </div>

      {/* Present / Absent toggles */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onChange("present")}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-smooth",
            isPresent
              ? "bg-green-500 text-white border-green-500"
              : "bg-card text-muted-foreground border-border hover:border-green-500/40 hover:text-green-600",
          )}
          aria-pressed={isPresent}
          data-ocid={`attendance.member.present_button.${index}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Present</span>
        </button>
        <button
          type="button"
          onClick={() => onChange("absent")}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-smooth",
            isAbsent
              ? "bg-destructive text-destructive-foreground border-destructive"
              : "bg-card text-muted-foreground border-border hover:border-destructive/40 hover:text-destructive",
          )}
          aria-pressed={isAbsent}
          data-ocid={`attendance.member.absent_button.${index}`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Absent</span>
        </button>
      </div>
    </div>
  );
}

// ── AttendancePage ────────────────────────────────────────────────────────────
export default function AttendancePage() {
  // Read meetingId from sessionStorage (set by MeetingsPage)
  const storedId =
    typeof window !== "undefined"
      ? (sessionStorage.getItem("selectedMeetingId") ?? "")
      : "";
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(storedId);
  const [saved, setSaved] = useState(false);

  const { data: chapters = [], isLoading: chaptersLoading } = useChapters();
  const { data: rawMeetings = [], isLoading: meetingsLoading } = useMeetings();
  const meetings = rawMeetings.length > 0 ? rawMeetings : SEED_MEETINGS;

  const selectedMeeting = meetings.find((m) => m.id === selectedMeetingId);

  const { data: rawMembers = [], isLoading: membersLoading } = useMembers(
    selectedMeeting?.chapterId,
  );
  const members =
    rawMembers.length > 0
      ? rawMembers
      : SEED_MEMBERS.filter((m) => m.chapterId === selectedMeeting?.chapterId);

  const { data: existingAttendance = [] } = useAttendance(
    selectedMeetingId || undefined,
  );
  const markAttendance = useMarkAttendance();

  // Local attendance state: memberId -> status
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, AttendanceRecord["status"]>
  >({});

  // Pre-populate from existing records
  useEffect(() => {
    if (existingAttendance.length > 0) {
      const map: Record<string, AttendanceRecord["status"]> = {};
      for (const r of existingAttendance) {
        map[r.memberId] = r.status;
      }
      setAttendanceMap(map);
    }
  }, [existingAttendance]);

  const chapterMap = Object.fromEntries(chapters.map((c) => [c.id, c.name]));
  const meetingOptions = meetings.map((m) => ({
    value: m.id,
    label: `${m.title} — ${chapterMap[m.chapterId] ?? m.chapterId}`,
  }));

  const presentCount = useMemo(
    () => Object.values(attendanceMap).filter((s) => s === "present").length,
    [attendanceMap],
  );
  const absentCount = useMemo(
    () => Object.values(attendanceMap).filter((s) => s === "absent").length,
    [attendanceMap],
  );

  const isLoading = chaptersLoading || meetingsLoading || membersLoading;

  function handleStatusChange(
    memberId: string,
    status: AttendanceRecord["status"],
  ) {
    setAttendanceMap((prev) => ({ ...prev, [memberId]: status }));
    setSaved(false);
  }

  async function handleSave() {
    if (!selectedMeetingId) return;
    await Promise.all(
      members.map((m) =>
        markAttendance.mutateAsync({
          memberId: m.id,
          meetingId: selectedMeetingId,
          status: attendanceMap[m.id] ?? "absent",
        }),
      ),
    );
    setSaved(true);
  }

  function handleMarkAll(status: AttendanceRecord["status"]) {
    const map: Record<string, AttendanceRecord["status"]> = {};
    for (const m of members) map[m.id] = status;
    setAttendanceMap(map);
    setSaved(false);
  }

  function handleBack() {
    sessionStorage.removeItem("selectedMeetingId");
    window.location.href = "/meetings";
  }

  return (
    <Layout title="Attendance">
      <div className="space-y-6" data-ocid="attendance.page">
        {/* Back + meeting selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth w-fit"
            data-ocid="attendance.back_button"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Meetings
          </button>
          <div className="sm:ml-auto w-full sm:w-72">
            <AppSelect
              options={meetingOptions}
              placeholder="Select a meeting…"
              value={selectedMeetingId}
              onChange={(e) => {
                setSelectedMeetingId(e.target.value);
                setSaved(false);
                setAttendanceMap({});
                sessionStorage.setItem("selectedMeetingId", e.target.value);
              }}
              data-ocid="attendance.meeting_select"
            />
          </div>
        </div>

        {/* Meeting details banner */}
        {selectedMeeting && (
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0 space-y-1">
              <h2 className="font-display font-bold text-foreground">
                {selectedMeeting.title}
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Building2 className="w-3.5 h-3.5 text-primary/70" />
                  {chapterMap[selectedMeeting.chapterId] ??
                    selectedMeeting.chapterId}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 text-primary/70" />
                  {formatDate(selectedMeeting.date)}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-accent/80" />
                  {selectedMeeting.location}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-center">
                <p className="font-bold text-lg text-green-600">
                  {presentCount}
                </p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="font-bold text-lg text-destructive">
                  {absentCount}
                </p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="font-bold text-lg text-muted-foreground">
                  {members.length - presentCount - absentCount}
                </p>
                <p className="text-xs text-muted-foreground">Unmarked</p>
              </div>
            </div>
          </div>
        )}

        {/* No meeting selected */}
        {!selectedMeetingId && !isLoading && (
          <EmptyState
            icon={<ClipboardCheck className="w-7 h-7 text-muted-foreground" />}
            title="Select a meeting"
            description="Choose a meeting from the dropdown above to mark attendance for its members."
          />
        )}

        {/* Loading */}
        {isLoading && selectedMeetingId && <PageLoader />}

        {/* Member list */}
        {selectedMeetingId && !isLoading && (
          <>
            {/* Bulk actions */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {members.length} members in chapter
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMarkAll("present")}
                  className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-smooth"
                  data-ocid="attendance.mark_all_present_button"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll("absent")}
                  className="px-3 py-1.5 text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg hover:bg-destructive/20 transition-smooth"
                  data-ocid="attendance.mark_all_absent_button"
                >
                  Mark All Absent
                </button>
              </div>
            </div>

            {members.length === 0 ? (
              <EmptyState
                icon={<Users className="w-7 h-7 text-muted-foreground" />}
                title="No members in this chapter"
                description="Add members to this chapter from the Members page."
              />
            ) : (
              <div className="space-y-2">
                {members.map((member, i) => (
                  <MemberAttendanceRow
                    key={member.id}
                    member={member}
                    index={i + 1}
                    status={attendanceMap[member.id] ?? "absent"}
                    totalMeetings={
                      meetings.filter((m) => m.chapterId === member.chapterId)
                        .length
                    }
                    onChange={(status) => handleStatusChange(member.id, status)}
                  />
                ))}
              </div>
            )}

            {/* Save button */}
            {members.length > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-border">
                {saved ? (
                  <span
                    className="flex items-center gap-1.5 text-sm text-green-600 font-medium"
                    data-ocid="attendance.success_state"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Attendance saved successfully
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {Object.keys(attendanceMap).length} of {members.length}{" "}
                    members marked
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={markAttendance.isPending}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-smooth"
                  data-ocid="attendance.save_button"
                >
                  <Save className="w-4 h-4" />
                  {markAttendance.isPending ? "Saving…" : "Save Attendance"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
