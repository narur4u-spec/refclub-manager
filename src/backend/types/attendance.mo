import Common "common";

module {
  public type MeetingId = Common.MeetingId;
  public type ChapterId = Common.ChapterId;
  public type MemberId = Common.MemberId;
  public type AttendanceId = Common.AttendanceId;

  public type Meeting = {
    id : MeetingId;
    title : Text;
    chapterId : ChapterId;
    date : Common.Timestamp;
    location : Text;
    description : Text;
  };

  public type AttendanceStatus = { #present; #absent };

  public type AttendanceRecord = {
    id : AttendanceId;
    meetingId : MeetingId;
    memberId : MemberId;
    status : AttendanceStatus;
    markedAt : Common.Timestamp;
  };
};
