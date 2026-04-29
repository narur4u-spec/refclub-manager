import type { backendInterface, AttendanceStatus, DealStatus } from "../backend";

const now = BigInt(Date.now()) * BigInt(1_000_000);

export const mockBackend: backendInterface = {
  getDashboardStats: async () => ({
    memberCount: BigInt(200),
    referralCount: BigInt(87),
    messageCount: BigInt(42),
    meetingCount: BigInt(24),
    chapterCount: BigInt(5),
  }),

  listChapters: async () => [
    { id: BigInt(1), name: "Chapter Alpha", description: "North region chapter" },
    { id: BigInt(2), name: "Chapter Beta", description: "South region chapter" },
    { id: BigInt(3), name: "Chapter Gamma", description: "East region chapter" },
    { id: BigInt(4), name: "Chapter Delta", description: "West region chapter" },
    { id: BigInt(5), name: "Chapter Epsilon", description: "Central region chapter" },
  ],

  getChapter: async (id) => ({
    id,
    name: "Chapter Alpha",
    description: "North region chapter",
  }),

  listMembers: async () => [
    {
      id: BigInt(1),
      name: "Alice Johnson",
      businessName: "Johnson Consulting",
      businessCategory: "Consulting",
      email: "alice@johnsonconsulting.com",
      phone: "+1-555-0101",
      website: "https://johnsonconsulting.com",
      chapterId: BigInt(1),
      isActive: true,
      createdAt: now,
    },
    {
      id: BigInt(2),
      name: "Bob Smith",
      businessName: "Smith & Associates",
      businessCategory: "Legal",
      email: "bob@smithassociates.com",
      phone: "+1-555-0102",
      website: "https://smithassociates.com",
      chapterId: BigInt(1),
      isActive: true,
      createdAt: now,
    },
    {
      id: BigInt(3),
      name: "Carol Davis",
      businessName: "Davis Real Estate",
      businessCategory: "Real Estate",
      email: "carol@davisrealty.com",
      phone: "+1-555-0103",
      website: "https://davisrealty.com",
      chapterId: BigInt(2),
      isActive: true,
      createdAt: now,
    },
    {
      id: BigInt(4),
      name: "David Lee",
      businessName: "Lee Financial Group",
      businessCategory: "Finance",
      email: "david@leefinancial.com",
      phone: "+1-555-0104",
      website: "https://leefinancial.com",
      chapterId: BigInt(2),
      isActive: false,
      createdAt: now,
    },
    {
      id: BigInt(5),
      name: "Eva Martinez",
      businessName: "Martinez Design Studio",
      businessCategory: "Design",
      email: "eva@martinezdesign.com",
      phone: "+1-555-0105",
      website: "https://martinezdesign.com",
      chapterId: BigInt(3),
      isActive: true,
      createdAt: now,
    },
  ],

  listMembersByChapter: async (chapterId) => [
    {
      id: BigInt(1),
      name: "Alice Johnson",
      businessName: "Johnson Consulting",
      businessCategory: "Consulting",
      email: "alice@johnsonconsulting.com",
      phone: "+1-555-0101",
      website: "https://johnsonconsulting.com",
      chapterId,
      isActive: true,
      createdAt: now,
    },
  ],

  getMember: async (id) => ({
    id,
    name: "Alice Johnson",
    businessName: "Johnson Consulting",
    businessCategory: "Consulting",
    email: "alice@johnsonconsulting.com",
    phone: "+1-555-0101",
    website: "https://johnsonconsulting.com",
    chapterId: BigInt(1),
    isActive: true,
    createdAt: now,
  }),

  addMember: async (name, businessName, businessCategory, email, phone, website, chapterId) => ({
    id: BigInt(6),
    name,
    businessName,
    businessCategory,
    email,
    phone,
    website,
    chapterId,
    isActive: true,
    createdAt: now,
  }),

  updateMember: async (id, name, businessName, businessCategory, email, phone, website, chapterId, isActive) => ({
    id,
    name,
    businessName,
    businessCategory,
    email,
    phone,
    website,
    chapterId,
    isActive,
    createdAt: now,
  }),

  deleteMember: async () => true,

  listMeetings: async () => [
    {
      id: BigInt(1),
      title: "Weekly Networking Session",
      chapterId: BigInt(1),
      date: now,
      location: "Grand Ballroom, Downtown Hotel",
      description: "Monthly networking and referral sharing meeting for Chapter Alpha members.",
    },
    {
      id: BigInt(2),
      title: "Quarterly Review Meeting",
      chapterId: BigInt(2),
      date: now - BigInt(7 * 24 * 3600) * BigInt(1_000_000_000),
      location: "Business Center, Suite 300",
      description: "Review of referrals and business goals for Q4.",
    },
  ],

  listMeetingsByChapter: async (chapterId) => [
    {
      id: BigInt(1),
      title: "Weekly Networking Session",
      chapterId,
      date: now,
      location: "Grand Ballroom, Downtown Hotel",
      description: "Weekly networking and referral sharing meeting.",
    },
  ],

  getMeeting: async (id) => ({
    id,
    title: "Weekly Networking Session",
    chapterId: BigInt(1),
    date: now,
    location: "Grand Ballroom, Downtown Hotel",
    description: "Monthly networking and referral sharing meeting.",
  }),

  addMeeting: async (title, chapterId, date, location, description) => ({
    id: BigInt(3),
    title,
    chapterId,
    date,
    location,
    description,
  }),

  updateMeeting: async (id, title, chapterId, date, location, description) => ({
    id,
    title,
    chapterId,
    date,
    location,
    description,
  }),

  deleteMeeting: async () => true,

  getAttendanceByMeeting: async (meetingId) => [
    {
      id: BigInt(1),
      meetingId,
      memberId: BigInt(1),
      status: "present" as unknown as AttendanceStatus,
      markedAt: now,
    },
    {
      id: BigInt(2),
      meetingId,
      memberId: BigInt(2),
      status: "absent" as unknown as AttendanceStatus,
      markedAt: now,
    },
    {
      id: BigInt(3),
      meetingId,
      memberId: BigInt(3),
      status: "present" as unknown as AttendanceStatus,
      markedAt: now,
    },
  ],

  getAttendanceByMember: async (memberId) => [
    {
      id: BigInt(1),
      meetingId: BigInt(1),
      memberId,
      status: "present" as unknown as AttendanceStatus,
      markedAt: now,
    },
    {
      id: BigInt(2),
      meetingId: BigInt(2),
      memberId,
      status: "present" as unknown as AttendanceStatus,
      markedAt: now,
    },
  ],

  markAttendance: async (meetingId, memberId, status) => ({
    id: BigInt(10),
    meetingId,
    memberId,
    status,
    markedAt: now,
  }),

  updateAttendance: async (id, status) => ({
    id,
    meetingId: BigInt(1),
    memberId: BigInt(1),
    status,
    markedAt: now,
  }),

  getAllReferrals: async () => [
    {
      id: BigInt(1),
      giverId: BigInt(1),
      receiverId: BigInt(2),
      businessCategory: "Legal",
      dealStatus: "closed" as unknown as DealStatus,
      dealValue: BigInt(5000),
      notes: "Referred Bob for contract review services.",
      createdAt: now,
    },
    {
      id: BigInt(2),
      giverId: BigInt(3),
      receiverId: BigInt(1),
      businessCategory: "Consulting",
      dealStatus: "pending" as unknown as DealStatus,
      dealValue: BigInt(2500),
      notes: "Potential consulting engagement for real estate firm.",
      createdAt: now,
    },
    {
      id: BigInt(3),
      giverId: BigInt(2),
      receiverId: BigInt(5),
      businessCategory: "Design",
      dealStatus: "in_progress" as unknown as DealStatus,
      dealValue: BigInt(1500),
      notes: "Design work for new office branding.",
      createdAt: now,
    },
  ],

  getReferralsByGiver: async (giverId) => [
    {
      id: BigInt(1),
      giverId,
      receiverId: BigInt(2),
      businessCategory: "Legal",
      dealStatus: "closed" as unknown as DealStatus,
      dealValue: BigInt(5000),
      notes: "Referred for contract review services.",
      createdAt: now,
    },
  ],

  getReferralsByReceiver: async (receiverId) => [
    {
      id: BigInt(2),
      giverId: BigInt(3),
      receiverId,
      businessCategory: "Consulting",
      dealStatus: "pending" as unknown as DealStatus,
      dealValue: BigInt(2500),
      notes: "Potential consulting engagement.",
      createdAt: now,
    },
  ],

  addReferral: async (giverId, receiverId, businessCategory, dealStatus, dealValue, notes) => ({
    id: BigInt(4),
    giverId,
    receiverId,
    businessCategory,
    dealStatus,
    dealValue: dealValue ?? undefined,
    notes,
    createdAt: now,
  }),

  updateReferral: async (id, businessCategory, dealStatus, dealValue, notes) => ({
    id,
    giverId: BigInt(1),
    receiverId: BigInt(2),
    businessCategory,
    dealStatus,
    dealValue: dealValue ?? undefined,
    notes,
    createdAt: now,
  }),

  deleteReferral: async () => true,

  getMessages: async () => [
    {
      id: BigInt(1),
      subject: "Upcoming Chapter Alpha Meeting",
      body: "Dear members, please join us for our weekly networking session this Friday at 7 PM. Looking forward to seeing everyone!",
      chapterId: BigInt(1),
      sentAt: now,
      recipientCount: BigInt(40),
    },
    {
      id: BigInt(2),
      subject: "Q4 Referral Challenge",
      body: "We're launching our Q4 referral challenge! Top referrers will be recognized at our annual gala. Start making connections today!",
      chapterId: undefined,
      sentAt: now - BigInt(3 * 24 * 3600) * BigInt(1_000_000_000),
      recipientCount: BigInt(200),
    },
  ],

  getMessage: async (id) => ({
    id,
    subject: "Upcoming Chapter Alpha Meeting",
    body: "Dear members, please join us for our weekly networking session this Friday at 7 PM.",
    chapterId: BigInt(1),
    sentAt: now,
    recipientCount: BigInt(40),
  }),

  sendMessage: async (subject, body, chapterId) => ({
    id: BigInt(3),
    subject,
    body,
    chapterId: chapterId ?? undefined,
    sentAt: now,
    recipientCount: chapterId ? BigInt(40) : BigInt(200),
  }),

  getLeaderboard: async (_chapterId) => [
    { memberId: BigInt(1), memberName: "Alice Johnson", businessName: "Johnson Consulting", chapterId: BigInt(1), referralCount: BigInt(14) },
    { memberId: BigInt(3), memberName: "Carol Davis", businessName: "Davis Real Estate", chapterId: BigInt(2), referralCount: BigInt(11) },
    { memberId: BigInt(2), memberName: "Bob Smith", businessName: "Smith & Associates", chapterId: BigInt(1), referralCount: BigInt(9) },
    { memberId: BigInt(5), memberName: "Eva Martinez", businessName: "Martinez Design Studio", chapterId: BigInt(3), referralCount: BigInt(7) },
    { memberId: BigInt(4), memberName: "David Lee", businessName: "Lee Financial Group", chapterId: BigInt(2), referralCount: BigInt(5) },
  ],

  importMembers: async (members) => ({
    imported: BigInt(members.length),
    skipped: BigInt(0),
    errors: [],
  }),

  getAttendanceReport: async (_chapterId, _fromDate, _toDate) => [
    {
      meetingId: BigInt(1),
      meetingTitle: "Weekly Networking Session",
      meetingDate: now,
      chapterId: BigInt(1),
      chapterName: "Chapter Alpha",
      totalAttendees: BigInt(38),
      absentCount: BigInt(2),
      attendanceRate: 0.95,
      memberDetails: [
        { memberId: BigInt(1), memberName: "Alice Johnson", status: "present" as unknown as import("../backend").AttendanceStatus },
        { memberId: BigInt(2), memberName: "Bob Smith", status: "absent" as unknown as import("../backend").AttendanceStatus },
      ],
    },
    {
      meetingId: BigInt(2),
      meetingTitle: "Quarterly Review Meeting",
      meetingDate: now - BigInt(7 * 24 * 3600) * BigInt(1_000_000_000),
      chapterId: BigInt(2),
      chapterName: "Chapter Beta",
      totalAttendees: BigInt(35),
      absentCount: BigInt(5),
      attendanceRate: 0.875,
      memberDetails: [
        { memberId: BigInt(3), memberName: "Carol Davis", status: "present" as unknown as import("../backend").AttendanceStatus },
        { memberId: BigInt(4), memberName: "David Lee", status: "present" as unknown as import("../backend").AttendanceStatus },
      ],
    },
  ],
};
