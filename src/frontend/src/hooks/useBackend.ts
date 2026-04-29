import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  AttendanceRecord,
  AttendanceReportRow,
  ChapterId,
  DashboardStats,
  ImportResult,
  LeaderboardEntry,
  Meeting,
  Member,
  MemberImport,
  Message,
  Referral,
} from "../types";

// ── Seed / mock data (used when backend has no methods yet) ──────────────────

const CHAPTERS_DATA = [
  {
    id: "downtown" as ChapterId,
    name: "Downtown",
    description: "Business district",
    meetingDay: "Monday",
  },
  {
    id: "techhub" as ChapterId,
    name: "Tech Hub",
    description: "Technology sector",
    meetingDay: "Tuesday",
  },
  {
    id: "westside" as ChapterId,
    name: "Westside",
    description: "West business park",
    meetingDay: "Wednesday",
  },
  {
    id: "innovation-park" as ChapterId,
    name: "Innovation Park",
    description: "Startup ecosystem",
    meetingDay: "Thursday",
  },
  {
    id: "business-bay" as ChapterId,
    name: "Business Bay",
    description: "Commercial hub",
    meetingDay: "Friday",
  },
];

// Map chapter slug → 1-based numeric bigint index for backend calls
function chapterSlugToId(slug: string): bigint {
  const idx = CHAPTERS_DATA.findIndex((c) => c.id === slug);
  if (idx === -1) throw new Error(`Unknown chapter slug: ${slug}`);
  return BigInt(idx + 1);
}

// ── Dashboard Stats ──────────────────────────────────────────────────────────

export function useDashboardStats() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor || isFetching) {
        return {
          totalMembers: 200,
          activeMembers: 178,
          totalMeetings: 48,
          totalReferrals: 312,
          convertedReferrals: 189,
          referralValue: 284500,
          upcomingMeetings: 5,
          messagesSent: 64,
        };
      }
      return {
        totalMembers: 200,
        activeMembers: 178,
        totalMeetings: 48,
        totalReferrals: 312,
        convertedReferrals: 189,
        referralValue: 284500,
        upcomingMeetings: 5,
        messagesSent: 64,
      };
    },
    enabled: true,
  });
}

// ── Members ──────────────────────────────────────────────────────────────────

export function useMembers(chapterId?: ChapterId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Member[]>({
    queryKey: ["members", chapterId],
    queryFn: async () => {
      if (!actor || isFetching) return [];
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMember(id: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Member | null>({
    queryKey: ["member", id],
    queryFn: async () => {
      if (!actor || isFetching) return null;
      return null;
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateMember() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Member, "id" | "joinedAt" | "badges">) => {
      if (!actor) throw new Error("Not connected");
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
  });
}

export function useUpdateMember() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Member> & { id: string }) => {
      if (!actor) throw new Error("Not connected");
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["members"] });
      qc.invalidateQueries({ queryKey: ["member", vars.id] });
    },
  });
}

// ── Meetings ─────────────────────────────────────────────────────────────────

export function useMeetings(chapterId?: ChapterId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Meeting[]>({
    queryKey: ["meetings", chapterId],
    queryFn: async () => {
      if (!actor || isFetching) return [];
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateMeeting() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Meeting, "id">) => {
      if (!actor) throw new Error("Not connected");
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meetings"] }),
  });
}

// ── Attendance ────────────────────────────────────────────────────────────────

export function useAttendance(meetingId?: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AttendanceRecord[]>({
    queryKey: ["attendance", meetingId],
    queryFn: async () => {
      if (!actor || isFetching) return [];
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMemberAttendance(memberId: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AttendanceRecord[]>({
    queryKey: ["memberAttendance", memberId],
    queryFn: async () => {
      if (!actor || isFetching) return [];
      return [];
    },
    enabled: !!actor && !isFetching && !!memberId,
  });
}

export function useMarkAttendance() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<AttendanceRecord, "id">) => {
      if (!actor) throw new Error("Not connected");
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["attendance", vars.meetingId] });
      qc.invalidateQueries({ queryKey: ["memberAttendance", vars.memberId] });
    },
  });
}

// ── Referrals ─────────────────────────────────────────────────────────────────

export function useReferrals(chapterId?: ChapterId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Referral[]>({
    queryKey: ["referrals", chapterId],
    queryFn: async () => {
      if (!actor || isFetching) return [];
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateReferral() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<Referral, "id" | "createdAt" | "updatedAt">,
    ) => {
      if (!actor) throw new Error("Not connected");
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referrals"] }),
  });
}

export function useUpdateReferralStatus() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: { id: string; status: Referral["status"] }) => {
      if (!actor) throw new Error("Not connected");
      return { id, status };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referrals"] }),
  });
}

// ── Messages ──────────────────────────────────────────────────────────────────

export function useMessages() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: async () => {
      if (!actor || isFetching) return [];
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSendMessage() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<Message, "id" | "sentAt" | "recipientCount">,
    ) => {
      if (!actor) throw new Error("Not connected");
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages"] }),
  });
}

// ── Chapters ──────────────────────────────────────────────────────────────────

export function useChapters() {
  return useQuery({
    queryKey: ["chapters"],
    queryFn: async () => CHAPTERS_DATA,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

export function useLeaderboard(chapterId?: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard", chapterId],
    queryFn: async () => {
      if (!actor || isFetching) return [];
      const raw = await actor.getLeaderboard(
        chapterId ? chapterSlugToId(chapterId) : null,
      );
      return raw.map((e) => ({
        memberId: String(e.memberId),
        memberName: e.memberName,
        businessName: e.businessName,
        chapterId: String(e.chapterId),
        referralCount: Number(e.referralCount),
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Import Members ────────────────────────────────────────────────────────────

export function useImportMembers() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation<ImportResult, Error, MemberImport[]>({
    mutationFn: async (members: MemberImport[]) => {
      if (!actor) throw new Error("Not connected");
      const payload = members.map((m) => ({
        name: m.name,
        businessName: m.businessName,
        businessCategory: m.businessCategory,
        email: m.email,
        phone: m.phone,
        website: m.website,
        chapterId: chapterSlugToId(m.chapterId),
      }));
      return actor.importMembers(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

// ── Attendance Report ─────────────────────────────────────────────────────────

export function useAttendanceReport(
  chapterId?: string,
  fromDate?: number,
  toDate?: number,
) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AttendanceReportRow[]>({
    queryKey: ["attendanceReport", chapterId, fromDate, toDate],
    queryFn: async () => {
      if (!actor || isFetching) return [];
      const raw = await actor.getAttendanceReport(
        chapterId ? chapterSlugToId(chapterId) : null,
        fromDate != null ? BigInt(fromDate) : null,
        toDate != null ? BigInt(toDate) : null,
      );
      return raw.map((row) => ({
        meetingId: String(row.meetingId),
        meetingTitle: row.meetingTitle,
        meetingDate: Number(row.meetingDate),
        chapterId: String(row.chapterId),
        chapterName: row.chapterName,
        totalAttendees: Number(row.totalAttendees),
        absentCount: Number(row.absentCount),
        attendanceRate: row.attendanceRate,
        memberDetails: row.memberDetails.map((d) => ({
          memberId: String(d.memberId),
          memberName: d.memberName,
          status: d.status as "present" | "absent",
        })),
      }));
    },
    enabled: !!actor && !isFetching,
  });
}
