import List "mo:core/List";
import Time "mo:core/Time";
import MsgTypes "../types/messages";
import MemberTypes "../types/members";
import Common "../types/common";

module {
  public type State = {
    messages : List.List<MsgTypes.Message>;
    members : List.List<MemberTypes.Member>;
    var nextMessageId : Common.MessageId;
  };

  public func sendMessage(
    state : State,
    subject : Text,
    body : Text,
    chapterId : ?Common.ChapterId,
  ) : MsgTypes.Message {
    let recipientCount = switch (chapterId) {
      case (?cid) state.members.filter(func(m) { m.chapterId == cid and m.isActive }).size();
      case null state.members.filter(func(m) { m.isActive }).size();
    };
    let msg : MsgTypes.Message = {
      id = state.nextMessageId;
      subject;
      body;
      chapterId;
      sentAt = Time.now();
      recipientCount;
    };
    state.messages.add(msg);
    state.nextMessageId += 1;
    msg;
  };

  public func getMessages(state : State) : [MsgTypes.Message] {
    state.messages.toArray();
  };

  public func getMessage(state : State, id : Common.MessageId) : ?MsgTypes.Message {
    state.messages.find(func(m) { m.id == id });
  };

  public func getDashboardStats(
    state : State,
    meetingCount : Nat,
    referralCount : Nat,
  ) : MsgTypes.DashboardStats {
    {
      memberCount = state.members.filter(func(m) { m.isActive }).size();
      chapterCount = 5;
      meetingCount;
      referralCount;
      messageCount = state.messages.size();
    };
  };
};
