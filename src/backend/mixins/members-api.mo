import List "mo:core/List";
import MemberLib "../lib/members";
import MemberTypes "../types/members";
import Common "../types/common";

mixin (state : MemberLib.State) {

  public query func listChapters() : async [MemberTypes.Chapter] {
    MemberLib.listChapters(state);
  };

  public query func getChapter(id : Common.ChapterId) : async ?MemberTypes.Chapter {
    MemberLib.getChapter(state, id);
  };

  public shared func addMember(
    name : Text,
    businessName : Text,
    businessCategory : Text,
    email : Text,
    phone : Text,
    website : Text,
    chapterId : Common.ChapterId,
  ) : async MemberTypes.Member {
    MemberLib.addMember(state, name, businessName, businessCategory, email, phone, website, chapterId);
  };

  public shared func updateMember(
    id : Common.MemberId,
    name : Text,
    businessName : Text,
    businessCategory : Text,
    email : Text,
    phone : Text,
    website : Text,
    chapterId : Common.ChapterId,
    isActive : Bool,
  ) : async ?MemberTypes.Member {
    MemberLib.updateMember(state, id, name, businessName, businessCategory, email, phone, website, chapterId, isActive);
  };

  public shared func deleteMember(id : Common.MemberId) : async Bool {
    MemberLib.deleteMember(state, id);
  };

  public query func getMember(id : Common.MemberId) : async ?MemberTypes.Member {
    MemberLib.getMember(state, id);
  };

  public query func listMembers() : async [MemberTypes.Member] {
    MemberLib.listMembers(state);
  };

  public query func listMembersByChapter(chapterId : Common.ChapterId) : async [MemberTypes.Member] {
    MemberLib.listMembersByChapter(state, chapterId);
  };

};
