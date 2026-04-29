import MemberLib "../lib/members";

mixin (state : MemberLib.State) {

  public shared func importMembers(members : [MemberLib.MemberImport]) : async MemberLib.ImportResult {
    MemberLib.bulkImport(state, members);
  };

};
