import Common "common";

module {
  public type MessageId = Common.MessageId;
  public type ChapterId = Common.ChapterId;

  public type Message = {
    id : MessageId;
    subject : Text;
    body : Text;
    chapterId : ?ChapterId;
    sentAt : Common.Timestamp;
    recipientCount : Nat;
  };

  public type DashboardStats = {
    memberCount : Nat;
    chapterCount : Nat;
    meetingCount : Nat;
    referralCount : Nat;
    messageCount : Nat;
  };
};
