import AttendanceLib "../lib/attendance";
import AttendanceTypes "../types/attendance";
import Common "../types/common";

mixin (state : AttendanceLib.State) {

  public shared func addMeeting(
    title : Text,
    chapterId : Common.ChapterId,
    date : Common.Timestamp,
    location : Text,
    description : Text,
  ) : async AttendanceTypes.Meeting {
    AttendanceLib.addMeeting(state, title, chapterId, date, location, description);
  };

  public shared func updateMeeting(
    id : Common.MeetingId,
    title : Text,
    chapterId : Common.ChapterId,
    date : Common.Timestamp,
    location : Text,
    description : Text,
  ) : async ?AttendanceTypes.Meeting {
    AttendanceLib.updateMeeting(state, id, title, chapterId, date, location, description);
  };

  public shared func deleteMeeting(id : Common.MeetingId) : async Bool {
    AttendanceLib.deleteMeeting(state, id);
  };

  public query func getMeeting(id : Common.MeetingId) : async ?AttendanceTypes.Meeting {
    AttendanceLib.getMeeting(state, id);
  };

  public query func listMeetings() : async [AttendanceTypes.Meeting] {
    AttendanceLib.listMeetings(state);
  };

  public query func listMeetingsByChapter(chapterId : Common.ChapterId) : async [AttendanceTypes.Meeting] {
    AttendanceLib.listMeetingsByChapter(state, chapterId);
  };

  public shared func markAttendance(
    meetingId : Common.MeetingId,
    memberId : Common.MemberId,
    status : AttendanceTypes.AttendanceStatus,
  ) : async AttendanceTypes.AttendanceRecord {
    AttendanceLib.markAttendance(state, meetingId, memberId, status);
  };

  public shared func updateAttendance(
    id : Common.AttendanceId,
    status : AttendanceTypes.AttendanceStatus,
  ) : async ?AttendanceTypes.AttendanceRecord {
    AttendanceLib.updateAttendance(state, id, status);
  };

  public query func getAttendanceByMeeting(meetingId : Common.MeetingId) : async [AttendanceTypes.AttendanceRecord] {
    AttendanceLib.getAttendanceByMeeting(state, meetingId);
  };

  public query func getAttendanceByMember(memberId : Common.MemberId) : async [AttendanceTypes.AttendanceRecord] {
    AttendanceLib.getAttendanceByMember(state, memberId);
  };

};
