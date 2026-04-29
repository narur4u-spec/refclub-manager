import List "mo:core/List";
import MemberLib "lib/members";
import AttendanceLib "lib/attendance";
import ReferralLib "lib/referrals";
import MessageLib "lib/messages";
import MemberTypes "types/members";
import MembersApi "mixins/members-api";
import AttendanceApi "mixins/attendance-api";
import ReferralsApi "mixins/referrals-api";
import MessagesApi "mixins/messages-api";
import LeaderboardApi "mixins/leaderboard-api";
import ImportApi "mixins/import-api";
import ReportApi "mixins/report-api";

actor {
  // Member state
  let memberState : MemberLib.State = {
    members = List.empty<MemberTypes.Member>();
    chapters = List.fromArray<MemberTypes.Chapter>([
      { id = 1; name = "Chapter Alpha"; description = "North region chapter" },
      { id = 2; name = "Chapter Beta"; description = "South region chapter" },
      { id = 3; name = "Chapter Gamma"; description = "East region chapter" },
      { id = 4; name = "Chapter Delta"; description = "West region chapter" },
      { id = 5; name = "Chapter Epsilon"; description = "Central region chapter" },
    ]);
    var nextMemberId = 1;
  };

  // Attendance state
  let attendanceState : AttendanceLib.State = {
    meetings = List.empty();
    attendance = List.empty();
    var nextMeetingId = 1;
    var nextAttendanceId = 1;
  };

  // Referral state
  let referralState : ReferralLib.State = {
    referrals = List.empty();
    var nextReferralId = 1;
  };

  // Message state
  let messageState : MessageLib.State = {
    messages = List.empty();
    members = memberState.members;
    var nextMessageId = 1;
  };

  include MembersApi(memberState);
  include AttendanceApi(attendanceState);
  include ReferralsApi(referralState);
  include MessagesApi(messageState, attendanceState, referralState);
  include LeaderboardApi(memberState, referralState);
  include ImportApi(memberState);
  include ReportApi(attendanceState, memberState);
};
