import AttendanceLib "../lib/attendance";
import MemberLib "../lib/members";
import AttendanceTypes "../types/attendance";
import Common "../types/common";

mixin (attendanceState : AttendanceLib.State, memberState : MemberLib.State) {

  public type AttendanceReportMemberDetail = {
    memberId : Common.MemberId;
    memberName : Text;
    status : AttendanceTypes.AttendanceStatus;
  };

  public type AttendanceReportRow = {
    meetingId : Common.MeetingId;
    meetingTitle : Text;
    meetingDate : Common.Timestamp;
    chapterId : Common.ChapterId;
    chapterName : Text;
    totalAttendees : Nat;
    absentCount : Nat;
    attendanceRate : Float;
    memberDetails : [AttendanceReportMemberDetail];
  };

  public query func getAttendanceReport(
    chapterId : ?Common.ChapterId,
    fromDate : ?Common.Timestamp,
    toDate : ?Common.Timestamp,
  ) : async [AttendanceReportRow] {
    let allMeetings = AttendanceLib.listMeetings(attendanceState);

    // Filter meetings by chapterId and date range
    let filtered = allMeetings.filter(
      func(m) {
        let chapterOk = switch (chapterId) {
          case (?cid) m.chapterId == cid;
          case null true;
        };
        let fromOk = switch (fromDate) {
          case (?fd) m.date >= fd;
          case null true;
        };
        let toOk = switch (toDate) {
          case (?td) m.date <= td;
          case null true;
        };
        chapterOk and fromOk and toOk;
      },
    );

    filtered.map<AttendanceTypes.Meeting, AttendanceReportRow>(
      func(meeting) {
        let records = AttendanceLib.getAttendanceByMeeting(attendanceState, meeting.id);
        let totalAttendees = records.size();
        var absentCount : Nat = 0;
        for (r in records.vals()) {
          switch (r.status) {
            case (#absent) { absentCount += 1 };
            case (#present) {};
          };
        };
        let presentCount : Nat = if (totalAttendees >= absentCount) totalAttendees - absentCount else 0;
        let attendanceRate : Float = if (totalAttendees == 0) {
          0.0;
        } else {
          presentCount.toFloat() / totalAttendees.toFloat() * 100.0;
        };
        let chapterName = switch (MemberLib.getChapter(memberState, meeting.chapterId)) {
          case (?c) c.name;
          case null "";
        };
        let memberDetails = records.map(
          func(r) {
            let name = switch (MemberLib.getMember(memberState, r.memberId)) {
              case (?mem) mem.name;
              case null "";
            };
            { memberId = r.memberId; memberName = name; status = r.status };
          },
        );
        {
          meetingId = meeting.id;
          meetingTitle = meeting.title;
          meetingDate = meeting.date;
          chapterId = meeting.chapterId;
          chapterName;
          totalAttendees;
          absentCount;
          attendanceRate;
          memberDetails;
        };
      },
    );
  };

};
