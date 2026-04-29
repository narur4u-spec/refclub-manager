import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LeaderboardEntry {
    memberId: MemberId;
    businessName: string;
    chapterId: ChapterId;
    referralCount: bigint;
    memberName: string;
}
export type Timestamp = bigint;
export interface Meeting {
    id: MeetingId;
    title: string;
    date: Timestamp;
    description: string;
    chapterId: ChapterId;
    location: string;
}
export type MemberId = bigint;
export interface ImportResult {
    imported: bigint;
    skipped: bigint;
    errors: Array<string>;
}
export type AttendanceId = bigint;
export interface MemberImport {
    businessCategory: string;
    name: string;
    businessName: string;
    chapterId: ChapterId;
    email: string;
    website: string;
    phone: string;
}
export interface DashboardStats {
    memberCount: bigint;
    referralCount: bigint;
    messageCount: bigint;
    meetingCount: bigint;
    chapterCount: bigint;
}
export type ChapterId = bigint;
export interface Chapter {
    id: ChapterId;
    name: string;
    description: string;
}
export type ReferralId = bigint;
export type MeetingId = bigint;
export interface AttendanceReportRow {
    memberDetails: Array<AttendanceReportMemberDetail>;
    meetingDate: Timestamp;
    chapterId: ChapterId;
    meetingTitle: string;
    totalAttendees: bigint;
    attendanceRate: number;
    absentCount: bigint;
    meetingId: MeetingId;
    chapterName: string;
}
export interface AttendanceReportMemberDetail {
    status: AttendanceStatus;
    memberId: MemberId;
    memberName: string;
}
export type MessageId = bigint;
export interface Referral {
    id: ReferralId;
    businessCategory: string;
    createdAt: Timestamp;
    receiverId: MemberId;
    notes: string;
    dealValue?: bigint;
    dealStatus: DealStatus;
    giverId: MemberId;
}
export interface Message {
    id: MessageId;
    subject: string;
    body: string;
    chapterId?: ChapterId;
    sentAt: Timestamp;
    recipientCount: bigint;
}
export interface Member {
    id: MemberId;
    businessCategory: string;
    name: string;
    createdAt: Timestamp;
    businessName: string;
    chapterId: ChapterId;
    isActive: boolean;
    email: string;
    website: string;
    phone: string;
}
export interface AttendanceRecord {
    id: AttendanceId;
    status: AttendanceStatus;
    memberId: MemberId;
    markedAt: Timestamp;
    meetingId: MeetingId;
}
export enum AttendanceStatus {
    present = "present",
    absent = "absent"
}
export enum DealStatus {
    closed = "closed",
    pending = "pending",
    in_progress = "in_progress"
}
export interface backendInterface {
    addMeeting(title: string, chapterId: ChapterId, date: Timestamp, location: string, description: string): Promise<Meeting>;
    addMember(name: string, businessName: string, businessCategory: string, email: string, phone: string, website: string, chapterId: ChapterId): Promise<Member>;
    addReferral(giverId: MemberId, receiverId: MemberId, businessCategory: string, dealStatus: DealStatus, dealValue: bigint | null, notes: string): Promise<Referral>;
    deleteMeeting(id: MeetingId): Promise<boolean>;
    deleteMember(id: MemberId): Promise<boolean>;
    deleteReferral(id: ReferralId): Promise<boolean>;
    getAllReferrals(): Promise<Array<Referral>>;
    getAttendanceByMeeting(meetingId: MeetingId): Promise<Array<AttendanceRecord>>;
    getAttendanceByMember(memberId: MemberId): Promise<Array<AttendanceRecord>>;
    getAttendanceReport(chapterId: ChapterId | null, fromDate: Timestamp | null, toDate: Timestamp | null): Promise<Array<AttendanceReportRow>>;
    getChapter(id: ChapterId): Promise<Chapter | null>;
    getDashboardStats(): Promise<DashboardStats>;
    getLeaderboard(chapterId: ChapterId | null): Promise<Array<LeaderboardEntry>>;
    getMeeting(id: MeetingId): Promise<Meeting | null>;
    getMember(id: MemberId): Promise<Member | null>;
    getMessage(id: MessageId): Promise<Message | null>;
    getMessages(): Promise<Array<Message>>;
    getReferralsByGiver(giverId: MemberId): Promise<Array<Referral>>;
    getReferralsByReceiver(receiverId: MemberId): Promise<Array<Referral>>;
    importMembers(members: Array<MemberImport>): Promise<ImportResult>;
    listChapters(): Promise<Array<Chapter>>;
    listMeetings(): Promise<Array<Meeting>>;
    listMeetingsByChapter(chapterId: ChapterId): Promise<Array<Meeting>>;
    listMembers(): Promise<Array<Member>>;
    listMembersByChapter(chapterId: ChapterId): Promise<Array<Member>>;
    markAttendance(meetingId: MeetingId, memberId: MemberId, status: AttendanceStatus): Promise<AttendanceRecord>;
    sendMessage(subject: string, body: string, chapterId: ChapterId | null): Promise<Message>;
    updateAttendance(id: AttendanceId, status: AttendanceStatus): Promise<AttendanceRecord | null>;
    updateMeeting(id: MeetingId, title: string, chapterId: ChapterId, date: Timestamp, location: string, description: string): Promise<Meeting | null>;
    updateMember(id: MemberId, name: string, businessName: string, businessCategory: string, email: string, phone: string, website: string, chapterId: ChapterId, isActive: boolean): Promise<Member | null>;
    updateReferral(id: ReferralId, businessCategory: string, dealStatus: DealStatus, dealValue: bigint | null, notes: string): Promise<Referral | null>;
}
