import Common "common";

module {
  public type MemberId = Common.MemberId;
  public type ChapterId = Common.ChapterId;

  public type Chapter = {
    id : ChapterId;
    name : Text;
    description : Text;
  };

  public type Member = {
    id : MemberId;
    name : Text;
    businessName : Text;
    businessCategory : Text;
    email : Text;
    phone : Text;
    website : Text;
    chapterId : ChapterId;
    isActive : Bool;
    createdAt : Common.Timestamp;
  };
};
