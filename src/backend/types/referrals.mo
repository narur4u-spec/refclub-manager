import Common "common";

module {
  public type ReferralId = Common.ReferralId;
  public type MemberId = Common.MemberId;

  public type DealStatus = { #pending; #in_progress; #closed };

  public type Referral = {
    id : ReferralId;
    giverId : MemberId;
    receiverId : MemberId;
    businessCategory : Text;
    dealStatus : DealStatus;
    dealValue : ?Nat;
    notes : Text;
    createdAt : Common.Timestamp;
  };
};
