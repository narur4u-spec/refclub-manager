import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/members";
import Common "../types/common";

module {
  public type State = {
    members : List.List<Types.Member>;
    chapters : List.List<Types.Chapter>;
    var nextMemberId : Common.MemberId;
  };

  public func addMember(
    state : State,
    name : Text,
    businessName : Text,
    businessCategory : Text,
    email : Text,
    phone : Text,
    website : Text,
    chapterId : Common.ChapterId,
  ) : Types.Member {
    let member : Types.Member = {
      id = state.nextMemberId;
      name;
      businessName;
      businessCategory;
      email;
      phone;
      website;
      chapterId;
      isActive = true;
      createdAt = Time.now();
    };
    state.members.add(member);
    state.nextMemberId += 1;
    member;
  };

  public func updateMember(
    state : State,
    id : Common.MemberId,
    name : Text,
    businessName : Text,
    businessCategory : Text,
    email : Text,
    phone : Text,
    website : Text,
    chapterId : Common.ChapterId,
    isActive : Bool,
  ) : ?Types.Member {
    var updated : ?Types.Member = null;
    state.members.mapInPlace(
      func(m) {
        if (m.id == id) {
          let u : Types.Member = { m with name; businessName; businessCategory; email; phone; website; chapterId; isActive };
          updated := ?u;
          u;
        } else { m };
      }
    );
    updated;
  };

  public func deleteMember(state : State, id : Common.MemberId) : Bool {
    let before = state.members.size();
    let filtered = state.members.filter(func(m) { m.id != id });
    if (filtered.size() < before) {
      state.members.clear();
      state.members.append(filtered);
      true;
    } else {
      false;
    };
  };

  public func getMember(state : State, id : Common.MemberId) : ?Types.Member {
    state.members.find(func(m) { m.id == id });
  };

  public func listMembers(state : State) : [Types.Member] {
    state.members.toArray();
  };

  public func listMembersByChapter(state : State, chapterId : Common.ChapterId) : [Types.Member] {
    state.members.filter(func(m) { m.chapterId == chapterId }).toArray();
  };

  public func getChapter(state : State, id : Common.ChapterId) : ?Types.Chapter {
    state.chapters.find(func(c) { c.id == id });
  };

  public func listChapters(state : State) : [Types.Chapter] {
    state.chapters.toArray();
  };

  public type MemberImport = {
    name : Text;
    businessName : Text;
    businessCategory : Text;
    email : Text;
    phone : Text;
    website : Text;
    chapterId : Common.ChapterId;
  };

  public type ImportResult = {
    imported : Nat;
    skipped : Nat;
    errors : [Text];
  };

  public func bulkImport(state : State, rows : [MemberImport]) : ImportResult {
    var imported : Nat = 0;
    var skipped : Nat = 0;
    let errors = List.empty<Text>();

    for (row in rows.vals()) {
      // Validate non-empty name
      if (row.name == "") {
        errors.add("Row skipped: name is empty");
        skipped += 1;
      } else if (state.chapters.find(func(c) { c.id == row.chapterId }) == null) {
        errors.add("Row skipped: chapterId " # row.chapterId.toText() # " does not exist");
        skipped += 1;
      } else if (row.email != "" and state.members.find(func(m) { m.email == row.email }) != null) {
        errors.add("Row skipped: duplicate email " # row.email);
        skipped += 1;
      } else {
        ignore addMember(state, row.name, row.businessName, row.businessCategory, row.email, row.phone, row.website, row.chapterId);
        imported += 1;
      };
    };

    { imported; skipped; errors = errors.toArray() };
  };
};
