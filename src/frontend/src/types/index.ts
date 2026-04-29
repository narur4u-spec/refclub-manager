export type ChapterId =
  | "downtown"
  | "techhub"
  | "westside"
  | "innovation-park"
  | "business-bay";

export interface Chapter {
  id: ChapterId;
  name: string;
  description: string;
  meetingDay: string;
}

export interface Member {
  id: string;
  name: string;
  businessName: string;
  industry: string;
  email: string;
  phone: string;
  chapterId: ChapterId;
  joinedAt: number;
  status: "active" | "inactive";
  badges: MemberBadge[];
  avatarUrl?: string;
}

export type MemberBadge =
  | "active-giver"
  | "top-performer"
  | "rising-star"
  | "connector"
  | "ambassador";

export interface Meeting {
  id: string;
  title: string;
  chapterId: ChapterId;
  date: number;
  location: string;
  description: string;
  status: "upcoming" | "completed" | "cancelled";
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  meetingId: string;
  status: "present" | "absent" | "excused";
  checkedInAt?: number;
}

export interface Referral {
  id: string;
  giverId: string;
  receiverId: string;
  chapterId: ChapterId;
  businessName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  status: "pending" | "contacted" | "converted" | "declined";
  value?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  chapterId: ChapterId | "all";
  subject: string;
  body: string;
  sentAt: number;
  recipientCount: number;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalMeetings: number;
  totalReferrals: number;
  convertedReferrals: number;
  referralValue: number;
  upcomingMeetings: number;
  messagesSent: number;
}

export interface LeaderboardEntry {
  memberId: string;
  memberName: string;
  businessName: string;
  chapterId: string;
  referralCount: number;
}

export interface ImportResult {
  imported: bigint;
  skipped: bigint;
  errors: string[];
}

export interface MemberImport {
  name: string;
  businessName: string;
  businessCategory: string;
  email: string;
  phone: string;
  website: string;
  chapterId: string;
}

export interface AttendanceReportMemberDetail {
  memberId: string;
  memberName: string;
  status: "present" | "absent";
}

export interface AttendanceReportRow {
  meetingId: string;
  meetingTitle: string;
  meetingDate: number;
  chapterId: string;
  chapterName: string;
  totalAttendees: number;
  absentCount: number;
  attendanceRate: number;
  memberDetails: AttendanceReportMemberDetail[];
}
