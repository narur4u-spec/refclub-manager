import MessageLib "../lib/messages";
import MessageTypes "../types/messages";
import AttendanceLib "../lib/attendance";
import ReferralLib "../lib/referrals";
import Common "../types/common";

mixin (
  msgState : MessageLib.State,
  attendanceState : AttendanceLib.State,
  referralState : ReferralLib.State,
) {

  public shared func sendMessage(
    subject : Text,
    body : Text,
    chapterId : ?Common.ChapterId,
  ) : async MessageTypes.Message {
    MessageLib.sendMessage(msgState, subject, body, chapterId);
  };

  public query func getMessages() : async [MessageTypes.Message] {
    MessageLib.getMessages(msgState);
  };

  public query func getMessage(id : Common.MessageId) : async ?MessageTypes.Message {
    MessageLib.getMessage(msgState, id);
  };

  public query func getDashboardStats() : async MessageTypes.DashboardStats {
    let meetingCount = attendanceState.meetings.size();
    let referralCount = referralState.referrals.size();
    MessageLib.getDashboardStats(msgState, meetingCount, referralCount);
  };

};
