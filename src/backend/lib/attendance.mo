import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/attendance";
import Common "../types/common";

module {
  public type State = {
    meetings : List.List<Types.Meeting>;
    attendance : List.List<Types.AttendanceRecord>;
    var nextMeetingId : Common.MeetingId;
    var nextAttendanceId : Common.AttendanceId;
  };

  public func addMeeting(
    state : State,
    title : Text,
    chapterId : Common.ChapterId,
    date : Common.Timestamp,
    location : Text,
    description : Text,
  ) : Types.Meeting {
    let meeting : Types.Meeting = {
      id = state.nextMeetingId;
      title;
      chapterId;
      date;
      location;
      description;
    };
    state.meetings.add(meeting);
    state.nextMeetingId += 1;
    meeting;
  };

  public func updateMeeting(
    state : State,
    id : Common.MeetingId,
    title : Text,
    chapterId : Common.ChapterId,
    date : Common.Timestamp,
    location : Text,
    description : Text,
  ) : ?Types.Meeting {
    var updated : ?Types.Meeting = null;
    state.meetings.mapInPlace(
      func(m) {
        if (m.id == id) {
          let u : Types.Meeting = { m with title; chapterId; date; location; description };
          updated := ?u;
          u;
        } else { m };
      }
    );
    updated;
  };

  public func deleteMeeting(state : State, id : Common.MeetingId) : Bool {
    let before = state.meetings.size();
    let filtered = state.meetings.filter(func(m) { m.id != id });
    if (filtered.size() < before) {
      state.meetings.clear();
      state.meetings.append(filtered);
      true;
    } else {
      false;
    };
  };

  public func getMeeting(state : State, id : Common.MeetingId) : ?Types.Meeting {
    state.meetings.find(func(m) { m.id == id });
  };

  public func listMeetings(state : State) : [Types.Meeting] {
    state.meetings.toArray();
  };

  public func listMeetingsByChapter(state : State, chapterId : Common.ChapterId) : [Types.Meeting] {
    state.meetings.filter(func(m) { m.chapterId == chapterId }).toArray();
  };

  public func markAttendance(
    state : State,
    meetingId : Common.MeetingId,
    memberId : Common.MemberId,
    status : Types.AttendanceStatus,
  ) : Types.AttendanceRecord {
    let record : Types.AttendanceRecord = {
      id = state.nextAttendanceId;
      meetingId;
      memberId;
      status;
      markedAt = Time.now();
    };
    state.attendance.add(record);
    state.nextAttendanceId += 1;
    record;
  };

  public func updateAttendance(
    state : State,
    id : Common.AttendanceId,
    status : Types.AttendanceStatus,
  ) : ?Types.AttendanceRecord {
    var updated : ?Types.AttendanceRecord = null;
    state.attendance.mapInPlace(
      func(r) {
        if (r.id == id) {
          let u : Types.AttendanceRecord = { r with status };
          updated := ?u;
          u;
        } else { r };
      }
    );
    updated;
  };

  public func getAttendanceByMeeting(state : State, meetingId : Common.MeetingId) : [Types.AttendanceRecord] {
    state.attendance.filter(func(r) { r.meetingId == meetingId }).toArray();
  };

  public func getAttendanceByMember(state : State, memberId : Common.MemberId) : [Types.AttendanceRecord] {
    state.attendance.filter(func(r) { r.memberId == memberId }).toArray();
  };
};
